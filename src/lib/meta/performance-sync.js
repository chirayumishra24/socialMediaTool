/**
 * Skilizee — Performance Sync Engine
 *
 * Synchronizes metrics from Meta (Instagram & Facebook Pages)
 * back to the local content items storage.
 */

import { getInstagramSyncStatus, syncInstagramPost } from "./instagram";
import { getPostInsights } from "./facebook";
import { getValidAccessToken } from "./meta-auth";

/**
 * Sync metrics for a list of content items.
 * @param {Array} contentItems - List of content items from storage
 * @param {Function} updateContentTrackingFn - Function to update tracking details
 */
export async function syncPublishedContentMetrics(contentItems, updateContentTrackingFn) {
  if (!contentItems || contentItems.length === 0) return { syncedCount: 0, errors: [] };

  // Filter items that are published and have a platform + published URL/post ID
  const publishedItems = contentItems.filter(
    (item) =>
      item.status === "published" &&
      item.publication?.platform &&
      (item.publication?.postId || item.publication?.publishedUrl)
  );

  console.log(`[Performance Sync] Syncing metrics for ${publishedItems.length} published items...`);

  let syncedCount = 0;
  const errors = [];

  for (const item of publishedItems) {
    const platform = item.publication.platform.toLowerCase();
    const postId = item.publication.postId;
    const publishedUrl = item.publication.publishedUrl;

    try {
      if (platform === "instagram") {
        const syncStatus = await getInstagramSyncStatus();
        if (syncStatus.ready) {
          console.log(`[Performance Sync] Syncing Instagram post: ${postId || publishedUrl}`);
          const res = await syncInstagramPost({ publishedUrl, postId });
          if (res?.performance) {
            updateContentTrackingFn(item.id, {
              publication: {
                ...item.publication,
                lastSyncedAt: new Date().toISOString(),
                syncStatus: "success",
                syncError: null,
              },
              performance: {
                ...item.performance,
                ...res.performance,
              },
            });
            syncedCount++;
          }
        }
      } else if (platform === "facebook" && postId) {
        console.log(`[Performance Sync] Syncing Facebook post ID: ${postId}`);
        const fbInsights = await getPostInsights(postId);
        if (fbInsights) {
          updateContentTrackingFn(item.id, {
            publication: {
              ...item.publication,
              lastSyncedAt: new Date().toISOString(),
              syncStatus: "success",
              syncError: null,
            },
            performance: {
              ...item.performance,
              views: fbInsights.impressions || fbInsights.reach || 0,
              clicks: fbInsights.clicks || 0,
              likes: fbInsights.reactions || 0,
              ctr: fbInsights.impressions > 0
                ? parseFloat(((fbInsights.clicks / fbInsights.impressions) * 100).toFixed(2))
                : 0,
            },
          });
          syncedCount++;
        }
      }
    } catch (err) {
      console.warn(`[Performance Sync] Failed to sync ${platform} post ${item.id}:`, err.message);
      errors.push({ itemId: item.id, platform, error: err.message });
      updateContentTrackingFn(item.id, {
        publication: {
          ...item.publication,
          syncStatus: "error",
          syncError: err.message,
        },
      });
    }
  }

  return { syncedCount, errors };
}
