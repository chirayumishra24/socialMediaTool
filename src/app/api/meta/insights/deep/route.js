/**
 * GET /api/meta/insights/deep
 *
 * Fetch full deep insights: account-level metrics, audience demographics,
 * posts with per-post insights, and the optimal posting heatmap.
 *
 * Query params:
 *   period = "day" | "week" | "days_28" (default "days_28")
 *   postsLimit = number (default 50, max 50)
 */

import { NextResponse } from "next/server";
import {
  fetchAccountInsights,
  fetchAudienceDemographics,
  fetchAllPostsWithDeepInsights,
  buildOptimalPostingHeatmap,
} from "@/lib/meta/deep-insights";
import {
  saveAnalyticsSnapshot,
  getRecentSnapshots,
  computeTrends,
  buildSnapshotFromInsights,
} from "@/lib/meta/analytics-store";
import { resolveAccountId } from "@/lib/accounts";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "days_28";
    const postsLimit = Math.min(Number(searchParams.get("postsLimit")) || 50, 50);
    const accountId = resolveAccountId(searchParams.get("accountId"));

    // Fetch everything in parallel
    const [accountInsights, demographics, postsWithInsights] = await Promise.all([
      fetchAccountInsights(period, accountId).catch((err) => {
        console.warn("[Deep Insights API] Account insights:", err.message);
        return {};
      }),
      fetchAudienceDemographics(accountId).catch((err) => {
        console.warn("[Deep Insights API] Demographics:", err.message);
        return { available: false };
      }),
      fetchAllPostsWithDeepInsights(postsLimit, accountId).catch((err) => {
        console.warn("[Deep Insights API] Posts insights:", err.message);
        return [];
      }),
    ]);

    // Build heatmap
    const heatmap = buildOptimalPostingHeatmap(demographics?.onlineFollowers || {});

    // Build and save snapshot
    const snapshot = buildSnapshotFromInsights(accountInsights, postsWithInsights, demographics);
    await saveAnalyticsSnapshot(snapshot).catch(() => {});

    // Compute trends
    const recentSnapshots = await getRecentSnapshots(4);
    const trends = computeTrends(recentSnapshots);

    return NextResponse.json({
      success: true,
      accountInsights,
      demographics: demographics?.available ? demographics : null,
      posts: postsWithInsights,
      heatmap,
      snapshot,
      trends,
      meta: {
        period,
        postsAnalyzed: postsWithInsights.length,
        snapshotsAvailable: recentSnapshots.length,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[Deep Insights API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.metaTokenExpired ? 401 : 500 }
    );
  }
}
