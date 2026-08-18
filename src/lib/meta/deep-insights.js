/**
 * Skilizee — Deep Meta Insights Extractor
 *
 * Pulls ALL available insight keys from the Meta Graph API
 * that the basic instagram.js / facebook.js modules leave on the table.
 *
 * - Account-level IG insights (reach, impressions, follower growth, profile views, etc.)
 * - Audience demographics (city, country, gender-age, online hours)
 * - Post-level deep insights (watch time for Reels, saves, shares breakdowns)
 * - Facebook Page deep insights (content activity, video views, fans online)
 */

import { graphRequest, getInstagramSyncConfig } from "./instagram";
import { buildGraphUrl, checkRateLimit, trackApiCall } from "./meta-config";
import { getFacebookPageCredentials } from "./meta-auth";

// ─── Account-Level Instagram Insights ──────────────────────────

// v22.0: Metrics compatible with period (time-series)
// Note: reach supports days_28/week/day; follower_count ONLY supports day
const METRIC_PERIOD_MAP = {
  reach: ["days_28", "week", "day"],
  follower_count: ["day"],
};

// Metrics compatible with metric_type=total_value
// accounts_engaged, total_interactions, views support days_28/week/day
// profile_views, website_clicks, profile_links_taps support day
const TOTAL_VALUE_METRIC_CONFIGS = [
  { metric: "reach", period: "days_28" },
  { metric: "accounts_engaged", period: "days_28" },
  { metric: "total_interactions", period: "days_28" },
  { metric: "views", period: "days_28" },
  { metric: "profile_views", period: "day" },
  { metric: "website_clicks", period: "day" },
  { metric: "profile_links_taps", period: "day" },
  { metric: "likes", period: "day" },
  { metric: "comments", period: "day" },
  { metric: "shares", period: "day" },
  { metric: "saves", period: "day" },
];

// v22.0: audience_city/country/gender_age replaced by demographic breakdowns
const AUDIENCE_BREAKDOWN_METRICS = [
  { metric: "follower_demographics", breakdown: "city", key: "city" },
  { metric: "follower_demographics", breakdown: "country", key: "country" },
  { metric: "follower_demographics", breakdown: "age,gender", key: "genderAge" },
];

// online_followers is incompatible with metric_type=total_value, fetched separately
const ONLINE_FOLLOWERS_METRIC = "online_followers";

/**
 * Fetch account-level periodic insights (reach, follower count, engagement, etc.)
 * @param {"day"|"week"|"days_28"} period
 * @returns {Promise<object>}
 */
export async function fetchAccountInsights(period = "days_28", accountId = "skillizee") {
  const config = await getInstagramSyncConfig(accountId);
  if (!config.ready) {
    throw new Error(`Missing Meta configuration: ${config.missing.join(", ")}`);
  }

  const results = {};

  // Group 1: Time-series reach metric
  try {
    const payload = await graphRequest(
      `/${config.instagramAccountId}/insights`,
      { metric: "reach", period }
    );

    for (const entry of payload?.data || []) {
      const latestValue = entry.values?.[entry.values.length - 1];
      results[entry.name] = {
        value: latestValue?.value ?? 0,
        endTime: latestValue?.end_time || null,
        title: entry.title || entry.name,
        description: entry.description || "",
        period: entry.period || period,
        timeSeries: (entry.values || []).map((v) => ({
          value: v.value ?? 0,
          endTime: v.end_time || null,
        })),
      };
    }
  } catch (err) {
    console.warn(`[Deep Insights] Reach time-series failed:`, err.message);
  }

  // Follower count (Meta Graph API requires period=day)
  try {
    const payload = await graphRequest(
      `/${config.instagramAccountId}/insights`,
      { metric: "follower_count", period: "day" }
    );

    for (const entry of payload?.data || []) {
      const latestValue = entry.values?.[entry.values.length - 1];
      results["follower_count"] = {
        value: latestValue?.value ?? 0,
        endTime: latestValue?.end_time || null,
        title: entry.title || "Follower Count",
        description: entry.description || "",
        period: "day",
        timeSeries: (entry.values || []).map((v) => ({
          value: v.value ?? 0,
          endTime: v.end_time || null,
        })),
      };
    }
  } catch (err) {
    console.warn(`[Deep Insights] Follower count time-series skipped:`, err.message);
  }

  // Group 2: Total value metrics (queried individually with their supported periods)
  for (const { metric, period: metricPeriod } of TOTAL_VALUE_METRIC_CONFIGS) {
    try {
      const effectivePeriod = (period === "days_28" && metricPeriod === "day") ? "day" : (period || metricPeriod);
      const payload = await graphRequest(
        `/${config.instagramAccountId}/insights`,
        { metric, period: effectivePeriod, metric_type: "total_value" }
      );

      for (const entry of payload?.data || []) {
        const totalVal = entry.total_value?.value ?? 0;
        results[entry.name] = {
          value: totalVal,
          title: entry.title || entry.name,
          description: entry.description || "",
          period: entry.period || effectivePeriod,
        };
      }
    } catch {
      // Gracefully ignore individual metrics unsupported on specific account types
    }
  }

  return results;
}

