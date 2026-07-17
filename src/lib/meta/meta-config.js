/**
 * Skilizee — Centralized Meta Platform Configuration
 * 
 * Single source of truth for Meta Graph API settings,
 * environment validation, and rate limit tracking.
 */

const GRAPH_API_BASE = "https://graph.facebook.com";
const DEFAULT_GRAPH_VERSION = "v22.0";

// Meta API Rate Limits
const RATE_LIMITS = {
  instagram: { callsPerHour: 200, windowMs: 60 * 60 * 1000 },
  facebook: { callsPerDay: 4800, windowMs: 24 * 60 * 60 * 1000 },
};

// Required permissions for full functionality
const REQUIRED_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_read_user_content",
  "public_profile",
];

// In-memory rate limit counters (reset on server restart)
const rateLimitCounters = {
  instagram: { count: 0, windowStart: Date.now() },
  facebook: { count: 0, windowStart: Date.now() },
};

/**
 * Validate and return all Meta environment variables.
 * @returns {{ ready, missing, config }}
 */
export function getMetaConfig() {
  const appId = process.env.META_APP_ID || "";
  const appSecret = process.env.META_APP_SECRET || "";
  const redirectUri = process.env.META_REDIRECT_URI || "";
  const accessToken = process.env.META_ACCESS_TOKEN || "";
  const igAccountId = process.env.META_IG_ACCOUNT_ID || "";
  const fbPageId = process.env.META_FB_PAGE_ID || "";
  const graphVersion = process.env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;

  const missing = [];
  if (!appId) missing.push("META_APP_ID");
  if (!appSecret) missing.push("META_APP_SECRET");

  return {
    ready: missing.length === 0,
    hasToken: !!accessToken,
    missing,
    config: {
      appId,
      appSecret,
      redirectUri,
      accessToken,
      igAccountId,
      fbPageId,
      graphVersion,
      graphBaseUrl: GRAPH_API_BASE,
    },
  };
}

/**
 * Build a full Meta Graph API URL.
 */
export function buildGraphUrl(path, params = {}, version) {
  const { config } = getMetaConfig();
  const v = version || config.graphVersion;
  const url = new URL(`${GRAPH_API_BASE}/${v}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

/**
 * Get the OAuth login URL for Meta.
 */
export function getOAuthLoginUrl(state = "") {
  const { config } = getMetaConfig();

  if (!config.appId || !config.redirectUri) {
    throw new Error("META_APP_ID and META_REDIRECT_URI are required for OAuth");
  }

  const url = new URL("https://www.facebook.com/v22.0/dialog/oauth");
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", REQUIRED_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state || `skilizee_${Date.now()}`);

  return url.toString();
}

/**
 * Check and track rate limits for a given platform.
 * @param {"instagram"|"facebook"} platform
 * @returns {{ allowed: boolean, remaining: number, resetsIn: number }}
 */
export function checkRateLimit(platform) {
  const limit = RATE_LIMITS[platform];
  if (!limit) return { allowed: true, remaining: Infinity, resetsIn: 0 };

  const counter = rateLimitCounters[platform];
  const now = Date.now();
  const elapsed = now - counter.windowStart;

  // Reset window if expired
  if (elapsed >= limit.windowMs) {
    counter.count = 0;
    counter.windowStart = now;
  }

  const maxCalls = limit.callsPerHour || limit.callsPerDay || 200;
  const remaining = Math.max(0, maxCalls - counter.count);
  const resetsIn = Math.max(0, limit.windowMs - elapsed);

  return {
    allowed: counter.count < maxCalls,
    remaining,
    resetsIn,
  };
}

/**
 * Increment the rate limit counter for a platform.
 */
export function trackApiCall(platform) {
  const counter = rateLimitCounters[platform];
  if (counter) counter.count += 1;
}

export { REQUIRED_SCOPES, RATE_LIMITS, GRAPH_API_BASE, DEFAULT_GRAPH_VERSION };
