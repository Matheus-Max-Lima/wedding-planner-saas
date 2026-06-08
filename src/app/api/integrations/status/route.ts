import { NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";

export async function GET() {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { wedding } = ctx;

  return NextResponse.json({
    spotify: !!wedding.spotifyAccessToken,
    googleCalendar: !!wedding.googleCalendarAccessToken,
  });
}