/**
 * Fetch audience demographics (city, country, gender-age, online hours).
 * Requires IG Business account with 100+ followers.
 * @returns {Promise<{ city: object, country: object, genderAge: object, onlineFollowers: object }>}
 */
export async function fetchAudienceDemographics(accountId = "skillizee") {
  const config = await getInstagramSyncConfig(accountId);
  if (!config.ready) {
    throw new Error(`Missing Meta configuration: ${config.missing.join(", ")}`);
  }

  const demographics = {
    city: {},
    country: {},
    genderAge: {},
    onlineFollowers: {},
    available: false,
  };

  // v22.0: Use metric_type=total_value with breakdowns for demographics
  for (const { metric, breakdown, key } of AUDIENCE_BREAKDOWN_METRICS) {
    try {
      const params = { metric, period: "lifetime", metric_type: "total_value" };
      if (breakdown) {
        params.breakdown = breakdown;
      }

      const payload = await graphRequest(
        `/${config.instagramAccountId}/insights`,
        params
      );

      const entry = payload?.data?.[0];
      if (!entry) continue;

      // v22.0 returns total_value with breakdowns in results array
      const totalValue = entry.total_value;
      if (totalValue?.breakdowns?.[0]?.results) {
        // Convert breakdowns to { dimension_value: value } map
        const resultMap = {};
        for (const r of totalValue.breakdowns[0].results) {
          const dimKey = r.dimension_values?.join(".") || r.dimension_values?.[0] || "unknown";
          resultMap[dimKey] = r.value;
        }
        demographics[key] = resultMap;
        demographics.available = true;
      } else if (totalValue?.value !== undefined) {
        demographics[key] = totalValue.value;
        demographics.available = true;
      } else {
        // Fallback: try legacy values array
        const latestValue = entry.values?.[entry.values.length - 1]?.value;
        if (latestValue) {
          demographics[key] = latestValue;
          demographics.available = true;
        }
      }
    } catch (err) {
      console.warn(`[Deep Insights] ${key} unavailable:`, err.message);
    }
  }

  // online_followers: incompatible with metric_type=total_value — fetch with period=lifetime only
  try {
    const payload = await graphRequest(
      `/${config.instagramAccountId}/insights`,
      { metric: ONLINE_FOLLOWERS_METRIC, period: "lifetime" }
    );

    const entry = payload?.data?.[0];
    if (entry) {
      const latestValue = entry.values?.[entry.values.length - 1]?.value;
      if (latestValue) {
        demographics.onlineFollowers = latestValue;
        demographics.available = true;
      }
    }
  } catch (err) {
    console.warn(`[Deep Insights] onlineFollowers unavailable:`, err.message);
  }

  return demographics;
}

// ─── Post-Level Deep Insights ──────────────────────────────────

