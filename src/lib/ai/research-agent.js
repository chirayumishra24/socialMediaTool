/**
 * SkilizeeAI — Research Agent
 * Deep topic R&D: market landscape, audience sentiment, content gaps,
 * trending sub-angles, competitor audit, newsjacking opportunities.
 */

import { generateJSON } from "./ai-client";

/**
 * Run full R&D pipeline for a keyword.
 * @param {string} keyword
 * @param {object} context — { location, language, platformData, depth }
 */
export async function runResearch(keyword, { location = "IN", language = "en", platformData = {}, depth = "deep" } = {}) {
  const platformSummary = formatPlatformData(platformData);

  const prompt = `You are the Lead Strategy Director at SkilizeeAI, an elite digital marketing intelligence firm.
Your goal is to transform a simple keyword into a high-impact, INFORMATIVE, and data-backed content strategy.

TASK: Conduct a ${depth.toUpperCase()}-level research and strategy plan for: "${keyword}"

STEP 0: VAGUE CHECK
If the keyword is too broad (e.g., "AI", "Marketing", "Money") and impossible to create a precise strategy for, you MUST return ONLY this JSON:
{ "isVague": true, "message": "The topic is too broad for a precise strategy.", "suggestions": ["suggest a more specific version 1", "suggest a more specific version 2"] }

STEP 1: ANALYSIS & STRATEGY
If not vague, analyze the data and provide a comprehensive strategy. Prioritize INFORMATIVE and educational content over shallow or rubbish content.

CONTEXT:
- Target Location: ${location}
- Content Language: ${language}
- Date: ${new Date().toISOString().split("T")[0]}

REAL-TIME PLATFORM DATA:
${platformSummary || "No platform data provided — use your deep training data for the latest 2024-2025 trends."}

Analyze and return a JSON object with this EXACT structure:
{
  "keyword": "${keyword}",
  "isVague": false,
  "marketLandscape": {
    "saturationLevel": "low|medium|high|oversaturated",
    "saturationScore": 0-100,
    "totalEstimatedContent": "e.g. 50K+ videos",
    "growthTrend": "rising|stable|declining",
    "summary": "2-3 sentence market overview focusing on INFORMATIVE value"
  },
  "audienceSentiment": {
    "overall": "positive|negative|mixed|neutral",
    "score": 0-100,
    "painPoints": ["list of 3-5 deep audience pain points"],
    "desires": ["list of 3-5 audience desires"],
    "demographics": "primary audience description"
  },
  "contentGaps": [
    {
      "gap": "description of content gap",
      "opportunity": "why this is a golden opportunity for informative content",
      "difficulty": "easy|medium|hard",
      "estimatedDemand": "high|medium|low"
    }
  ],
  "trendingAngles": [
    {
      "angle": "specific informative sub-angle title",
      "description": "why this angle is trending and its value",
      "platforms": ["youtube", "instagram", "x"],
      "viralPotential": 0-100,
      "suggestedFormat": "youtube_long|youtube_short|reel|carousel|thread|blog",
      "hookIdea": "educational/informative hook"
    }
  ],
  "strategyBlueprint": {
    "concept": "The high-level informative content pillar",
    "executionPhases": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."],
    "modernApproach": "Why this works in the current 2025 landscape",
    "recommendedTools": ["Tool 1", "Tool 2"]
  },
  "recommendedStrategy": {
    "bestPlatform": "youtube|instagram|x|linkedin|blog",
    "bestFormat": "format name",
    "bestAngle": "the single best informative angle to pursue",
    "estimatedViralPotential": 0-100,
    "keyMessage": "core informative message in 1 sentence"
  }
}

Return ONLY valid JSON. Be specific, data-driven, and prioritize depth and informative value.`;

  return generateJSON(prompt, depth === "quick" ? "flash" : "pro");
}

function formatPlatformData(data) {
  const parts = [];
  if (data.youtube?.length) {
    parts.push("YOUTUBE TRENDING:\n" + data.youtube.slice(0, 8).map((v) =>
      `- "${v.title}" (${formatNum(v.metrics?.views)} views). Tags: ${v.tags?.join(", ")}`
    ).join("\n"));
  }
  if (data.instagram?.length) {
    parts.push("INSTAGRAM STRATEGY:\n" + data.instagram.slice(0, 5).map((i) =>
      `- ${i.title}: ${i.tip}`
    ).join("\n"));
  }
  if (data.reddit?.length) {
    parts.push("REDDIT HOT:\n" + data.reddit.slice(0, 5).map((r) =>
      `- "${r.title}" (${formatNum(r.metrics?.likes)} upvotes)`
    ).join("\n"));
  }
  if (data.x?.length) {
    parts.push("X/TWITTER:\n" + data.x.slice(0, 5).map((t) =>
      `- "${t.title}" (Engagement: ${t.metrics?.likes} likes)`
    ).join("\n"));
  }
  if (data.news?.length) {
    parts.push("NEWS:\n" + data.news.slice(0, 5).map((n) =>
      `- "${n.title}"`
    ).join("\n"));
  }
  return parts.join("\n\n");
}

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
