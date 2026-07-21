import { NextResponse } from "next/server";
import { getUnifiedMetrics } from "@/lib/meta/unified-metrics";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/meta/insights — Unified cross-platform metrics.
 * Query: ?period=day|week|days_28 (default: week)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    const validPeriods = ["day", "week", "days_28"];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Use: ${validPeriods.join(", ")}` },
        { status: 400 }
      );
    }

    const metrics = await getUnifiedMetrics(period);

    return NextResponse.json({
      ok: true,
      period,
      ...metrics,
    });
  } catch (error) {
    const message = error.message || "Failed to fetch unified metrics";
    console.error("[Unified Insights API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
