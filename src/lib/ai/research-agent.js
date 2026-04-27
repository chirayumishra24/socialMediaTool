/**
 * SkilizeeAI — Research Agent (2026 Edition)
 * Deep topic R&D focused on CURRENT 2026 trends, news, and signals.
 */

import { generateJSON } from "./ai-client";

export async function runResearch(keyword, { location = "IN", language = "en", platformData = {}, depth = "deep" } = {}) {
  const platformSummary = formatPlatformData(platformData);
  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are an elite Content Intelligence Analyst operating in April 2026.

CRITICAL: Today's date is ${today}. ALL analysis must reflect the CURRENT 2026 landscape.
- Reference only 2025-2026 data, trends, algorithm changes, and cultural shifts.
- Do NOT reference outdated 2023-2024 trends as if they are current.
- Mention specific recent events, policy changes, or viral moments from early-to-mid 2026.

TASK: Conduct a ${depth.toUpperCase()}-level research analysis for: "${keyword}"

STEP 0: VAGUE CHECK
If the keyword is too broad (e.g., "AI", "Marketing"), return ONLY:
{ "isVague": true, "message": "Too broad for precise strategy.", "suggestions": ["specific version 1", "specific version 2", "specific version 3"] }

STEP 1: FULL ANALYSIS (if not vague)

CONTEXT:
- Location Focus: ${location}
- Language: ${language}
- Analysis Date: ${today}

REAL-TIME PLATFORM DATA (crawled just now):
${platformSummary || "No live crawl data — use your knowledge of current 2025-2026 trends and developments."}

Return this JSON structure:
{
  "keyword": "${keyword}",
  "isVague": false,
  "marketLandscape": {
    "saturationLevel": "low|medium|high|oversaturated",
    "saturationScore": 0-100,
    "totalEstimatedContent": "e.g. 50K+ videos",
    "growthTrend": "rising|stable|declining",
    "summary": "2-3 sentences about the CURRENT 2026 landscape for this topic. Reference specific recent developments."
  },
  "audienceSentiment": {
    "overall": "positive|negative|mixed|neutral",
    "score": 0-100,
    "painPoints": ["5 specific, actionable pain points people have RIGHT NOW in 2026"],
    "desires": ["5 specific desires/aspirations"],
    "demographics": "primary audience description with 2026 context"
  },
  "contentGaps": [
    {
      "gap": "specific underserved angle",
      "opportunity": "why this is a golden opportunity in 2026",
      "difficulty": "easy|medium|hard",
      "estimatedDemand": "high|medium|low"
    }
  ],
  "trendingAngles": [
    {
      "angle": "specific 2026-relevant angle title",
      "description": "why this is trending NOW",
      "platforms": ["youtube", "instagram", "x"],
      "viralPotential": 0-100,
      "suggestedFormat": "youtube_long|youtube_short|reel|carousel|thread|blog",
      "hookIdea": "compelling hook idea"
    }
  ],
  "strategyBlueprint": {
    "concept": "The high-level content pillar rooted in 2026 reality",
    "executionPhases": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."],
    "modernApproach": "Why this works specifically in the current 2026 algorithm + cultural landscape",
    "recommendedTools": ["Tool 1", "Tool 2"]
  },
  "recommendedStrategy": {
    "bestPlatform": "youtube|instagram|x|linkedin|blog",
    "bestFormat": "format name",
    "bestAngle": "the single strongest angle for 2026",
    "estimatedViralPotential": 0-100,
    "keyMessage": "core message in 1 sentence"
  }
}

Return ONLY valid JSON. Be hyper-specific. Reference real 2026 developments.`;

  return generateJSON(prompt, depth === "quick" ? "flash" : "pro");
}

function formatPlatformData(data) {
  const parts = [];
  if (data.youtube?.length) {
    parts.push("YOUTUBE (LIVE CRAWL):\n" + data.youtube.slice(0, 8).map((v) =>
      `- "${v.title}" by ${v.author || "unknown"} (${fmtNum(v.metrics?.views)} views, ${fmtNum(v.metrics?.likes)} likes). Published: ${v.publishedAt || "recent"}`
    ).join("\n"));
  }
  if (data.instagram?.length) {
    parts.push("INSTAGRAM (LIVE CRAWL):\n" + data.instagram.slice(0, 5).map((i) =>
      `- "${i.title || i.description}" (${fmtNum(i.metrics?.likes)} likes)`
    ).join("\n"));
  }
  if (data.reddit?.length) {
    parts.push("REDDIT (LIVE CRAWL):\n" + data.reddit.slice(0, 5).map((r) =>
      `- "${r.title}" (${fmtNum(r.metrics?.likes)} upvotes)`
    ).join("\n"));
  }
  if (data.x?.length) {
    parts.push("X/TWITTER (LIVE CRAWL):\n" + data.x.slice(0, 5).map((t) =>
      `- "${t.title}" (${t.metrics?.likes} likes, ${t.metrics?.retweets} RTs)`
    ).join("\n"));
  }
  if (data.news?.length) {
    parts.push("NEWS (LIVE CRAWL):\n" + data.news.slice(0, 5).map((n) =>
      `- "${n.title}" — ${n.author || "unknown"} (${n.publishedAt || "recent"})`
    ).join("\n"));
  }
  return parts.join("\n\n");
}

function fmtNum(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
