const GRAPH_BASE_URL = "https://graph.facebook.com";
const DEFAULT_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v22.0";
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

function buildGraphUrl(path, params = {}) {
  const url = new URL(`${GRAPH_BASE_URL}/${DEFAULT_GRAPH_VERSION}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function getInstagramSyncConfig() {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const instagramAccountId = process.env.META_IG_ACCOUNT_ID;
  const missing = [];

  if (!accessToken) missing.push("META_ACCESS_TOKEN");
  if (!instagramAccountId) missing.push("META_IG_ACCOUNT_ID");

  return {
    ready: missing.length === 0,
    missing,
    accessToken,
    instagramAccountId,
    graphVersion: DEFAULT_GRAPH_VERSION,
  };
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
    throw new Error(message);
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