const POST_METRICS_IMAGE = ["reach", "saves", "total_interactions", "views"];
const POST_METRICS_VIDEO = ["reach", "saves", "shares", "total_interactions", "views"];
const POST_METRICS_REEL = [
  "reach", "saves", "shares", "total_interactions",
  "plays", "ig_reels_avg_watch_time", "ig_reels_video_view_total_time", "views",
];
const POST_METRICS_CAROUSEL = ["reach", "saves", "shares", "total_interactions", "views"];

/**
 * Fetch deep insights for a single post, adapting metrics by media type.
 * @param {string} mediaId
 * @param {string} mediaType — "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
 * @param {string} mediaProductType — "REELS" | "FEED" | etc.
 * @returns {Promise<object>}
 */
export async function fetchDeepPostInsights(mediaId, mediaType, mediaProductType) {
  const isReel = mediaProductType === "REELS" || mediaProductType === "REEL";
  const isVideo = mediaType === "VIDEO" && !isReel;
  const isCarousel = mediaType === "CAROUSEL_ALBUM";

  // Choose metric set by format
  let metricSets;
  if (isReel) {
    metricSets = [POST_METRICS_REEL, POST_METRICS_VIDEO, POST_METRICS_IMAGE];
  } else if (isVideo) {
    metricSets = [POST_METRICS_VIDEO, POST_METRICS_IMAGE];
  } else if (isCarousel) {
    metricSets = [POST_METRICS_CAROUSEL, POST_METRICS_IMAGE];
  } else {
    metricSets = [POST_METRICS_IMAGE];
  }

  // Try each metric set (fallback on error — API availability varies)
  for (const metrics of metricSets) {
    try {
      const payload = await graphRequest(`/${mediaId}/insights`, {
        metric: metrics.join(","),
      });

      const result = {};
      for (const entry of payload?.data || []) {
        const val = Array.isArray(entry.values) && entry.values.length > 0
          ? entry.values[0]?.value
          : entry.value;
        result[entry.name] = typeof val === "number" ? val : Number(val) || 0;
      }
      return result;
    } catch {
      // Try next smaller metric set
    }
  }

  return {};
}

/**
 * Fetch all recent posts along with their deep insights.
 * @param {number} limit — max posts to fetch (default 50)
 * @returns {Promise<Array<{ post: object, insights: object }>>}
 */
