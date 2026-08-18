/**
 * Skilizee — Centralized Meta Platform Configuration (Multi-Account)
 * 
 * Single source of truth for Meta Graph API settings,
 * environment validation, and rate limit tracking.
 * 
 * Supports multiple accounts by reading account-specific env vars.
 */

import { getAccountById, resolveAccountId, DEFAULT_ACCOUNT_ID } from "../accounts";

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

// In-memory rate limit counters per account (reset on server restart)
const rateLimitCounters = {};

function getAccountRateLimitCounters(accountId) {
  if (!rateLimitCounters[accountId]) {
    rateLimitCounters[accountId] = {
      instagram: { count: 0, windowStart: Date.now() },
      facebook: { count: 0, windowStart: Date.now() },
    };
  }
  return rateLimitCounters[accountId];
}

/**
 * Validate and return all Meta environment variables for a given account.
 * @param {string} accountId - Account ID (e.g. "skillizee", "ccis")
 * @returns {{ ready, missing, config }}
 */
export function getMetaConfig(accountId = "skillizee") {
  const account = getAccountById(accountId);
  const prefix = account.metaEnvPrefix;

  const appId = process.env[`${prefix}_APP_ID`] || "";
  const appSecret = process.env[`${prefix}_APP_SECRET`] || "";
  const redirectUri = process.env[`${prefix}_REDIRECT_URI`] || "";
  const accessToken = process.env[`${prefix}_ACCESS_TOKEN`] || "";
  const igAccountId = process.env[`${prefix}_IG_ACCOUNT_ID`] || "";
  const fbPageId = process.env[`${prefix}_FB_PAGE_ID`] || "";
  const graphVersion = process.env[`${prefix}_GRAPH_VERSION`] || DEFAULT_GRAPH_VERSION;

  const missing = [];
  if (!appId) missing.push(`${prefix}_APP_ID`);
  if (!appSecret) missing.push(`${prefix}_APP_SECRET`);

  return {
    ready: missing.length === 0,
    hasToken: !!accessToken,
    missing,
    accountId,
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
export function buildGraphUrl(path, params = {}, version, accountId = "skillizee") {
  const { config } = getMetaConfig(accountId);
  const v = version || config.graphVersion;
  const url = new URL(`${GRAPH_API_BASE}/${v}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

// ─── OAuth state (carries the account id across the Meta round-trip) ───

const STATE_DELIMITER = "~";

/**
 * Encode the account id into the OAuth `state` parameter.
 * Both accounts share one callback URL, so `state` is the only thing that
 * tells the callback which account the user is connecting.
 */
export function buildOAuthState(accountId, nonce = "") {
  const acct = resolveAccountId(accountId);
  return `${acct}${STATE_DELIMITER}${nonce || Date.now()}`;
}

/**
 * Decode the account id from an OAuth `state` value.
 * Unknown or malformed state falls back to the default account.
 */
export function parseOAuthState(state) {
  if (!state || typeof state !== "string") return DEFAULT_ACCOUNT_ID;
  return resolveAccountId(state.split(STATE_DELIMITER)[0]);
}

/**
 * Get the OAuth login URL for Meta.
 */
export function getOAuthLoginUrl(nonce = "", accountId = DEFAULT_ACCOUNT_ID) {
  const acct = resolveAccountId(accountId);
  const { config } = getMetaConfig(acct);
  const prefix = getAccountById(acct).metaEnvPrefix;

  if (!config.appId || !config.redirectUri) {
    throw new Error(
      `${acct}: ${prefix}_APP_ID and ${prefix}_REDIRECT_URI are required for OAuth`
    );
  }

  const url = new URL(`https://www.facebook.com/${config.graphVersion}/dialog/oauth`);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", REQUIRED_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", buildOAuthState(acct, nonce));

  return url.toString();
}

/**
 * Check and track rate limits for a given platform and account.
 * @param {"instagram"|"facebook"} platform
 * @param {string} accountId
 * @returns {{ allowed: boolean, remaining: number, resetsIn: number }}
 */
export function checkRateLimit(platform, accountId = "skillizee") {
  const limit = RATE_LIMITS[platform];
  if (!limit) return { allowed: true, remaining: Infinity, resetsIn: 0 };

  const counters = getAccountRateLimitCounters(accountId);
  const counter = counters[platform];
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
 * Increment the rate limit counter for a platform and account.
 */
export function trackApiCall(platform, accountId = "skillizee") {
  const counters = getAccountRateLimitCounters(accountId);
  const counter = counters[platform];
  if (counter) counter.count += 1;
}

export { REQUIRED_SCOPES, RATE_LIMITS, GRAPH_API_BASE, DEFAULT_GRAPH_VERSION };
