import { NextResponse } from "next/server";
import { prisma } from "@uma/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      app: "website",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        app: "website",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
