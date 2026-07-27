/**
 * Skilizee — AI Content Calendar Agent
 *
 * Pipeline: Meta Deep Insights → Analytics Snapshot → Trend Computation → AI Prompt → Calendar Output
 *
 * Generates a data-driven weekly content calendar with:
 * - Format recommendations (Reel / Carousel / Story / Static) backed by real reach data
 * - Optimal posting times from the online_followers heatmap
 * - Topic suggestions extracted from top-performing post captions
 * - Hashtag strategy based on hashtag-performance correlation
 */

import { generate } from "./ai-client.js";
import {
  fetchAccountInsights,
  fetchAudienceDemographics,
  fetchAllPostsWithDeepInsights,
  buildOptimalPostingHeatmap,
} from "../meta/deep-insights.js";
import {
  saveAnalyticsSnapshot,
  getRecentSnapshots,
  computeTrends,
  buildSnapshotFromInsights,
} from "../meta/analytics-store.js";

// ─── Main Pipeline ─────────────────────────────────────────────

/**
 * Full pipeline: fetch deep insights → build snapshot → compute trends → generate AI calendar.
 * @param {{ niche?: string, goals?: string[], postsLimit?: number, period?: string, startDate?: string, endDate?: string, postsPerWeek?: number }} options
 * @returns {Promise<object>} — The generated content calendar
 */
export async function generateContentCalendar(options = {}) {
  const {
    niche = "General",
    goals = ["Grow followers", "Increase engagement", "Drive traffic"],
    postsLimit = 50,
    period = "days_28",
    startDate,
    endDate,
    postsPerWeek = 5,
  } = options;

  console.log("[Calendar Agent] Starting content calendar pipeline...");

  // Step 1: Fetch all deep insights in parallel
  console.log("[Calendar Agent] Step 1: Fetching deep insights...");
  const [accountInsights, demographics, postsWithInsights] = await Promise.all([
    fetchAccountInsights(period).catch((err) => {
      console.warn("[Calendar Agent] Account insights failed:", err.message);
      return {};
    }),
    fetchAudienceDemographics().catch((err) => {
      console.warn("[Calendar Agent] Demographics failed:", err.message);
      return { available: false };
    }),
    fetchAllPostsWithDeepInsights(postsLimit).catch((err) => {
      console.warn("[Calendar Agent] Posts insights failed:", err.message);
      return [];
    }),
  ]);

  // Step 2: Build and save analytics snapshot
  console.log("[Calendar Agent] Step 2: Building analytics snapshot...");
  const snapshot = buildSnapshotFromInsights(accountInsights, postsWithInsights, demographics);
  await saveAnalyticsSnapshot(snapshot).catch((err) =>
    console.warn("[Calendar Agent] Snapshot save failed:", err.message)
  );

  // Step 3: Compute trends from historical snapshots
  console.log("[Calendar Agent] Step 3: Computing trends...");
  const recentSnapshots = await getRecentSnapshots(4);
  const trendData = computeTrends(recentSnapshots);

  // Step 4: Build optimal posting heatmap
  console.log("[Calendar Agent] Step 4: Building posting heatmap...");
  const heatmap = buildOptimalPostingHeatmap(demographics?.onlineFollowers || {});

  // Step 5: Extract topic clusters from top posts
  console.log("[Calendar Agent] Step 5: Extracting topic clusters...");
  const topicClusters = extractTopicClusters(postsWithInsights);

  // Step 6: Compute date range
  const { rangeStart, rangeEnd, totalDays } = computeDateRange(startDate, endDate);
  const totalPosts = Math.round((totalDays / 7) * postsPerWeek);

  // Step 7: Generate AI calendar
  console.log(`[Calendar Agent] Step 7: Generating AI calendar (${rangeStart} → ${rangeEnd}, ${totalPosts} posts)...`);
  const prompt = buildCalendarPrompt({
    snapshot,
    trends: trendData,
    demographics,
    heatmap,
    topicClusters,
    niche,
    goals,
    rangeStart,
    rangeEnd,
    totalPosts,
  });

  const aiOutput = await generate(prompt, { tier: "pro", jsonMode: true, maxRetries: 2 });
  const calendar = parseCalendarResponse(aiOutput);

  console.log("[Calendar Agent] Pipeline complete.");

  return {
    ...calendar,
    _meta: {
      generatedAt: new Date().toISOString(),
      postsAnalyzed: postsWithInsights.length,
      snapshotsUsed: recentSnapshots.length,
      trendsAvailable: trendData.available,
      demographicsAvailable: demographics?.available || false,
      heatmapAvailable: heatmap.available,
      rangeStart,
      rangeEnd,
      totalPostsRequested: totalPosts,
    },
  };
}

