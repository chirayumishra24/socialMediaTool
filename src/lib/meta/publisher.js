/**
 * Skilizee — Meta Content Publisher
 *
 * Publishes content to Instagram (IG Content Publishing API) and Facebook Pages.
 * Handles the multi-step IG publishing flow (create container → wait → publish).
 */

import { getValidAccessToken, getInstagramAccountId, getFacebookPageCredentials } from "./meta-auth";
import { buildGraphUrl, checkRateLimit, trackApiCall } from "./meta-config";

// ─── Instagram Publishing ──────────────────────────────────────

/**
 * Publish an image or carousel post to Instagram.
 *
 * Flow:
 * 1. Create media container with image URL + caption
 * 2. Poll container status until "FINISHED"
 * 3. Publish the container
 *
 * @param {{ imageUrl: string, caption: string, mediaType?: "IMAGE"|"VIDEO"|"CAROUSEL_ALBUM" }} options
 */
export async function publishToInstagram({ imageUrl, caption, mediaType = "IMAGE", accountId = "skillizee" }) {
  if (!imageUrl) throw new Error("imageUrl is required for Instagram publishing.");
  if (!caption) throw new Error("Caption is required for Instagram publishing.");

  const rateCheck = checkRateLimit("instagram", accountId);
  if (!rateCheck.allowed) {
    throw new Error("Instagram API rate limit exceeded. Try again later.");
  }

  const accessToken = await getValidAccessToken(accountId);
  const igAccountId = await getInstagramAccountId(accountId);

  // Step 1: Create media container
  console.log(`[IG Publisher] [${accountId}] Creating media container...`);
  const containerUrl = buildGraphUrl(`/${igAccountId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  }, undefined, accountId);

  const containerRes = await fetch(containerUrl, { method: "POST", cache: "no-store" });
  const containerData = await containerRes.json();
  trackApiCall("instagram", accountId);

  if (containerData.error) {
    throw new Error(containerData.error.message || "Failed to create media container");
  }

  const containerId = containerData.id;
  console.log(`[IG Publisher] [${accountId}] Container created:`, containerId);

  // Step 2: Wait for container to finish processing
  await waitForContainerReady(containerId, accessToken, 10, 3000, accountId);

  // Step 3: Publish
  console.log(`[IG Publisher] [${accountId}] Publishing container...`);
  const publishUrl = buildGraphUrl(`/${igAccountId}/media_publish`, {
    creation_id: containerId,
    access_token: accessToken,
  }, undefined, accountId);

  const publishRes = await fetch(publishUrl, { method: "POST", cache: "no-store" });
  const publishData = await publishRes.json();
  trackApiCall("instagram", accountId);

  if (publishData.error) {
    throw new Error(publishData.error.message || "Failed to publish media");
  }

  const mediaId = publishData.id;

  // Step 4: Get permalink
  const permalinkUrl = buildGraphUrl(`/${mediaId}`, {
    fields: "permalink",
    access_token: accessToken,
  }, undefined, accountId);
  const permalinkRes = await fetch(permalinkUrl, { cache: "no-store" });
  const permalinkData = await permalinkRes.json();
  trackApiCall("instagram", accountId);

  return {
    platform: "instagram",
    mediaId,
    permalink: permalinkData.permalink || `https://www.instagram.com/p/${mediaId}`,
    containerId,
    publishedAt: new Date().toISOString(),
  };
}

/**
 * Poll container status until ready or timeout.
 */
async function waitForContainerReady(containerId, accessToken, maxAttempts = 10, intervalMs = 3000, accountId = "skillizee") {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const statusUrl = buildGraphUrl(`/${containerId}`, {
      fields: "status_code,status",
      access_token: accessToken,
    }, undefined, accountId);

    const res = await fetch(statusUrl, { cache: "no-store" });
    const data = await res.json();
    trackApiCall("instagram", accountId);

    const status = data.status_code || data.status;
    console.log(`[IG Publisher] Container status (attempt ${i + 1}): ${status}`);

    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Instagram media processing failed with status: ${status}`);
    }
  }

  throw new Error("Instagram media processing timed out. Please try again.");
}

// ─── Facebook Page Publishing ──────────────────────────────────

/**
 * Publish a post to a Facebook Page.
 *
 * @param {{ message: string, link?: string, imageUrl?: string }} options
 */
export async function publishToFacebook({ message, link, imageUrl, accountId = "skillizee" }) {
  if (!message && !link && !imageUrl) {
    throw new Error("At least one of message, link, or imageUrl is required.");
  }

  const rateCheck = checkRateLimit("facebook", accountId);
  if (!rateCheck.allowed) {
    throw new Error("Facebook API rate limit exceeded. Try again later.");
  }

  const { pageId, pageAccessToken } = await getFacebookPageCredentials(accountId);

  let result;

  if (imageUrl) {
    const url = buildGraphUrl(`/${pageId}/photos`, {
      url: imageUrl,
      caption: message || "",
      access_token: pageAccessToken,
    }, undefined, accountId);

    const res = await fetch(url, { method: "POST", cache: "no-store" });
    result = await res.json();
    trackApiCall("facebook", accountId);
  } else {
    const url = buildGraphUrl(`/${pageId}/feed`, {
      message: message || "",
      link: link || undefined,
      access_token: pageAccessToken,
    }, undefined, accountId);

    const res = await fetch(url, { method: "POST", cache: "no-store" });
    result = await res.json();
    trackApiCall("facebook", accountId);
  }

  if (result.error) {
    throw new Error(result.error.message || "Failed to publish to Facebook");
  }

  const postId = result.post_id || result.id;

  return {
    platform: "facebook",
    postId,
    permalink: `https://www.facebook.com/${postId?.replace("_", "/posts/")}`,
    publishedAt: new Date().toISOString(),
  };
}

