/**
 * Skilizee — Analytics Snapshot Storage
 *
 * Persists point-in-time analytics snapshots in Firestore
 * for week-over-week trending and historical AI analysis.
 */

const SNAPSHOTS_COLLECTION = "analytics_snapshots";
const POST_PERFORMANCE_COLLECTION = "post_performance_log";

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

// In-memory fallback
let memorySnapshots = [];
let memoryPostLogs = {};

// ─── Snapshot CRUD ─────────────────────────────────────────────

/**
 * Save a point-in-time analytics snapshot.
 * @param {object} data — The snapshot data
 * @returns {Promise<object>} — The saved snapshot
 */
export async function saveAnalyticsSnapshot(data, accountId = "skillizee") {
  const dateKey = new Date().toISOString().slice(0, 10);
  const snapshot = {
    id: `snap_${accountId}_${dateKey}`,
    accountId,
    timestamp: new Date().toISOString(),
    ...data,
  };

  const db = await getFirestore();
  if (db) {
    try {
      await db.collection(SNAPSHOTS_COLLECTION).doc(snapshot.id).set(snapshot, { merge: true });
      console.log(`[Analytics Store] [${accountId}] Snapshot saved: ${snapshot.id}`);
      return snapshot;
    } catch (err) {
      console.error(`[Analytics Store] [${accountId}] Firestore save failed:`, err.message);
    }
  }

  // Memory fallback — replace if same id, else append
  const existingIdx = memorySnapshots.findIndex((s) => s.id === snapshot.id);
  if (existingIdx >= 0) {
    memorySnapshots[existingIdx] = snapshot;
  } else {
    memorySnapshots.push(snapshot);
  }

  return snapshot;
}

/**
 * Retrieve the most recent N snapshots.
 * @param {number} count — Number of snapshots (default 8)
 * @param {string} accountId — Account identifier
 * @returns {Promise<object[]>}
 */
export async function getRecentSnapshots(count = 8, accountId = "skillizee") {
  const db = await getFirestore();
  if (db) {
    try {
      const snap = await db
        .collection(SNAPSHOTS_COLLECTION)
        .where("accountId", "==", accountId)
        .orderBy("timestamp", "desc")
        .limit(count)
        .get();
      const results = [];
      snap.forEach((doc) => results.push(doc.data()));
      return results;
    } catch (err) {
      console.error(`[Analytics Store] [${accountId}] Firestore read failed:`, err.message);
    }
  }

  return memorySnapshots
    .filter((s) => (s.accountId || "skillizee") === accountId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, count);
}

// ─── Post Performance Logging ──────────────────────────────────

/**
 * Log performance metrics for a specific post (for trend detection).
 * @param {string} mediaId
 * @param {object} metrics — { reach, impressions, saves, shares, ... }
 */
export async function logPostPerformance(mediaId, metrics, accountId = "skillizee") {
  const logEntry = {
    mediaId,
    accountId,
    timestamp: new Date().toISOString(),
    ...metrics,
  };

  const db = await getFirestore();
  if (db) {
    try {
      const docId = `${accountId}_${mediaId}_${new Date().toISOString().slice(0, 10)}`;
      await db.collection(POST_PERFORMANCE_COLLECTION).doc(docId).set(logEntry);
      return logEntry;
    } catch (err) {
      console.error("[Analytics Store] Post log save failed:", err.message);
    }
  }

  // Memory fallback
  const memKey = `${accountId}_${mediaId}`;
  if (!memoryPostLogs[memKey]) memoryPostLogs[memKey] = [];
  memoryPostLogs[memKey].push(logEntry);
  return logEntry;
}

/**
 * Get performance history for a specific post.
 * @param {string} mediaId
 * @param {string} accountId
 * @returns {Promise<object[]>}
 */
export async function getPostPerformanceHistory(mediaId, accountId = "skillizee") {
  const db = await getFirestore();
  if (db) {
    try {
      const snap = await db
        .collection(POST_PERFORMANCE_COLLECTION)
        .where("mediaId", "==", mediaId)
        .where("accountId", "==", accountId)
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();
      const results = [];
      snap.forEach((doc) => results.push(doc.data()));
      return results;
    } catch (err) {
      console.error("[Analytics Store] Post history read failed:", err.message);
    }
  }

  const memKey = `${accountId}_${mediaId}`;
  return (memoryPostLogs[memKey] || []).slice(-30).reverse();
}

// ─── Trend Computation ────────────────────────────────────────

/**
 * Compute week-over-week trends from snapshots.
 * @param {object[]} snapshots — Ordered newest-first
 * @returns {{ trends: object, direction: object }}
 */