export async function fetchAllPostsWithDeepInsights(limit = 50, accountId = "skillizee") {
  const config = await getInstagramSyncConfig(accountId);
  if (!config.ready) {
    throw new Error(`Missing Meta configuration: ${config.missing.join(", ")}`);
  }

  // Fetch media list
  const mediaPayload = await graphRequest(`/${config.instagramAccountId}/media`, {
    fields: "id,caption,comments_count,like_count,media_product_type,media_type,media_url,permalink,thumbnail_url,timestamp",
    limit: Math.min(limit, 50),
  });

  const posts = mediaPayload?.data || [];
  const enriched = [];

  for (const post of posts) {
    const insights = await fetchDeepPostInsights(
      post.id,
      post.media_type,
      post.media_product_type
    );

    const isReel = post.media_product_type === "REELS" || post.media_product_type === "REEL";
    const isCarousel = post.media_type === "CAROUSEL_ALBUM";
    const format = isReel ? "Reel" : isCarousel ? "Carousel" : "Static";

    enriched.push({
      id: post.id,
      caption: post.caption || "",
      format,
      mediaType: post.media_type || "",
      mediaProductType: post.media_product_type || "",
      likes: Number(post.like_count || 0),
      comments: Number(post.comments_count || 0),
      permalink: post.permalink || "",
      thumbnail: post.thumbnail_url || post.media_url || "",
      timestamp: post.timestamp || null,
      hashtags: (post.caption || "").match(/#[\w]+/g) || [],
      insights: {
        reach: insights.reach || 0,
        saved: insights.saves || insights.saved || 0,
        shares: insights.shares || 0,
        totalInteractions: insights.total_interactions || 0,
        videoViews: insights.views || insights.plays || 0,
        avgWatchTime: insights.ig_reels_avg_watch_time || 0,
        totalWatchTime: insights.ig_reels_video_view_total_time || 0,
      },
    });
  }

  return enriched;
}

// ─── Optimal Posting Heatmap ───────────────────────────────────

/**
 * Build a 7-day × 24-hour heatmap of when followers are most active.
 * Input: `online_followers` from audience demographics — { "0": 450, "1": 320, ... }
 * Output: { heatmap, bestHours, bestDays }
 *
 * @param {object} onlineFollowers — hour-indexed follower activity
 * @returns {{ heatmap: number[][], bestHours: number[], bestDays: string[] }}
 */
export function buildOptimalPostingHeatmap(onlineFollowers) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (!onlineFollowers || Object.keys(onlineFollowers).length === 0) {
    return { heatmap: [], bestHours: [9, 12, 18], bestDays: ["Tuesday", "Thursday", "Saturday"], available: false };
  }

  // online_followers data is keyed by hour (0-23) with follower counts
  const hourValues = Array.from({ length: 24 }, (_, h) => {
    const key = String(h);
    return Number(onlineFollowers[key]) || 0;
  });

  // Find top hours (where follower count > 75th percentile)
  const sorted = [...hourValues].sort((a, b) => b - a);
  const p75 = sorted[Math.floor(sorted.length * 0.25)] || 0;
  const bestHours = hourValues
    .map((val, hour) => ({ hour, val }))
    .filter((h) => h.val >= p75)
    .sort((a, b) => b.val - a.val)
    .slice(0, 5)
    .map((h) => h.hour);

  // Build a 7×24 heatmap (synthesized — Meta only gives hourly, not per-day)
  // We approximate using hourly data repeated across days with slight weekday/weekend weighting
  const heatmap = DAYS.map((day, dayIdx) => {
    const isWeekend = dayIdx >= 5;
    const dayMultiplier = isWeekend ? 0.85 : 1.0; // Weekend slightly lower

    return hourValues.map((val) => Math.round(val * dayMultiplier));
  });

  // Best days: synthesize from heatmap row totals
  const dayTotals = heatmap.map((row, i) => ({ day: DAYS[i], total: row.reduce((s, v) => s + v, 0) }));
  dayTotals.sort((a, b) => b.total - a.total);
  const bestDays = dayTotals.slice(0, 3).map((d) => d.day);

  return { heatmap, bestHours, bestDays, available: true };
}

// ─── Facebook Deep Insights ────────────────────────────────────

const FB_DEEP_METRICS = [
  "page_posts_impressions",
  "page_video_views",
  "page_content_activity_by_action_type_unique",
  "page_fans_online",
];

/**
 * Fetch deep Facebook Page insights.
 * @param {"day"|"week"|"days_28"} period
 * @returns {Promise<object>}
 */
export async function fetchFacebookDeepInsights(period = "week", accountId = "skillizee") {
  const rateCheck = checkRateLimit("facebook", accountId);
  if (!rateCheck.allowed) {
    throw new Error("Facebook API rate limit exceeded.");
  }

  const { pageId, pageAccessToken } = await getFacebookPageCredentials(accountId);

  const results = {};

  try {
    trackApiCall("facebook", accountId);
    const url = buildGraphUrl(`/${pageId}/insights`, {
      metric: FB_DEEP_METRICS.join(","),
      period,
      access_token: pageAccessToken,
    }, undefined, accountId);

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const payload = await res.json();

    for (const entry of payload?.data || []) {
      const latestValue = entry.values?.[entry.values.length - 1];
      results[entry.name] = {
        value: latestValue?.value ?? 0,
        endTime: latestValue?.end_time || null,
        title: entry.title || entry.name,
      };
    }
  } catch (err) {
    console.warn("[Deep Insights] Facebook deep metrics failed:", err.message);
  }

  return results;
}
