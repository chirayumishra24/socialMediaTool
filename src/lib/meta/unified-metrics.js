/**
 * Skilizee — Unified Cross-Platform Metrics
 *
 * Normalizes Instagram and Facebook data into a common shape
 * for the dashboard. Computes aggregates, trends, and comparisons.
 */

import { fetchInstagramProfileFromMeta } from "./instagram";
import { fetchFacebookPageProfile, fetchFacebookPagePosts, getPageInsights } from "./facebook";
import { getConnectionStatus } from "./meta-auth";

// ─── Unified Metrics Shape ─────────────────────────────────────

/**
 * Fetch unified metrics across all connected Meta platforms.
 * @param {"day"|"week"|"days_28"} period
 * @returns {Promise<{ platforms: object[], aggregate: object, comparison: object }>}
 */
export async function getUnifiedMetrics(period = "week") {
  const status = await getConnectionStatus();
  const platforms = [];

  // Instagram
  if (status.instagram?.accountId) {
    try {
      const igData = await fetchInstagramMetrics(status.instagram.username);
      platforms.push(igData);
    } catch (err) {
      console.warn("[Unified Metrics] Instagram fetch failed:", err.message);
      platforms.push(createEmptyPlatform("instagram", status.instagram.username));
    }
  }

  // Facebook
  if (status.facebook?.pageId) {
    try {
      const fbData = await fetchFacebookMetrics(status.facebook.pageId, period);
      platforms.push(fbData);
    } catch (err) {
      console.warn("[Unified Metrics] Facebook fetch failed:", err.message);
      platforms.push(createEmptyPlatform("facebook", status.facebook.pageName));
    }
  }

  // Aggregate
  const aggregate = computeAggregate(platforms);
  const comparison = computeComparison(platforms);

  return { platforms, aggregate, comparison };
}

// ─── Instagram Metrics ─────────────────────────────────────────

async function fetchInstagramMetrics(username) {
  const data = await fetchInstagramProfileFromMeta(username);
  const { profile, posts, analysis } = data;

  const totalEngagement = posts.reduce((s, p) => s + p.likes + p.comments, 0);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);

  return {
    platform: "instagram",
    accountName: profile.username,
    displayName: profile.fullName,
    profilePic: profile.profilePic,
    followers: profile.followers,
    following: profile.following,
    postCount: profile.postCount,
    recentPosts: posts.slice(0, 6),
    metrics: {
      totalEngagement,
      totalViews,
      avgLikes: analysis.avgLikes,
      avgComments: analysis.avgComments,
      avgViews: analysis.avgViews,
      engagementRate: parseFloat(analysis.engagementRate) || 0,
      topFormat: analysis.topFormat,
      postingFrequency: analysis.postingFrequency,
    },
    topContent: posts.length > 0
      ? [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 3)
      : [],
    source: data.source || "Meta Graph API",
  };
}

// ─── Facebook Metrics ──────────────────────────────────────────

async function fetchFacebookMetrics(pageId, period) {
  const [profile, posts, insights] = await Promise.all([
    fetchFacebookPageProfile(pageId),
    fetchFacebookPagePosts(pageId, 12),
    getPageInsights(pageId, period).catch(() => ({})),
  ]);

  const totalEngagement = posts.reduce((s, p) => s + p.engagement, 0);
  const avgEngagement = posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0;

  return {
    platform: "facebook",
    accountName: profile.name,
    displayName: profile.name,
    profilePic: profile.profilePic,
    followers: profile.followers,
    likes: profile.likes,
    postCount: posts.length,
    recentPosts: posts.slice(0, 6),
    metrics: {
      totalEngagement,
      avgEngagement,
      impressions: insights.page_impressions?.value || 0,
      reach: insights.page_impressions_unique?.value || 0,
      engagedUsers: insights.page_engaged_users?.value || 0,
      pageViews: insights.page_views_total?.value || 0,
      newFans: insights.page_fan_adds?.value || 0,
      lostFans: insights.page_fan_removes?.value || 0,
      engagementRate: profile.followers > 0
        ? parseFloat(((avgEngagement / profile.followers) * 100).toFixed(2))
        : 0,
    },
    topContent: posts.length > 0
      ? [...posts].sort((a, b) => b.engagement - a.engagement).slice(0, 3)
      : [],
    source: "Meta Graph API",
  };
}

// ─── Aggregate & Comparison ────────────────────────────────────

function computeAggregate(platforms) {
  const totalFollowers = platforms.reduce((s, p) => s + (p.followers || 0), 0);
  const totalEngagement = platforms.reduce((s, p) => s + (p.metrics?.totalEngagement || 0), 0);
  const totalPosts = platforms.reduce((s, p) => s + (p.recentPosts?.length || 0), 0);

  const rates = platforms
    .map((p) => p.metrics?.engagementRate || 0)
    .filter((r) => r > 0);
  const avgEngagementRate = rates.length > 0
    ? parseFloat((rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(2))
    : 0;

  return {
    totalFollowers,
    totalEngagement,
    totalPosts,
    avgEngagementRate,
    platformCount: platforms.length,
  };
}

function computeComparison(platforms) {
  if (platforms.length < 2) return null;

  const ig = platforms.find((p) => p.platform === "instagram");
  const fb = platforms.find((p) => p.platform === "facebook");

  if (!ig || !fb) return null;

  return {
    followers: {
      instagram: ig.followers,
      facebook: fb.followers,
      leader: ig.followers > fb.followers ? "instagram" : "facebook",
    },
    engagement: {
      instagram: ig.metrics?.engagementRate || 0,
      facebook: fb.metrics?.engagementRate || 0,
      leader: (ig.metrics?.engagementRate || 0) > (fb.metrics?.engagementRate || 0)
        ? "instagram"
        : "facebook",
    },
    activity: {
      instagram: ig.recentPosts?.length || 0,
      facebook: fb.recentPosts?.length || 0,
      leader: (ig.recentPosts?.length || 0) > (fb.recentPosts?.length || 0)
        ? "instagram"
        : "facebook",
    },
  };
}

function createEmptyPlatform(platform, name) {
  return {
    platform,
    accountName: name || "",
    displayName: name || "",
    profilePic: "",
    followers: 0,
    following: 0,
    postCount: 0,
    recentPosts: [],
    metrics: {
      totalEngagement: 0,
      engagementRate: 0,
    },
    topContent: [],
    source: "unavailable",
    error: true,
  };
}
