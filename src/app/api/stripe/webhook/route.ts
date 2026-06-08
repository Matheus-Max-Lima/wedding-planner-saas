import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Raw body is needed for Stripe signature verification.
// In Next.js 16 App Router, request.text() / arrayBuffer() gives the raw body.
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe não configurado" },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não configurado" },
      { status: 503 }
    );
  }

  let event;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { userId?: string; plan?: string };
          customer?: string;
          subscription?: string;
        };

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.warn("[stripe/webhook] checkout.session.completed: missing userId or plan in metadata");
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : undefined,
          },
        });

        console.log(`[stripe/webhook] User ${userId} upgraded to plan: ${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as { id: string; customer?: string };

        // Find user by stripeSubscriptionId or stripeCustomerId
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              ...(typeof subscription.customer === "string"
                ? [{ stripeCustomerId: subscription.customer }]
                : []),
            ],
          },
          select: { id: true },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "free",
              stripeSubscriptionId: null,
            },
          });
          console.log(`[stripe/webhook] User ${user.id} reverted to free plan`);
        } else {
          console.warn("[stripe/webhook] customer.subscription.deleted: no user found for subscription", subscription.id);
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge and ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
