/**
 * Skilizee — Facebook Pages API Integration
 *
 * Manages Facebook Page data: profile, posts, insights, and publishing.
 * Uses Meta Graph API v22.0 via the centralized auth layer.
 */

import { getValidAccessToken, getFacebookPageCredentials } from "./meta-auth";
import { buildGraphUrl, checkRateLimit, trackApiCall } from "./meta-config";

// ─── Helper: Facebook Graph Request ────────────────────────────

async function fbGraphRequest(path, params = {}, usePageToken = true) {
  const rateCheck = checkRateLimit("facebook");
  if (!rateCheck.allowed) {
    throw new Error(
      `Facebook API rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetsIn / 60000)} minutes.`
    );
  }
  trackApiCall("facebook");

  let accessToken;
  if (usePageToken) {
    const creds = await getFacebookPageCredentials();
    accessToken = creds.pageAccessToken;
  } else {
    accessToken = await getValidAccessToken();
  }

  const url = buildGraphUrl(path, {
    ...params,
    access_token: accessToken,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.error) {
    const message =
      payload?.error?.message || `Facebook API failed with status ${response.status}`;
    const err = new Error(message);
    if (payload?.error?.code === 190 || payload?.error?.type === "OAuthException") {
      err.metaTokenExpired = true;
    }
    throw err;
  }

  return payload;
}

// ─── Page Profile ──────────────────────────────────────────────

/**
 * Fetch Facebook Page profile information.
 */
export async function fetchFacebookPageProfile(pageId) {
  const id = pageId || (await getFacebookPageCredentials()).pageId;

  const data = await fbGraphRequest(`/${id}`, {
    fields: [
      "id",
      "name",
      "category",
      "category_list",
      "about",
      "description",
      "fan_count",
      "followers_count",
      "cover",
      "picture{url}",
      "website",
      "link",
      "verification_status",
      "emails",
    ].join(","),
  });

  return {
    pageId: data.id,
    name: data.name || "",
    category: data.category || "",
    categories: (data.category_list || []).map((c) => c.name),
    about: data.about || data.description || "",
    followers: data.followers_count || data.fan_count || 0,
    likes: data.fan_count || 0,
    coverPhoto: data.cover?.source || "",
    profilePic: data.picture?.data?.url || "",
    website: data.website || "",
    pageUrl: data.link || `https://www.facebook.com/${data.id}`,
    isVerified: data.verification_status === "blue_verified",
    emails: data.emails || [],
  };
}

// ─── Page Posts ─────────────────────────────────────────────────

/**
 * Fetch recent Facebook Page posts with engagement metrics.
 */
export async function fetchFacebookPagePosts(pageId, limit = 12) {
  const id = pageId || (await getFacebookPageCredentials()).pageId;

  const data = await fbGraphRequest(`/${id}/posts`, {
    fields: [
      "id",
      "message",
      "created_time",
      "type",
      "status_type",
      "permalink_url",
      "full_picture",
      "shares",
      "likes.summary(true).limit(0)",
      "comments.summary(true).limit(0)",
      "reactions.summary(true).limit(0)",
    ].join(","),
    limit: Math.min(limit, 25),
  });

  return (data.data || []).map((post) => {
    const likes = post.likes?.summary?.total_count || 0;
    const comments = post.comments?.summary?.total_count || 0;
    const shares = post.shares?.count || 0;
    const reactions = post.reactions?.summary?.total_count || 0;

    let contentType = "Text Post";
    if (post.type === "video") contentType = "Video";
    else if (post.type === "photo") contentType = "Photo";
    else if (post.type === "link") contentType = "Link Share";
    else if (post.type === "event") contentType = "Event";
    else if (post.status_type === "shared_story") contentType = "Shared Story";

    return {
      id: post.id,
      message: post.message || "",
      contentType,
      likes,
      comments,
      shares,
      reactions,
      engagement: likes + comments + shares,
      timestamp: post.created_time || null,
      thumbnail: post.full_picture || "",
      url: post.permalink_url || "",
      hashtags: (post.message || "").match(/#[\w]+/g) || [],
      engagementLevel:
        reactions > 1000
          ? "Very High"
          : reactions > 200
          ? "High"
          : reactions > 50
          ? "Medium"
          : "Low",
    };
  });
}

// ─── Page Insights ─────────────────────────────────────────────

/**
 * Fetch Page-level insights for a given period.
 * @param {string} pageId
 * @param {"day"|"week"|"days_28"} period
 * @param {string[]} metrics - Optional override; defaults to common engagement metrics.
 */
export async function getPageInsights(pageId, period = "week", metrics) {
  const id = pageId || (await getFacebookPageCredentials()).pageId;

  const defaultMetrics = [
    "page_impressions",
    "page_impressions_unique",
    "page_engaged_users",
    "page_post_engagements",
    "page_fan_adds",
    "page_fan_removes",
    "page_views_total",
  ];

  const metricList = metrics || defaultMetrics;

  try {
    const data = await fbGraphRequest(`/${id}/insights`, {
      metric: metricList.join(","),
      period,
    });

    const result = {};
    (data.data || []).forEach((metric) => {
      const latestValue = metric.values?.[metric.values.length - 1];
      result[metric.name] = {
        value: latestValue?.value || 0,
        endTime: latestValue?.end_time || null,
        title: metric.title || metric.name,
        description: metric.description || "",
      };
    });

    return result;
  } catch (err) {
    // Some metrics may not be available for all page types
    console.warn("[Facebook] Page insights error:", err.message);
    return {};
  }
}

/**
 * Fetch insights for a specific Facebook post.
 */
export async function getPostInsights(postId) {
  const metrics = [
    "post_impressions",
    "post_impressions_unique",
    "post_engaged_users",
    "post_clicks",
    "post_reactions_like_total",
  ];

  try {
    const data = await fbGraphRequest(`/${postId}/insights`, {
      metric: metrics.join(","),
    });

    const result = {};
    (data.data || []).forEach((metric) => {
      const latestValue = metric.values?.[metric.values.length - 1];
      result[metric.name] = latestValue?.value || 0;
    });

    return {
      impressions: result.post_impressions || 0,
      reach: result.post_impressions_unique || 0,
      engagedUsers: result.post_engaged_users || 0,
      clicks: result.post_clicks || 0,
      reactions: result.post_reactions_like_total || 0,
    };
  } catch (err) {
    console.warn("[Facebook] Post insights error:", err.message);
    return { impressions: 0, reach: 0, engagedUsers: 0, clicks: 0, reactions: 0 };
  }
}
