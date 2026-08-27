/**
 * Skilizee — Meta Content Scheduler
 *
 * Manages the scheduled posts queue using Firestore (with in-memory/localStorage fallback).
 * Provides functions to schedule, retrieve, cancel, and publish queued posts.
 */

import { publishToInstagram, publishToFacebook, validateMediaUrl } from "./publisher";
import { saveTokenData, getTokenData } from "./meta-auth";

const SCHEDULED_COLLECTION = "scheduled_posts";

// In-memory fallback
let memoryScheduledPosts = [];

// Helper to get Firestore DB reference
let firestoreDb = null;
async function getFirestore() {
  if (firestoreDb) return firestoreDb;
  try {
    const { getApps, getApp, initializeApp, cert } = await import("firebase-admin/app");
    const { getFirestore: getFs } = await import("firebase-admin/firestore");

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) return null;

    const apps = getApps();
    const app = apps.length > 0 ? getApp() : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });

    firestoreDb = getFs(app);
    return firestoreDb;
  } catch {
    return null;
  }
}

/**
 * Schedule a new post.
 * @param {{ caption: string, platforms: string[], mediaUrl?: string, scheduledAt: string }} post
 */
export async function schedulePost({ caption, platforms, mediaUrl, scheduledAt, accountId = "skillizee" }) {
  if (!caption) throw new Error("Caption is required");
  if (!platforms || platforms.length === 0) throw new Error("At least one platform is required");
  if (!scheduledAt) throw new Error("Scheduled time (scheduledAt) is required");

  const newPost = {
    id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    caption,
    platforms,
    mediaUrl: mediaUrl || "",
    scheduledAt: new Date(scheduledAt).toISOString(),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
    results: null,
    accountId,
  };

  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(SCHEDULED_COLLECTION).doc(newPost.id).set(newPost);
      console.log(`[Scheduler] Post scheduled in Firestore for ${newPost.scheduledAt}`);
      return newPost;
    } catch (err) {
      console.error("[Scheduler] Firestore write failed:", err.message);
    }
  }

  // Fallback to memory
  memoryScheduledPosts.push(newPost);
  console.log(`[Scheduler] Post scheduled in memory for ${newPost.scheduledAt}`);
  return newPost;
}

/**
 * Retrieve scheduled posts for one account.
 * Posts written before multi-account support have no `accountId` and are
 * treated as belonging to the default account.
 * Pass accountId = null to retrieve every account's queue (cron sweeps only).
 */
export async function getScheduledPosts(accountId = "skillizee") {
  const belongsToAccount = (p) =>
    accountId === null || (p.accountId || "skillizee") === accountId;

  const db = await getFirestore();
  if (db) {
    try {
      const snapshot = await db.collection(SCHEDULED_COLLECTION).orderBy("scheduledAt", "asc").get();
      const posts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (belongsToAccount(data)) posts.push(data);
      });
      return posts;
    } catch (err) {
      console.error("[Scheduler] Firestore read failed:", err.message);
    }
  }

  return memoryScheduledPosts
    .filter(belongsToAccount)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}

/**
 * Delete a scheduled post by ID (cancel schedule).
 * When accountId is given, the post must belong to that account — this stops
 * one account from cancelling another account's queued posts.
 */
export async function deleteScheduledPost(id, accountId = null) {
  const db = await getFirestore();
  if (db) {
    try {
      const ref = db.collection(SCHEDULED_COLLECTION).doc(id);
      if (accountId) {
        const doc = await ref.get();
        if (!doc.exists) throw new Error(`Scheduled post with ID ${id} not found.`);
        if ((doc.data().accountId || "skillizee") !== accountId) {
          throw new Error(`Scheduled post ${id} does not belong to account ${accountId}.`);
        }
      }
      await ref.delete();
      return { success: true };
    } catch (err) {
      // Ownership/not-found errors are real answers — surface them, don't fall through.
      if (!/Firestore|network|deadline/i.test(err.message)) throw err;
      console.error("[Scheduler] Firestore delete failed:", err.message);
    }
  }

  const target = memoryScheduledPosts.find((p) => p.id === id);
  if (!target) throw new Error(`Scheduled post with ID ${id} not found.`);
  if (accountId && (target.accountId || "skillizee") !== accountId) {
    throw new Error(`Scheduled post ${id} does not belong to account ${accountId}.`);
  }
  memoryScheduledPosts = memoryScheduledPosts.filter((p) => p.id !== id);

  return { success: true };
}

