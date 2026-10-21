import { NextResponse } from "next/server";
import { prisma } from "@uma/db";
import { razorpayConfigured, razorpayWebhookConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      app: "store",
      database: "connected",
      payments: razorpayConfigured() ? "razorpay-configured" : "cod-only",
      webhook: razorpayWebhookConfigured() ? "configured" : "not-configured",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        app: "store",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
