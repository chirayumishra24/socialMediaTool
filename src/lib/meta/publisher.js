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
export async function publishToInstagram({ imageUrl, caption, mediaType = "IMAGE" }) {
  if (!imageUrl) throw new Error("imageUrl is required for Instagram publishing.");
  if (!caption) throw new Error("Caption is required for Instagram publishing.");

  const rateCheck = checkRateLimit("instagram");
  if (!rateCheck.allowed) {
    throw new Error("Instagram API rate limit exceeded. Try again later.");
  }

  const accessToken = await getValidAccessToken();
  const igAccountId = await getInstagramAccountId();

  // Step 1: Create media container
  console.log("[IG Publisher] Creating media container...");
  const containerUrl = buildGraphUrl(`/${igAccountId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });

  const containerRes = await fetch(containerUrl, { method: "POST", cache: "no-store" });
  const containerData = await containerRes.json();
  trackApiCall("instagram");

  if (containerData.error) {
    throw new Error(containerData.error.message || "Failed to create media container");
  }

  const containerId = containerData.id;
  console.log("[IG Publisher] Container created:", containerId);

  // Step 2: Wait for container to finish processing
  await waitForContainerReady(containerId, accessToken);

  // Step 3: Publish
  console.log("[IG Publisher] Publishing container...");
  const publishUrl = buildGraphUrl(`/${igAccountId}/media_publish`, {
    creation_id: containerId,
    access_token: accessToken,
  });

  const publishRes = await fetch(publishUrl, { method: "POST", cache: "no-store" });
  const publishData = await publishRes.json();
  trackApiCall("instagram");

  if (publishData.error) {
    throw new Error(publishData.error.message || "Failed to publish media");
  }

  const mediaId = publishData.id;

  // Step 4: Get permalink
  const permalinkUrl = buildGraphUrl(`/${mediaId}`, {
    fields: "permalink",
    access_token: accessToken,
  });
  const permalinkRes = await fetch(permalinkUrl, { cache: "no-store" });
  const permalinkData = await permalinkRes.json();
  trackApiCall("instagram");

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
async function waitForContainerReady(containerId, accessToken, maxAttempts = 10, intervalMs = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const statusUrl = buildGraphUrl(`/${containerId}`, {
      fields: "status_code,status",
      access_token: accessToken,
    });

    const res = await fetch(statusUrl, { cache: "no-store" });
    const data = await res.json();
    trackApiCall("instagram");

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
export async function publishToFacebook({ message, link, imageUrl }) {
  if (!message && !link && !imageUrl) {
    throw new Error("At least one of message, link, or imageUrl is required.");
  }

  const rateCheck = checkRateLimit("facebook");
  if (!rateCheck.allowed) {
    throw new Error("Facebook API rate limit exceeded. Try again later.");
  }

  const { pageId, pageAccessToken } = await getFacebookPageCredentials();

  let result;

  if (imageUrl) {
    // Photo post
    const url = buildGraphUrl(`/${pageId}/photos`, {
      url: imageUrl,
      caption: message || "",
      access_token: pageAccessToken,
    });

    const res = await fetch(url, { method: "POST", cache: "no-store" });
    result = await res.json();
    trackApiCall("facebook");
  } else {
    // Text/link post
    const url = buildGraphUrl(`/${pageId}/feed`, {
      message: message || "",
      link: link || undefined,
      access_token: pageAccessToken,
    });

    const res = await fetch(url, { method: "POST", cache: "no-store" });
    result = await res.json();
    trackApiCall("facebook");
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

// ─── Multi-Platform Publish ────────────────────────────────────

/**
 * Publish to multiple platforms simultaneously.
 *
 * @param {{ caption: string, platforms: string[], mediaUrl?: string, scheduledAt?: string }} options
 * @returns {Promise<{ results: object[], errors: object[] }>}
 */
export async function publishToMultiplePlatforms({ caption, platforms, mediaUrl, scheduledAt }) {
  if (!caption) throw new Error("Caption is required.");
  if (!platforms?.length) throw new Error("At least one platform must be selected.");

  // If scheduling, delegate to scheduler instead
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
        result = await publishToInstagram({ imageUrl: mediaUrl, caption });
      } else if (platform === "facebook") {
        result = await publishToFacebook({
          message: caption,
          imageUrl: mediaUrl || undefined,
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