/**
 * Compute the date range for calendar generation.
 * Defaults to upcoming Monday → Sunday if not specified.
 */
function computeDateRange(startDate, endDate) {
  const now = new Date();

  let rangeStart, rangeEnd;

  if (startDate) {
    rangeStart = startDate;
  } else {
    // Default: next Monday
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    rangeStart = nextMonday.toISOString().slice(0, 10);
  }

  if (endDate) {
    rangeEnd = endDate;
  } else {
    // Default: 6 days after start (1 week)
    const start = new Date(rangeStart);
    start.setDate(start.getDate() + 6);
    rangeEnd = start.toISOString().slice(0, 10);
  }

  const totalDays = Math.max(1, Math.round((new Date(rangeEnd) - new Date(rangeStart)) / (1000 * 60 * 60 * 24)) + 1);

  return { rangeStart, rangeEnd, totalDays };
}

// ─── Topic Cluster Extraction ──────────────────────────────────

/**
 * Extract recurring topic themes from post captions.
 * Groups by keyword frequency and correlates with engagement.
 * @param {object[]} posts — posts with insights
 * @returns {object[]} — sorted topic clusters
 */
export function extractTopicClusters(posts) {
  if (!posts || posts.length === 0) return [];

  // Stopwords to ignore
  const stopwords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "and", "but", "or", "nor",
    "not", "no", "so", "if", "this", "that", "these", "those", "it", "its",
    "my", "your", "our", "their", "his", "her", "me", "you", "we", "they",
    "i", "he", "she", "what", "which", "who", "how", "when", "where", "why",
    "all", "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "than", "too", "very", "just", "don", "now", "here", "there",
    "about", "up", "down", "get", "got", "like", "also", "back", "make",
    "let", "know", "want", "need", "see", "use", "new", "one", "two",
  ]);

  // Extract meaningful words from captions
  const wordPerformance = {};

  for (const post of posts) {
    const caption = (post.caption || "").toLowerCase();
    // Remove hashtags, mentions, URLs, and emojis for word extraction
    const cleaned = caption
      .replace(/#[\w]+/g, "")
      .replace(/@[\w]+/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^\w\s]/g, " ")
      .trim();

    const words = cleaned
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopwords.has(w));

    const uniqueWords = [...new Set(words)];
    const engagement = post.insights?.totalInteractions || post.likes + post.comments || 0;
    const reach = post.insights?.reach || 0;

    for (const word of uniqueWords) {
      if (!wordPerformance[word]) {
        wordPerformance[word] = { count: 0, totalEngagement: 0, totalReach: 0, posts: [] };
      }
      wordPerformance[word].count += 1;
      wordPerformance[word].totalEngagement += engagement;
      wordPerformance[word].totalReach += reach;
      wordPerformance[word].posts.push(post.id);
    }
  }

  // Filter words that appear in at least 2 posts and sort by avg engagement
  const clusters = Object.entries(wordPerformance)
    .filter(([, data]) => data.count >= 2)
    .map(([word, data]) => ({
      topic: word,
      frequency: data.count,
      avgEngagement: Math.round(data.totalEngagement / data.count),
      avgReach: Math.round(data.totalReach / data.count),
      totalReach: data.totalReach,
      postCount: data.posts.length,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 20);

  return clusters;
}

// ─── AI Prompt Builder ─────────────────────────────────────────

/**
 * Construct the comprehensive AI prompt with all available data.
 */
export function buildCalendarPrompt({ snapshot, trends, demographics, heatmap, topicClusters, niche, goals, rangeStart, rangeEnd, totalPosts }) {
  const cb = snapshot?.contentBreakdown || {};

  // Format comparison table
  const formatTable = [
    `| Format   | Count | Avg Reach | Avg Engagement | Avg Saves | Avg Shares |`,
    `|----------|-------|-----------|----------------|-----------|------------|`,
    `| Reels    | ${cb.reels?.count || 0} | ${cb.reels?.avgReach || 0} | ${cb.reels?.avgEngagement || 0} | ${cb.reels?.avgSaves || 0} | ${cb.reels?.avgShares || 0} |`,
    `| Carousel | ${cb.carousels?.count || 0} | ${cb.carousels?.avgReach || 0} | ${cb.carousels?.avgEngagement || 0} | ${cb.carousels?.avgSaves || 0} | ${cb.carousels?.avgShares || 0} |`,
    `| Static   | ${cb.static?.count || 0} | ${cb.static?.avgReach || 0} | ${cb.static?.avgEngagement || 0} | ${cb.static?.avgSaves || 0} | N/A |`,
  ].join("\n");

  // Top posts
  const topPostsText = (snapshot?.topPosts || [])
    .map((p, i) => `${i + 1}. [${p.format}] Engagement: ${p.engagement} | Reach: ${p.reach} | Saves: ${p.saved} | "${p.caption}"`)
    .join("\n");

  // Top hashtags by avg reach
  const hashtagEntries = Object.entries(snapshot?.hashtags || {})
    .sort((a, b) => b[1].avgReach - a[1].avgReach)
    .slice(0, 15);
  const hashtagText = hashtagEntries
    .map(([tag, data]) => `${tag}: used ${data.count}x, avg reach ${data.avgReach}, avg engagement ${data.avgEngagement}`)
    .join("\n");

  // Topics
  const topicsText = topicClusters
    .slice(0, 10)
    .map((t) => `"${t.topic}": appears in ${t.frequency} posts, avg engagement ${t.avgEngagement}, avg reach ${t.avgReach}`)
    .join("\n");

  // Posting time data
  const bestHoursText = heatmap.available
    ? `Best hours: ${heatmap.bestHours.map((h) => `${h}:00`).join(", ")} | Best days: ${heatmap.bestDays.join(", ")}`
    : "Posting time data unavailable — use general best practices (9am, 12pm, 6pm)";

  // Trends
  const trendsText = trends.available
    ? trends.summary
    : "No historical trends available (first snapshot).";

  // Demographics
  let demoText = "Demographics unavailable.";
  if (demographics?.available) {
    const topCities = Object.entries(demographics.city || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topCountries = Object.entries(demographics.country || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    demoText = `Top cities: ${topCities.map(([c, v]) => `${c} (${v})`).join(", ")}
Top countries: ${topCountries.map(([c, v]) => `${c} (${v})`).join(", ")}`;
  }

  return `You are an elite social media strategist building a CONTENT CALENDAR from ${rangeStart} to ${rangeEnd}.

═══ REAL PERFORMANCE DATA (FROM META GRAPH API) ═══

Account Metrics (Last 28 Days):
- Reach: ${snapshot?.account?.reach_28d || "N/A"}
- Profile Views (7d): ${snapshot?.account?.profileViews_7d || "N/A"}
- Website Clicks (7d): ${snapshot?.account?.websiteClicks_7d || "N/A"}
- Total Posts Analyzed: ${snapshot?.totalPostsAnalyzed || 0}

═══ FORMAT PERFORMANCE COMPARISON ═══

${formatTable}

═══ TOP 5 PERFORMING POSTS ═══

${topPostsText || "No post data available."}

═══ HASHTAG PERFORMANCE ═══

${hashtagText || "No hashtag data available."}

═══ RECURRING CONTENT TOPICS (BY ENGAGEMENT) ═══

${topicsText || "No topic clusters detected."}

═══ OPTIMAL POSTING TIMES ═══

${bestHoursText}

═══ WEEK-OVER-WEEK TRENDS ═══

${trendsText}

═══ AUDIENCE DEMOGRAPHICS ═══

${demoText}

═══ CONTEXT ═══

- Content Niche: ${niche}
- Goals: ${goals.join(", ")}

═══ YOUR TASK ═══

Using ONLY the real data above, generate a content calendar with EXACTLY ${totalPosts} posts spread across ${rangeStart} to ${rangeEnd}.

Every recommendation MUST reference specific data points from the metrics above.

For EACH calendar entry you MUST include a "description" field:
- For Carousel: a slide-by-slide breakdown (Slide 1: ..., Slide 2: ..., etc.)
- For Reel: the topic angle, key talking points, and visual suggestions
- For Static: the image concept and key message
- For Story: the sequence and interactive elements (polls, questions, etc.)

Return your response as a JSON object with EXACTLY this structure:

{
  "rangeStart": "${rangeStart}",
  "rangeEnd": "${rangeEnd}",
  "insights": {
    "bestFormat": "The format with highest avg reach from the table above",
    "bestPostingHours": [9, 12, 18],
    "bestDays": ["Tuesday", "Thursday", "Saturday"],
    "trendingTopics": ["topic1", "topic2", "topic3"],
    "hashtagsToUse": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "audiencePeak": "e.g. Tue & Thu 6-9 PM IST",
    "formatInsight": "One sentence on which format is winning and why"
  },
  "calendar": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "slot": "HH:MM",
      "format": "Reel | Carousel | Static | Story",
      "topic": "Specific post topic title",
      "description": "Detailed content breakdown — slide-by-slide for carousels, talking points for reels, image concept for static",
      "hook": "Opening hook text (first 3 sec for Reels, first slide for Carousels)",
      "caption": "Full caption draft with hashtags and CTA",
      "hashtags": ["#tag1", "#tag2"],
      "pillar": "Content pillar name",
      "estimatedReach": 5200,
      "reasoning": "Why this format + topic + time based on YOUR data"
    }
  ],
  "formatDistribution": {
    "reels": { "count": 3, "reasoning": "Based on real data comparison" },
    "carousels": { "count": 2, "reasoning": "Based on real data comparison" },
    "stories": { "count": 7, "reasoning": "Based on real data comparison" },
    "static": { "count": 1, "reasoning": "Based on real data comparison" }
  },
  "weeklyGoals": [
    { "metric": "Reach", "target": "number", "reasoning": "Based on trend data" },
    { "metric": "Engagement Rate", "target": "percentage", "reasoning": "Based on trend data" }
  ]
}

CRITICAL RULES:
1. The calendar array MUST have exactly ${totalPosts} entries spread across the date range ${rangeStart} to ${rangeEnd}.
2. Each date must be a real date within the range.
3. Space posts evenly — avoid putting all posts on adjacent days.
4. All "reasoning" fields must cite specific numbers from the data above.
5. "estimatedReach" should be based on the avg reach of that format from the table.
6. The "description" field is MANDATORY and must be detailed (at least 2-3 sentences).
7. Return ONLY valid JSON. No markdown, no explanation.`;
}

// ─── Response Parser ───────────────────────────────────────────

/**
 * Normalize and validate the AI output.
 */
export function parseCalendarResponse(aiOutput) {
  const data = typeof aiOutput === "string" ? JSON.parse(aiOutput) : aiOutput;

  return {
    rangeStart: data.rangeStart || data.weekStarting || "",
    rangeEnd: data.rangeEnd || "",
    generatedAt: new Date().toISOString(),
    insights: {
      bestFormat: data.insights?.bestFormat || "Reel",
      bestPostingHours: Array.isArray(data.insights?.bestPostingHours)
        ? data.insights.bestPostingHours
        : [9, 12, 18],
      bestDays: Array.isArray(data.insights?.bestDays)
        ? data.insights.bestDays
        : ["Tuesday", "Thursday", "Saturday"],
      trendingTopics: Array.isArray(data.insights?.trendingTopics)
        ? data.insights.trendingTopics
        : [],
      hashtagsToUse: Array.isArray(data.insights?.hashtagsToUse)
        ? data.insights.hashtagsToUse
        : [],
      audiencePeak: data.insights?.audiencePeak || "",
      formatInsight: data.insights?.formatInsight || "",
    },
    calendar: Array.isArray(data.calendar)
      ? data.calendar.map((entry) => ({
          day: entry.day || "",
          date: entry.date || "",
          slot: entry.slot || "12:00",
          format: entry.format || "Reel",
          topic: entry.topic || "",
          description: entry.description || "",
          hook: entry.hook || "",
          caption: entry.caption || "",
          hashtags: Array.isArray(entry.hashtags) ? entry.hashtags : [],
          pillar: entry.pillar || "",
          estimatedReach: Number(entry.estimatedReach) || 0,
          reasoning: entry.reasoning || "",
        }))
      : [],
    formatDistribution: data.formatDistribution || {},
    weeklyGoals: Array.isArray(data.weeklyGoals) ? data.weeklyGoals : [],
  };
}
