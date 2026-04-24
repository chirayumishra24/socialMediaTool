import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/crawlers/youtube";
import { searchReddit } from "@/lib/crawlers/reddit";
import { searchX } from "@/lib/crawlers/twitter";
import { searchInstagram } from "@/lib/crawlers/instagram";
import { searchNews } from "@/lib/crawlers/news";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });

  const platformsParam = searchParams.get("platforms");
  const platforms = platformsParam ? platformsParam.split(",") : ["youtube", "reddit", "x", "news", "instagram"];

  const tasks = [];
  if (platforms.includes("youtube")) tasks.push(searchYouTube(query, process.env.YOUTUBE_API_KEY).catch(() => []));
  if (platforms.includes("reddit")) tasks.push(searchReddit(query).catch(() => []));
  if (platforms.includes("x")) tasks.push(searchX(query).catch(() => []));
  if (platforms.includes("instagram")) tasks.push(searchInstagram(query).catch(() => []));
  if (platforms.includes("news")) tasks.push(searchNews(query).catch(() => []));

  const settled = await Promise.allSettled(tasks);
  const results = settled.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);

  // Normalize scores
  const maxScore = Math.max(...results.map((r) => {
    const v = r.metrics?.views || 0, l = r.metrics?.likes || 0, c = r.metrics?.comments || 0;
    return Math.log10(Math.max(v, 1)) * 15 + Math.log10(Math.max(l, 1)) * 10 + Math.log10(Math.max(c, 1)) * 8;
  }), 1);

  const scored = results.map((r) => {
    const v = r.metrics?.views || 0, l = r.metrics?.likes || 0, c = r.metrics?.comments || 0;
    const raw = Math.log10(Math.max(v, 1)) * 15 + Math.log10(Math.max(l, 1)) * 10 + Math.log10(Math.max(c, 1)) * 8;
    return { ...r, score: Math.round((raw / maxScore) * 100) || 50 };
  }).sort((a, b) => b.score - a.score);

  return NextResponse.json({
    results: scored,
    meta: { query, total: scored.length, platforms: [...new Set(scored.map((r) => r.platform))], fetchedAt: new Date().toISOString() },
  });
}
