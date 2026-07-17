import { computeAnalytics } from "../crawlers/profile-scraper";
import { getValidAccessToken, getInstagramAccountId } from "./meta-auth";
import { buildGraphUrl, checkRateLimit, trackApiCall } from "./meta-config";

const MEDIA_PAGE_LIMIT = 50;
const MAX_MEDIA_PAGES = 5;
const INSIGHT_METRIC_ATTEMPTS = [
  ["views", "impressions", "reach", "saved", "shares", "total_interactions"],
  ["impressions", "reach", "saved", "shares", "total_interactions"],
  ["impressions", "reach", "saved"],
];

function normalizePermalink(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return String(value).trim().replace(/\/$/, "");
  }
}

async function getInstagramSyncConfig() {
  try {
    const accessToken = await getValidAccessToken();
    const instagramAccountId = await getInstagramAccountId();

    return {
      ready: true,
      missing: [],
      accessToken,
      instagramAccountId,
    };
  } catch (err) {
    const missing = [];
    if (err.message.includes("access token")) missing.push("META_ACCESS_TOKEN");
    if (err.message.includes("Instagram account")) missing.push("META_IG_ACCOUNT_ID");

    return {
      ready: false,
      missing: missing.length > 0 ? missing : ["META_ACCESS_TOKEN", "META_IG_ACCOUNT_ID"],
      accessToken: "",
      instagramAccountId: "",
      error: err.message,
    };
  }
}