export function computeTrends(snapshots) {
  if (!snapshots || snapshots.length < 2) {
    return {
      available: false,
      trends: {},
      direction: {},
      summary: "Not enough data for trend analysis. Need at least 2 weekly snapshots.",
    };
  }

  const current = snapshots[0];
  const previous = snapshots[1];

  const trendKeys = [
    { key: "followers", path: "account.followers" },
    { key: "reach", path: "account.reach_28d" },
    { key: "impressions", path: "account.impressions_28d" },
    { key: "profileViews", path: "account.profileViews_7d" },
    { key: "websiteClicks", path: "account.websiteClicks_7d" },
    { key: "reelAvgReach", path: "contentBreakdown.reels.avgReach" },
    { key: "carouselAvgReach", path: "contentBreakdown.carousels.avgReach" },
    { key: "staticAvgReach", path: "contentBreakdown.static.avgReach" },
    { key: "reelAvgEngagement", path: "contentBreakdown.reels.avgEngagement" },
    { key: "carouselAvgEngagement", path: "contentBreakdown.carousels.avgEngagement" },
  ];

  const trends = {};
  const direction = {};

  for (const { key, path } of trendKeys) {
    const curVal = getNestedValue(current, path) || 0;
    const prevVal = getNestedValue(previous, path) || 0;

    const change = curVal - prevVal;
    const percentChange = prevVal > 0 ? ((change / prevVal) * 100).toFixed(1) : "N/A";

    trends[key] = {
      current: curVal,
      previous: prevVal,
      change,
      percentChange,
    };

    direction[key] = change > 0 ? "up" : change < 0 ? "down" : "flat";
  }

  // Generate human-readable summary
  const summaryParts = [];
  if (direction.followers === "up") summaryParts.push(`Followers grew by ${trends.followers.change}`);
  if (direction.followers === "down") summaryParts.push(`Lost ${Math.abs(trends.followers.change)} followers`);
  if (direction.reelAvgReach === "up") summaryParts.push(`Reel reach up ${trends.reelAvgReach.percentChange}%`);
  if (direction.reelAvgReach === "down") summaryParts.push(`Reel reach down ${trends.reelAvgReach.percentChange}%`);

  return {
    available: true,
    trends,
    direction,
    summary: summaryParts.join(". ") || "Metrics stable — no significant changes.",
    currentSnapshot: current.id,
    previousSnapshot: previous.id,
  };
}

/**
 * Build a complete analytics snapshot from deep insights data.
 * @param {object} accountInsights — from fetchAccountInsights
 * @param {object[]} postsWithInsights — from fetchAllPostsWithDeepInsights
 * @param {object} demographics — from fetchAudienceDemographics
 * @returns {object} — formatted snapshot
 */
export function buildSnapshotFromInsights(accountInsights, postsWithInsights, demographics) {
  const reels = postsWithInsights.filter((p) => p.format === "Reel");
  const carousels = postsWithInsights.filter((p) => p.format === "Carousel");
  const staticPosts = postsWithInsights.filter((p) => p.format === "Static");

  const avgMetric = (posts, key) => {
    if (posts.length === 0) return 0;
    const total = posts.reduce((s, p) => s + (p.insights?.[key] || 0), 0);
    return Math.round(total / posts.length);
  };

  // Hashtag analysis
  const hashtagPerformance = {};
  for (const post of postsWithInsights) {
    for (const tag of post.hashtags) {
      if (!hashtagPerformance[tag]) {
        hashtagPerformance[tag] = { count: 0, totalReach: 0, totalEngagement: 0 };
      }
      hashtagPerformance[tag].count += 1;
      hashtagPerformance[tag].totalReach += post.insights?.reach || 0;
      hashtagPerformance[tag].totalEngagement += post.insights?.totalInteractions || 0;
    }
  }

  // Compute averages for each hashtag
  for (const tag of Object.keys(hashtagPerformance)) {
    const h = hashtagPerformance[tag];
    h.avgReach = h.count > 0 ? Math.round(h.totalReach / h.count) : 0;
    h.avgEngagement = h.count > 0 ? Math.round(h.totalEngagement / h.count) : 0;
  }

  // Posting patterns — day-of-week distribution
  const dayOfWeekCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const hourCounts = Array.from({ length: 24 }, () => 0);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (const post of postsWithInsights) {
    if (post.timestamp) {
      const d = new Date(post.timestamp);
      dayOfWeekCounts[dayNames[d.getDay()]] += 1;
      hourCounts[d.getHours()] += 1;
    }
  }

  // Top 5 posts by engagement
  const topPosts = [...postsWithInsights]
    .sort((a, b) => (b.insights?.totalInteractions || 0) - (a.insights?.totalInteractions || 0))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      format: p.format,
      caption: p.caption.substring(0, 100),
      engagement: p.insights?.totalInteractions || 0,
      reach: p.insights?.reach || 0,
      saved: p.insights?.saved || 0,
      timestamp: p.timestamp,
    }));

  return {
    account: {
      followers: accountInsights?.follower_count?.timeSeries?.[accountInsights.follower_count.timeSeries.length - 1]?.value || 0,
      reach_28d: accountInsights?.reach?.value || 0,
      impressions_28d: accountInsights?.impressions?.value || 0,
      profileViews_7d: accountInsights?.profile_views?.value || 0,
      websiteClicks_7d: accountInsights?.website_clicks?.value || 0,
      emailContacts_7d: accountInsights?.email_contacts?.value || 0,
    },
    contentBreakdown: {
      reels: {
        count: reels.length,
        avgReach: avgMetric(reels, "reach"),
        avgEngagement: avgMetric(reels, "totalInteractions"),
        avgWatchTime: avgMetric(reels, "avgWatchTime"),
        avgSaves: avgMetric(reels, "saved"),
        avgShares: avgMetric(reels, "shares"),
      },
      carousels: {
        count: carousels.length,
        avgReach: avgMetric(carousels, "reach"),
        avgEngagement: avgMetric(carousels, "totalInteractions"),
        avgSaves: avgMetric(carousels, "saved"),
        avgShares: avgMetric(carousels, "shares"),
      },
      static: {
        count: staticPosts.length,
        avgReach: avgMetric(staticPosts, "reach"),
        avgEngagement: avgMetric(staticPosts, "totalInteractions"),
        avgSaves: avgMetric(staticPosts, "saved"),
      },
    },
    topPosts,
    hashtags: hashtagPerformance,
    postingPatterns: {
      dayOfWeek: dayOfWeekCounts,
      hourOfDay: hourCounts,
    },
    audienceDemographics: demographics?.available
      ? {
          topCities: Object.entries(demographics.city || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
          topCountries: Object.entries(demographics.country || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
          genderAge: demographics.genderAge || {},
        }
      : null,
    totalPostsAnalyzed: postsWithInsights.length,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
