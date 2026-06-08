import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PLANS = {
  pro: {
    name: "Até o Altar Pro",
    amount: 2900, // R$ 29,00 in centavos
    currency: "brl",
  },
  premium: {
    name: "Até o Altar Premium",
    amount: 4900, // R$ 49,00 in centavos
    currency: "brl",
  },
} as const;

type Plan = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error: "Stripe não configurado",
        message: "Configure STRIPE_SECRET_KEY no .env",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const plan = body.plan as Plan;
    const userId = (session.user as any).id as string;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Plano inválido. Use 'pro' ou 'premium'." },
        { status: 400 }
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const planConfig = PLANS[plan];
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: planConfig.currency,
            recurring: { interval: "month" },
            product_data: {
              name: planConfig.name,
              description: `Plano ${plan} — Até o Altar`,
            },
            unit_amount: planConfig.amount,
          },
        },
      ],
      metadata: {
        userId,
        plan,
      },
      success_url: `${baseUrl}/dashboard?payment=success&plan=${plan}`,
      cancel_url: `${baseUrl}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento." }, { status: 500 });
  }
}