// ─── Payload Validation ────────────────────────────────────────

/** Platforms this publisher can actually post to. */
export const SUPPORTED_PLATFORMS = ["instagram", "facebook"];

// Hosts Meta's servers cannot reach from the public internet.
const UNREACHABLE_HOSTS = /^(localhost|127\.|0\.0\.0\.0|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i;

/**
 * Check that a media URL is one Meta can actually download.
 *
 * Instagram publishing is not an upload: `POST /{ig-id}/media` takes an
 * `image_url`, and Meta's own servers fetch it. So the URL has to be publicly
 * reachable over http(s) — a `blob:` handle from URL.createObjectURL, a
 * `data:` URI, or anything on localhost exists only in the browser or on this
 * machine, and the container creation fails with an opaque Graph API error.
 *
 * @param {string} mediaUrl
 * @returns {string|null} — error message, or null when the URL is fetchable
 */
export function validateMediaUrl(mediaUrl) {
  if (!mediaUrl) return null;

  if (mediaUrl.startsWith("blob:")) {
    return "That image only exists inside your browser tab (blob: URL). Instagram downloads the file from a public web address, so upload it first or paste a public https:// image URL.";
  }

  if (mediaUrl.startsWith("data:")) {
    return "Inline image data (data: URI) cannot be published. Instagram downloads the file from a public web address — upload it first or paste a public https:// image URL.";
  }

  let parsed;
  try {
    parsed = new URL(mediaUrl);
  } catch {
    return `Media URL is not a valid URL: ${mediaUrl}`;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return `Media URL must be http or https, got "${parsed.protocol}".`;
  }

  if (UNREACHABLE_HOSTS.test(parsed.hostname)) {
    return `Meta's servers cannot reach "${parsed.hostname}" — a local address is not publicly downloadable. Host the image somewhere public first.`;
  }

  return null;
}

/**
 * Validate a publish/schedule payload against the rules the publisher enforces
 * at post time. Shared by /api/meta/publish and /api/meta/schedule so a post
 * can never be queued in a state that is guaranteed to fail on publication.
 *
 * @param {{ caption?: string, platforms?: string[], mediaUrl?: string }} payload
 * @returns {string|null} — error message, or null when the payload is publishable
 */
export function validatePublishPayload({ caption, platforms, mediaUrl }) {
  if (!caption || typeof caption !== "string" || !caption.trim()) {
    return "Caption is required";
  }

  if (!Array.isArray(platforms) || platforms.length === 0) {
    return "At least one platform is required";
  }

  const unsupported = platforms.filter((p) => !SUPPORTED_PLATFORMS.includes(p));
  if (unsupported.length > 0) {
    return `Unsupported platform${unsupported.length > 1 ? "s" : ""}: ${unsupported.join(", ")}. Supported: ${SUPPORTED_PLATFORMS.join(", ")}`;
  }

  if (platforms.includes("instagram") && !mediaUrl) {
    return "Media URL is required to publish to Instagram";
  }

  const unreachable = validateMediaUrl(mediaUrl);
  if (unreachable) return unreachable;

  return null;
}

// ─── Multi-Platform Publish ────────────────────────────────────

/**
 * Publish to multiple platforms simultaneously.
 *
 * @param {{ caption: string, platforms: string[], mediaUrl?: string, scheduledAt?: string }} options
 * @returns {Promise<{ results: object[], errors: object[] }>}
 */
export async function publishToMultiplePlatforms({ caption, platforms, mediaUrl, scheduledAt, accountId = "skillizee" }) {
  if (!caption) throw new Error("Caption is required.");
  if (!platforms?.length) throw new Error("At least one platform must be selected.");

  if (scheduledAt) {
    return { scheduled: true, scheduledAt, platforms };
  }

  const results = [];
  const errors = [];

  for (const platform of platforms) {
    try {
      let result;

      if (platform === "instagram") {
        if (!mediaUrl) throw new Error("Instagram requires an image URL to publish.");
        result = await publishToInstagram({ imageUrl: mediaUrl, caption, accountId });
      } else if (platform === "facebook") {
        result = await publishToFacebook({
          message: caption,
          imageUrl: mediaUrl || undefined,
          accountId,
        });
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      results.push(result);
    } catch (err) {
      console.error(`[Publisher] ${platform} failed:`, err.message);
      errors.push({ platform, error: err.message });
    }
  }

  return { results, errors, urls: results.map((r) => r.permalink) };
}