/**
 * Publish a single scheduled post immediately.
 */
export async function executeScheduledPost(id) {
  const db = await getFirestore();
  let post = null;

  if (db) {
    try {
      const doc = await db.collection(SCHEDULED_COLLECTION).doc(id).get();
      if (doc.exists) post = doc.data();
    } catch (err) {
      console.error("[Scheduler] Failed to get scheduled post details:", err.message);
    }
  } else {
    post = memoryScheduledPosts.find((p) => p.id === id);
  }

  if (!post) {
    throw new Error(`Scheduled post ${id} not found`);
  }

  if (post.status !== "scheduled" && post.status !== "failed") {
    throw new Error(`Post is currently in status: ${post.status}. Cannot republish.`);
  }

  // Update status to publishing
  const updateStatus = async (status, extra = {}) => {
    const updated = {
      ...post,
      status,
      updatedAt: new Date().toISOString(),
      ...extra,
    };

    if (db) {
      await db.collection(SCHEDULED_COLLECTION).doc(id).set(updated, { merge: true });
    } else {
      const idx = memoryScheduledPosts.findIndex((p) => p.id === id);
      if (idx !== -1) memoryScheduledPosts[idx] = updated;
    }
    post = updated;
  };

  // Fail fast on a media URL Meta can never fetch. Older queue entries were
  // written before /api/meta/schedule validated this, so they hold `blob:`
  // handles that would otherwise come back as an opaque Graph API error.
  const badMedia = validateMediaUrl(post.mediaUrl);
  if (badMedia) {
    await updateStatus("failed", { error: badMedia, results: null });
    return post;
  }

  await updateStatus("publishing");

  const results = [];
  const errors = [];

  for (const platform of post.platforms) {
    try {
      let result;
      if (platform === "instagram") {
        if (!post.mediaUrl) throw new Error("Instagram requires a media URL to publish");
        result = await publishToInstagram({ imageUrl: post.mediaUrl, caption: post.caption, accountId: post.accountId });
      } else if (platform === "facebook") {
        result = await publishToFacebook({
          message: post.caption,
          imageUrl: post.mediaUrl || undefined,
          accountId: post.accountId,
        });
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      results.push(result);
    } catch (err) {
      console.error(`[Scheduler] Execution failed on ${platform}:`, err.message);
      errors.push({ platform, error: err.message });
    }
  }

  if (errors.length === post.platforms.length) {
    // All failed
    await updateStatus("failed", {
      error: `All platforms failed: ${errors.map((e) => `${e.platform}: ${e.error}`).join("; ")}`,
      results: null,
    });
  } else if (errors.length > 0) {
    // Partially published
    await updateStatus("published", {
      error: `Partial failure: ${errors.map((e) => `${e.platform}: ${e.error}`).join("; ")}`,
      results,
    });
  } else {
    // Fully published
    await updateStatus("published", {
      error: null,
      results,
    });
  }

  return post;
}

/**
 * Check for pending scheduled posts and publish them.
 * This should be triggered by a system cron job or webhook.
 */
export async function checkAndPublishPending() {
  // null = every account: the cron sweep publishes the whole queue.
  const allPosts = await getScheduledPosts(null);
  const now = new Date();
  const pending = allPosts.filter(
    (post) => post.status === "scheduled" && new Date(post.scheduledAt) <= now
  );

  console.log(`[Scheduler] Checking for pending posts. Found: ${pending.length}`);

  const executed = [];
  for (const post of pending) {
    try {
      console.log(`[Scheduler] Triggering publication for post ${post.id}...`);
      const result = await executeScheduledPost(post.id);
      executed.push({ id: post.id, success: true, result });
    } catch (err) {
      console.error(`[Scheduler] Failed executing post ${post.id}:`, err.message);
      executed.push({ id: post.id, success: false, error: err.message });
    }
  }

  return executed;
}
