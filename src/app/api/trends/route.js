import { fetchTrendingEducation, extractKeywords } from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET(request) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
    // Return demo data if no API key
    return NextResponse.json({
      trends: getDemoTrends(),
      keywords: getDemoKeywords(),
      source: "demo",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "IN";

    const videos = await fetchTrendingEducation(apiKey, region, 20);
    const keywords = extractKeywords(videos);

    return NextResponse.json({
      trends: videos,
      keywords,
      source: "youtube_api",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      {
        trends: getDemoTrends(),
        keywords: getDemoKeywords(),
        source: "demo_fallback",
        error: error.message,
      },
      { status: 200 }
    );
  }
}

function getDemoTrends() {
  return [
    {
      id: "demo1",
      title: "How to Study Smart: 7 Proven Techniques Backed by Science",
      channelTitle: "Thomas Frank",
      viewCount: 2400000,
      likeCount: 95000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      tags: ["study tips", "study techniques", "productivity"],
      duration: "12:34",
    },
    {
      id: "demo2",
      title: "AI is Changing Education Forever — Here's How",
      channelTitle: "Fireship",
      viewCount: 1800000,
      likeCount: 72000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      tags: ["artificial intelligence", "education", "future"],
      duration: "8:15",
    },
    {
      id: "demo3",
      title: "This ONE Math Trick Will Change Your Life",
      channelTitle: "MindYourDecisions",
      viewCount: 3200000,
      likeCount: 130000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      tags: ["math tricks", "mental math", "math shortcuts"],
      duration: "6:42",
    },
    {
      id: "demo4",
      title: "NEET 2026 — 5 Last Minute Tips from a Topper",
      channelTitle: "Physics Wallah",
      viewCount: 5600000,
      likeCount: 210000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      tags: ["neet", "exam tips", "physics", "topper strategy"],
      duration: "15:20",
    },
    {
      id: "demo5",
      title: "The Science of Memory — How Your Brain Actually Learns",
      channelTitle: "Kurzgesagt",
      viewCount: 8900000,
      likeCount: 420000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      tags: ["neuroscience", "memory", "learning", "brain"],
      duration: "10:07",
    },
    {
      id: "demo6",
      title: "Why Schools Don't Teach You About Money",
      channelTitle: "Ali Abdaal",
      viewCount: 4100000,
      likeCount: 189000,
      thumbnailUrl: "",
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      tags: ["financial literacy", "school system", "money management"],
      duration: "14:22",
    },
  ];
}

function getDemoKeywords() {
  return {
    primary: [
      { keyword: "study smart", score: 95 },
      { keyword: "exam tips", score: 88 },
      { keyword: "ai education", score: 85 },
      { keyword: "math tricks", score: 82 },
      { keyword: "memory techniques", score: 78 },
    ],
    secondary: [
      { keyword: "neet preparation", score: 72 },
      { keyword: "science experiments", score: 68 },
      { keyword: "financial literacy", score: 65 },
      { keyword: "brain learning", score: 62 },
      { keyword: "productivity hacks", score: 58 },
    ],
    longTail: [
      { keyword: "how to study for exams", score: 52 },
      { keyword: "best study techniques 2026", score: 48 },
      { keyword: "ai tools for students", score: 45 },
    ],
  };
}