async function graphRequest(path, params = {}) {
  const config = getInstagramSyncConfig();
  if (!config.ready) {
    throw new Error(`Missing Meta configuration: ${config.missing.join(", ")}`);
  }

  const url = buildGraphUrl(path, {
    ...params,
    access_token: config.accessToken,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.error) {
    const message = payload?.error?.message || `Meta request failed with status ${response.status}`;
    const err = new Error(message);
    const errCode = payload?.error?.code;
    const errType = payload?.error?.type;
    if (errCode === 190 || errType === "OAuthException") {
      err.metaTokenExpired = true;
    }
    throw err;
  }

  return payload;
}

async function getMediaDetails(mediaId) {
  return graphRequest(`/${mediaId}`, {
    fields: "id,caption,comments_count,like_count,media_product_type,media_type,permalink,timestamp",
  });
}

async function findMediaByPermalink(publishedUrl) {
  const config = getInstagramSyncConfig();
  const targetPermalink = normalizePermalink(publishedUrl);

  let after = "";
  for (let page = 0; page < MAX_MEDIA_PAGES; page += 1) {
    const payload = await graphRequest(`/${config.instagramAccountId}/media`, {
      fields: "id,caption,comments_count,like_count,media_product_type,media_type,permalink,timestamp",
      limit: MEDIA_PAGE_LIMIT,
      after,
    });

    const match = payload?.data?.find((item) => normalizePermalink(item.permalink) === targetPermalink);
    if (match) return match;

    after = payload?.paging?.cursors?.after || "";
    if (!after) break;
  }

  return null;
}

function readInsightMetric(insights = [], metricName) {
  const metric = insights.find((entry) => entry.name === metricName);
  if (!metric) return 0;

  if (Array.isArray(metric.values) && metric.values.length > 0) {
    const rawValue = metric.values[0]?.value;
    return typeof rawValue === "number" ? rawValue : Number(rawValue) || 0;
  }

  return typeof metric.value === "number" ? metric.value : Number(metric.value) || 0;
}

async function getMediaInsights(mediaId) {
  for (const metrics of INSIGHT_METRIC_ATTEMPTS) {
    try {
      const payload = await graphRequest(`/${mediaId}/insights`, {
        metric: metrics.join(","),
      });
      return payload?.data || [];
    } catch {
      // Try the next smaller metric set because metric availability varies by media type.
    }
  }

  return [];
}

export function getInstagramSyncStatus() {
  const config = getInstagramSyncConfig();
  return {
    ready: config.ready,
    missing: config.missing,
    graphVersion: config.graphVersion,
  };
}

export async function syncInstagramPost({ publishedUrl = "", postId = "" } = {}) {
  const normalizedUrl = normalizePermalink(publishedUrl);
  const normalizedPostId = String(postId || "").trim();

  if (!normalizedUrl && !normalizedPostId) {
    throw new Error("Provide an Instagram post URL or media ID.");
  }

  if (normalizedUrl && !normalizedUrl.includes("instagram.com")) {
    throw new Error("Instagram sync requires an instagram.com post URL.");
  }

  const media = normalizedPostId
    ? await getMediaDetails(normalizedPostId)
    : await findMediaByPermalink(normalizedUrl);

  if (!media?.id) {
    throw new Error("Instagram media was not found on the connected account.");
  }

  const insights = await getMediaInsights(media.id);
  const timestamp = new Date().toISOString();
  const views = readInsightMetric(insights, "views") || readInsightMetric(insights, "reach");
  const impressions = readInsightMetric(insights, "impressions") || readInsightMetric(insights, "reach");

  return {
    mediaId: media.id,
    publication: {
      platform: "instagram",
      publishedUrl: media.permalink || normalizedUrl,
      postId: media.id,
      mediaId: media.id,
      publishedAt: media.timestamp || "",
      lastSyncedAt: timestamp,
      syncStatus: "synced",
      syncError: "",
      source: "meta_instagram",
    },
    performance: {
      views,
      clicks: 0,
      likes: Number(media.like_count || 0),
      comments: Number(media.comments_count || 0),
      shares: readInsightMetric(insights, "shares"),
      saves: readInsightMetric(insights, "saved"),
      impressions,
    },
    meta: {
      mediaType: media.media_type || "",
      mediaProductType: media.media_product_type || "",
      availableMetrics: insights.map((entry) => entry.name),
    },
  };
}

export async function fetchInstagramProfileFromMeta(username) {
  const config = getInstagramSyncConfig();
  if (!config.ready) {
    throw new Error(`Missing Meta configuration: ${config.missing.join(", ")}`);
  }

  const cleanUser = String(username || "").toLowerCase().trim().replace(/^@/, "");
  if (!cleanUser) throw new Error("Username is required for Meta profile fetch.");

  // 1. Fetch connected account basic info to confirm username match
  console.log(`[Meta API] Fetching account info for ID: ${config.instagramAccountId}`);
  const userPayload = await graphRequest(`/${config.instagramAccountId}`, {
    fields: "biography,followers_count,follows_count,media_count,name,profile_picture_url,username,website",
  });

  const connectedUsername = String(userPayload.username || "").toLowerCase().trim();
  if (connectedUsername !== cleanUser) {
    throw new Error(`Connected account is @${connectedUsername}, but requested @${cleanUser}`);
  }

  // 2. Fetch recent media posts
  console.log(`[Meta API] Fetching recent media for @${connectedUsername}`);
  const mediaPayload = await graphRequest(`/${config.instagramAccountId}/media`, {
    fields: "caption,comments_count,id,like_count,media_product_type,media_type,media_url,permalink,thumbnail_url,timestamp",
    limit: 12,
  });

  const rawPosts = mediaPayload?.data || [];

  // Map into standard Dashboard post format
  const posts = rawPosts.map((p) => {
    let contentType = "Static Image";
    if (p.media_type === "VIDEO") {
      contentType = "Reel / Video";
    } else if (p.media_type === "CAROUSEL_ALBUM") {
      contentType = "Carousel";
    }

    return {
      id: p.id,
      caption: p.caption || "",
      contentType,
      likes: Number(p.like_count || 0),
      comments: Number(p.comments_count || 0),
      views: 0, // Public views not available without specific organic media insights
      timestamp: p.timestamp || null,
      thumbnail: p.media_url || p.thumbnail_url || "",
      url: p.permalink || "",
      hashtags: (p.caption || "").match(/#[\w]+/g) || [],
      engagementLevel: Number(p.like_count || 0) > 1000 ? "High" : "Medium",
    };
  });

  const profile = {
    username: connectedUsername,
    fullName: userPayload.name || connectedUsername,
    bio: userPayload.biography || "",
    followers: Number(userPayload.followers_count || 0),
    following: Number(userPayload.follows_count || 0),
    postCount: Number(userPayload.media_count || posts.length),
    profilePic: userPayload.profile_picture_url || "",
    isVerified: false,
    externalUrl: userPayload.website || "",
    category: "Business",
  };

  const analysis = computeAnalytics(posts, profile);

  return {
    profile,
    posts,
    analysis,
    source: "Meta Graph API",
  };
}
