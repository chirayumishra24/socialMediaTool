import { fetchEducationNews } from "@/lib/news";
import { NextResponse } from "next/server";

// Cache news for 30 minutes to avoid hammering RSS feeds
let newsCache = null;
let lastFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  const now = Date.now();

  if (newsCache && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json({
      news: newsCache,
      source: "cache",
      cachedAt: new Date(lastFetch).toISOString(),
    });
  }

  try {
    const news = await fetchEducationNews();
    newsCache = news;
    lastFetch = now;

    return NextResponse.json({
      news,
      source: "rss_live",
      fetchedAt: new Date().toISOString(),
      feedCount: 10,
    });
  } catch (error) {
    console.error("News fetch error:", error);

    // Return demo data on error
    return NextResponse.json({
      news: getDemoNews(),
      source: "demo_fallback",
      error: error.message,
    });
  }
}

function getDemoNews() {
  return [
    {
      id: "news1",
      headline: "India Introduces AI Literacy in Class 6-8 Curriculum Under NEP 2025",
      summary: "The Ministry of Education has announced that AI and data ethics will be mandatory subjects starting from Grade 6 across CBSE-affiliated schools from the next academic session.",
      source: "The Hindu Education",
      sourceUrl: "https://thehindu.com",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: "education_india",
      nrs: 94,
      urgencyWindowHours: 12,
      isHighOpportunity: true,
    },
    {
      id: "news2",
      headline: "James Webb Telescope Discovers New Earth-Like Exoplanet with Water Vapor",
      summary: "NASA's JWST has confirmed the presence of water vapor in the atmosphere of a rocky exoplanet in the habitable zone of a nearby star system.",
      source: "BBC Science",
      sourceUrl: "https://bbc.com",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      category: "science",
      nrs: 87,
      urgencyWindowHours: 18,
      isHighOpportunity: true,
    },
    {
      id: "news3",
      headline: "CBSE Board Exam 2026: Major Changes in Assessment Pattern Announced",
      summary: "CBSE has announced a shift to competency-based assessment with 40% weightage on practical applications starting from the 2026-27 session.",
      source: "NDTV Education",
      sourceUrl: "https://ndtv.com",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      category: "education_india",
      nrs: 82,
      urgencyWindowHours: 24,
      isHighOpportunity: false,
    },
    {
      id: "news4",
      headline: "New Study Reveals Most Effective Study Techniques Are Underused by Students",
      summary: "A meta-analysis of 200+ studies shows that active recall and spaced repetition outperform highlighting and re-reading by 3x, yet fewer than 15% of students use them.",
      source: "EdSurge",
      sourceUrl: "https://edsurge.com",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      category: "education",
      nrs: 76,
      urgencyWindowHours: 48,
      isHighOpportunity: false,
    },
    {
      id: "news5",
      headline: "OpenAI Launches Free Education Tier for Schools Worldwide",
      summary: "OpenAI has announced a free ChatGPT Education tier for K-12 schools, providing safe AI tutoring tools with content filters and teacher dashboards.",
      source: "TechCrunch",
      sourceUrl: "https://techcrunch.com",
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      category: "technology",
      nrs: 71,
      urgencyWindowHours: 24,
      isHighOpportunity: false,
    },
  ];
}
