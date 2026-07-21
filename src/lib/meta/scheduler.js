/**
 * Skilizee — Meta Content Scheduler
 *
 * Manages the scheduled posts queue using Firestore (with in-memory/localStorage fallback).
 * Provides functions to schedule, retrieve, cancel, and publish queued posts.
 */

import { publishToInstagram, publishToFacebook } from "./publisher";
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
export async function schedulePost({ caption, platforms, mediaUrl, scheduledAt }) {
  if (!caption) throw new Error("Caption is required");
  if (!platforms || platforms.length === 0) throw new Error("At least one platform is required");
  if (!scheduledAt) throw new Error("Scheduled time (scheduledAt) is required");

  const newPost = {
    id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    caption,
    platforms,
    mediaUrl: mediaUrl || "",
    scheduledAt: new Date(scheduledAt).toISOString(),
    status: "scheduled", // scheduled, publishing, published, failed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
    results: null,
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
 * Retrieve all scheduled posts.
 */
export async function getScheduledPosts() {
  const db = await getFirestore();
  if (db) {
    try {
      const snapshot = await db.collection(SCHEDULED_COLLECTION).orderBy("scheduledAt", "asc").get();
      const posts = [];
      snapshot.forEach((doc) => posts.push(doc.data()));
      return posts;
    } catch (err) {
      console.error("[Scheduler] Firestore read failed:", err.message);
    }
  }

  return [...memoryScheduledPosts].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}

/**
 * Delete a scheduled post by ID (cancel schedule).
 */
export async function deleteScheduledPost(id) {
  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(SCHEDULED_COLLECTION).doc(id).delete();
      return { success: true };
    } catch (err) {
      console.error("[Scheduler] Firestore delete failed:", err.message);
    }
  }

  const initialLength = memoryScheduledPosts.length;
  memoryScheduledPosts = memoryScheduledPosts.filter((p) => p.id !== id);
  if (memoryScheduledPosts.length === initialLength) {
    throw new Error(`Scheduled post with ID ${id} not found.`);
  }

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

  await updateStatus("publishing");

  const results = [];
  const errors = [];

  for (const platform of post.platforms) {
    try {
      let result;
      if (platform === "instagram") {
        if (!post.mediaUrl) throw new Error("Instagram requires a media URL to publish");
        result = await publishToInstagram({ imageUrl: post.mediaUrl, caption: post.caption });
      } else if (platform === "facebook") {
        result = await publishToFacebook({
          message: post.caption,
          imageUrl: post.mediaUrl || undefined,
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
  const allPosts = await getScheduledPosts();
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
