import { NextResponse } from "next/server";
import { runResearch } from "@/lib/ai/research-agent";
import { searchYouTube } from "@/lib/crawlers/youtube";
import { searchReddit } from "@/lib/crawlers/reddit";
import { searchX } from "@/lib/crawlers/twitter";
import { searchNews } from "@/lib/crawlers/news";
import { searchInstagram } from "@/lib/crawlers/instagram";
import { getTrends } from "@/lib/crawlers/trends";

export const maxDuration = 300;

const STOPWORDS = new Set([
  "about", "after", "also", "amid", "among", "and", "are", "because", "been", "being",
  "best", "between", "but", "can", "changes", "from", "have", "into", "latest", "more",
  "most", "news", "over", "should", "still", "than", "that", "their", "them", "then",
  "there", "these", "they", "this", "those", "through", "today", "topic", "trends",
  "very", "what", "when", "where", "which", "while", "with", "would", "year", "your",
  "2025", "2026",
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      keyword,
      platforms = ["youtube", "reddit", "x", "news", "instagram"],
      platformTargets = [],
      location = "IN",
      language = "en",
      depth = "deep",
    } = body;
    const cleanKeyword = String(keyword || "").trim();

    if (!cleanKeyword) return NextResponse.json({ error: "Missing keyword" }, { status: 400 });

    // Step 1: Crawl platforms in parallel
    const crawlTasks = [];
    if (platforms.includes("youtube")) crawlTasks.push(searchYouTube(cleanKeyword, process.env.YOUTUBE_API_KEY, 10, language).then((d) => ({ youtube: d })));
    if (platforms.includes("reddit")) crawlTasks.push(searchReddit(cleanKeyword, 8).then((d) => ({ reddit: d })));
    if (platforms.includes("x")) crawlTasks.push(searchX(cleanKeyword).then((d) => ({ x: d })));
    if (platforms.includes("news")) crawlTasks.push(searchNews(cleanKeyword).then((d) => ({ news: d })));
    if (platforms.includes("instagram")) crawlTasks.push(searchInstagram(cleanKeyword).then((d) => ({ instagram: d })));
    crawlTasks.push(getTrends(cleanKeyword, location === "GLOBAL" ? "US" : location).then((d) => ({ trends: d })));

    const crawlResults = await Promise.allSettled(crawlTasks);
    const platformData = {};
    crawlResults.forEach((r) => { if (r.status === "fulfilled") Object.assign(platformData, r.value); });
    const filteredPlatformData = filterPlatformData(platformData, platformTargets);

    // Step 2: Extract top keywords from crawled data
    const topKeywords = extractTopKeywords(cleanKeyword, filteredPlatformData);

    // Step 3: Sort videos by views
    if (filteredPlatformData.youtube) {
      filteredPlatformData.youtube = filteredPlatformData.youtube.sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
    }

    // Step 4: Run AI research with platform data
    const research = await runResearch(cleanKeyword, { location, language, platformData: filteredPlatformData, depth });

    return NextResponse.json({
      research,
      platformData: filteredPlatformData,
      topKeywords,
      meta: {
        keyword: cleanKeyword, location, language, depth,
        platformsCrawled: Object.keys(filteredPlatformData).filter((key) => hasUsefulPlatformData(filteredPlatformData[key])),
        platformTargets,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractTopKeywords(keyword, platformData) {
  const tagMap = {};
  const queryTerms = getQueryTerms(keyword);

  collectKeywordEntries(platformData).forEach((entry) => {
    const haystack = `${entry.title} ${entry.description} ${(entry.tags || []).join(" ")}`.toLowerCase();
    const hasTopicContext = queryTerms.length === 0 || queryTerms.some((term) => haystack.includes(term));
    if (!hasTopicContext) return;

    const words = tokenize(haystack);
    const tokens = new Set([...(entry.tags || []).map(normalizeToken), ...words]);

    tokens.forEach((token) => {
      if (!token || token.length < 3 || STOPWORDS.has(token)) return;
      if (!tagMap[token]) tagMap[token] = { tag: token, totalViews: 0, videoCount: 0, fromTags: false, queryOverlap: 0 };
      tagMap[token].totalViews += entry.weight;
      tagMap[token].videoCount += 1;
      if ((entry.tags || []).some((tag) => normalizeToken(tag) === token)) tagMap[token].fromTags = true;
      if (queryTerms.includes(token)) tagMap[token].queryOverlap += 1;
    });
  });

  return Object.values(tagMap)
    .filter((tag) => tag.videoCount >= 1 && (!queryTerms.length || !queryTerms.includes(tag.tag)))
    .sort((a, b) => {
      if (b.queryOverlap !== a.queryOverlap) return b.queryOverlap - a.queryOverlap;
      return b.totalViews - a.totalViews;
    })
    .slice(0, 20)
    .map((t) => ({
      keyword: t.tag,
      totalViews: t.totalViews,
      appearsIn: t.videoCount,
      isOfficialTag: t.fromTags,
      score: Math.min(100, Math.round(Math.log10(Math.max(t.totalViews, 1)) * 15) + t.queryOverlap * 10),
    }));
}

function collectKeywordEntries(platformData) {
  return [
    ...(platformData.youtube || []).map((video) => ({
      title: video.title || "",
      description: video.description || "",
      tags: video.tags || [],
      weight: Number(video.metrics?.views || 0) + Number(video.metrics?.likes || 0) * 20,
    })),
    ...(platformData.reddit || []).map((post) => ({
      title: post.title || "",
      description: post.description || post.subreddit || "",
      tags: [],
      weight: Number(post.metrics?.likes || 0) * 15 + Number(post.metrics?.comments || 0) * 10,
    })),
    ...(platformData.x || []).map((post) => ({
      title: post.title || post.description || "",
      description: post.description || "",
      tags: extractHashtags(post.title || post.description || ""),
      weight: Number(post.metrics?.likes || 0) * 20 + Number(post.metrics?.retweets || 0) * 25,
    })),
    ...(platformData.instagram || []).map((post) => ({
      title: post.title || post.description || "",
      description: post.description || "",
      tags: extractHashtags(`${post.title || ""} ${post.description || ""}`),
      weight: Number(post.metrics?.likes || 0) * 20 + Number(post.metrics?.comments || 0) * 25,
    })),
    ...(platformData.news || []).map((post) => ({
      title: post.title || "",
      description: post.description || post.author || "",
      tags: [],
      weight: 100,
    })),
    ...((platformData.trends?.related || []).concat(platformData.trends?.trending || []).map((trend) => ({
      title: trend.keyword || "",
      description: trend.traffic || "",
      tags: [],
      weight: trend.isRelevant ? 500 : 150,
    }))),
  ];
}

function getQueryTerms(keyword) {
  return tokenize(String(keyword || ""));
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s#]/g, " ")
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function normalizeToken(token) {
  return String(token || "").toLowerCase().replace(/^#/, "").trim();
}

function extractHashtags(text) {
  return String(text || "").match(/#[a-z0-9_]+/gi) || [];
}

function filterPlatformData(platformData, platformTargets) {
  const targets = Array.isArray(platformTargets) ? platformTargets.filter(Boolean) : [];
  if (targets.length === 0) return platformData;

  return {
    ...platformData,
    youtube: filterYouTubeEntries(platformData.youtube || [], targets),
    instagram: filterInstagramEntries(platformData.instagram || [], targets),
    x: targets.includes("x") ? (platformData.x || []) : [],
    reddit: targets.includes("reddit") ? (platformData.reddit || []) : [],
    news: targets.includes("news") ? (platformData.news || []) : [],
    trends: { related: [], trending: [], region: platformData.trends?.region || null },
  };
}

function filterYouTubeEntries(entries, targets) {
  if (targets.includes("youtube")) return entries;
  const wantsShorts = targets.includes("youtube_short");
  const wantsLong = targets.includes("youtube_long");
  if (!wantsShorts && !wantsLong) return [];

  return entries.filter((entry) => {
    const videoType = classifyYouTubeVideo(entry.duration);
    if (videoType === "short") return wantsShorts;
    if (videoType === "long") return wantsLong;
    return wantsLong;
  });
}

function filterInstagramEntries(entries, targets) {
  if (targets.includes("instagram")) return entries;
  const wantsReels = targets.includes("instagram_reel");
  const wantsPosts = targets.includes("instagram_post");
  if (!wantsReels && !wantsPosts) return [];

  return entries.filter((entry) => {
    const isReel = entry.isVideo || !!entry.videoUrl || String(entry.contentFormat || "").toLowerCase().includes("reel") || String(entry.contentFormat || "").toLowerCase().includes("video");
    if (isReel) return wantsReels;
    return wantsPosts;
  });
}

function classifyYouTubeVideo(durationText) {
  const seconds = parseDurationToSeconds(durationText);
  if (seconds === null) return "unknown";
  return seconds <= 60 ? "short" : "long";
}

function parseDurationToSeconds(durationText) {
  const parts = String(durationText || "")
    .split(":")
    .map((part) => Number(part))
    .filter((part) => !Number.isNaN(part));

  if (parts.length < 2) return null;
  if (parts.length === 2) return (parts[0] * 60) + parts[1];
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  return null;
}

function hasUsefulPlatformData(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (!value || typeof value !== "object") return false;
  return Object.values(value).some((entry) => Array.isArray(entry) ? entry.length > 0 : !!entry);
}
