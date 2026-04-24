import { NextResponse } from "next/server";
import { runResearch } from "@/lib/ai/research-agent";
import { searchYouTube } from "@/lib/crawlers/youtube";
import { searchReddit } from "@/lib/crawlers/reddit";
import { searchX } from "@/lib/crawlers/twitter";
import { searchNews } from "@/lib/crawlers/news";
import { searchInstagram } from "@/lib/crawlers/instagram";

export async function POST(request) {
  try {
    const body = await request.json();
    const { keyword, platforms = ["youtube", "reddit", "x", "news", "instagram"], location = "IN", language = "en", depth = "deep" } = body;

    if (!keyword) return NextResponse.json({ error: "Missing keyword" }, { status: 400 });

    // Step 1: Crawl platforms in parallel
    const crawlTasks = [];
    if (platforms.includes("youtube")) crawlTasks.push(searchYouTube(keyword, process.env.YOUTUBE_API_KEY, 10).then((d) => ({ youtube: d })));
    if (platforms.includes("reddit")) crawlTasks.push(searchReddit(keyword, 8).then((d) => ({ reddit: d })));
    if (platforms.includes("x")) crawlTasks.push(searchX(keyword).then((d) => ({ x: d })));
    if (platforms.includes("news")) crawlTasks.push(searchNews(keyword).then((d) => ({ news: d })));
    if (platforms.includes("instagram")) crawlTasks.push(searchInstagram(keyword).then((d) => ({ instagram: d })));

    const crawlResults = await Promise.allSettled(crawlTasks);
    const platformData = {};
    crawlResults.forEach((r) => { if (r.status === "fulfilled") Object.assign(platformData, r.value); });

    // Step 2: Extract top keywords from YouTube tags
    const topKeywords = extractTopKeywords(platformData);

    // Step 3: Sort videos by views (trending) and recency (latest)
    if (platformData.youtube) {
      platformData.youtube = platformData.youtube.sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
    }

    // Step 4: Run AI research with platform data as context
    const research = await runResearch(keyword, { location, language, platformData, depth });

    return NextResponse.json({
      research,
      platformData,
      topKeywords,
      meta: {
        keyword, location, language, depth,
        platformsCrawled: Object.keys(platformData),
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractTopKeywords(platformData) {
  const tagMap = {};

  // Extract from YouTube video tags
  (platformData.youtube || []).forEach((video) => {
    const views = video.metrics?.views || 0;
    const tags = video.tags || [];
    // Also extract keywords from title
    const titleWords = (video.title || "").toLowerCase()
      .replace(/[^a-z0-9\s]/g, "").split(/\s+/)
      .filter((w) => w.length > 3);

    [...tags, ...titleWords].forEach((tag) => {
      const key = tag.toLowerCase().trim();
      if (!key || key.length < 3) return;
      if (!tagMap[key]) tagMap[key] = { tag: key, totalViews: 0, videoCount: 0, fromTags: false };
      tagMap[key].totalViews += views;
      tagMap[key].videoCount += 1;
      if (tags.includes(tag)) tagMap[key].fromTags = true;
    });
  });

  // Extract from Reddit post titles
  (platformData.reddit || []).forEach((post) => {
    const score = post.metrics?.likes || 0;
    const words = (post.title || "").toLowerCase()
      .replace(/[^a-z0-9\s]/g, "").split(/\s+/)
      .filter((w) => w.length > 3);
    words.forEach((w) => {
      if (!tagMap[w]) tagMap[w] = { tag: w, totalViews: 0, videoCount: 0, fromTags: false };
      tagMap[w].totalViews += score * 10; // weight Reddit upvotes
      tagMap[w].videoCount += 1;
    });
  });

  return Object.values(tagMap)
    .filter((t) => t.videoCount >= 1)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 20)
    .map((t) => ({
      keyword: t.tag,
      totalViews: t.totalViews,
      appearsIn: t.videoCount,
      isOfficialTag: t.fromTags,
      score: Math.min(100, Math.round(Math.log10(Math.max(t.totalViews, 1)) * 15)),
    }));
}
