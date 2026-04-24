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

  const prompt = `You are an elite social media research analyst at a top marketing agency.

TASK: Conduct a ${depth.toUpperCase()}-level research analysis on the topic: "${keyword}"

CONTEXT:
- Target Location: ${location}
- Content Language: ${language}
- Date: ${new Date().toISOString().split("T")[0]}

REAL-TIME PLATFORM DATA:
${platformSummary || "No platform data provided — use your knowledge."}

Analyze and return a JSON object with this EXACT structure:
{
  "keyword": "${keyword}",
  "marketLandscape": {
    "saturationLevel": "low|medium|high|oversaturated",
    "saturationScore": 0-100,
    "totalEstimatedContent": "e.g. 50K+ videos",
    "growthTrend": "rising|stable|declining",
    "summary": "2-3 sentence market overview"
  },
  "audienceSentiment": {
    "overall": "positive|negative|mixed|neutral",
    "score": 0-100,
    "painPoints": ["list of 3-5 audience pain points"],
    "desires": ["list of 3-5 audience desires"],
    "demographics": "primary audience description"
  },
  "contentGaps": [
    {
      "gap": "description of content gap",
      "opportunity": "why this is a golden opportunity",
      "difficulty": "easy|medium|hard",
      "estimatedDemand": "high|medium|low"
    }
  ],
  "trendingAngles": [
    {
      "angle": "specific sub-angle title",
      "description": "why this angle is trending",
      "platforms": ["youtube", "instagram", "x"],
      "viralPotential": 0-100,
      "suggestedFormat": "youtube_long|youtube_short|reel|carousel|thread|blog",
      "hookIdea": "compelling hook for this angle"
    }
  ],
  "competitors": [
    {
      "name": "channel/account name",
      "platform": "youtube|instagram|x",
      "contentType": "what they do",
      "strength": "why they succeed",
      "weakness": "exploitable gap",
      "estimatedReach": "e.g. 500K-1M"
    }
  ],
  "newsjacking": [
    {
      "event": "recent event or news",
      "angle": "how to tie it to the keyword",
      "urgency": "high|medium|low",
      "windowHours": 24
    }
  ],
  "recommendedStrategy": {
    "bestPlatform": "youtube|instagram|x|linkedin|blog",
    "bestFormat": "format name",
    "bestAngle": "the single best angle to pursue",
    "estimatedViralPotential": 0-100,
    "keyMessage": "core message in 1 sentence"
  }
}

Return ONLY valid JSON. Be specific, data-driven, and actionable. Include real creator names, real trends, real numbers where possible.`;

  return generateJSON(prompt, depth === "quick" ? "flash" : "pro");
}

function formatPlatformData(data) {
  const parts = [];
  if (data.youtube?.length) {
    parts.push("YOUTUBE TRENDING:\n" + data.youtube.slice(0, 8).map((v) =>
      `- "${v.title}" by ${v.author || v.channelTitle} (${formatNum(v.metrics?.views || v.viewCount)} views)`
    ).join("\n"));
  }
  if (data.reddit?.length) {
    parts.push("REDDIT HOT:\n" + data.reddit.slice(0, 5).map((r) =>
      `- "${r.title}" r/${r.subreddit} (${formatNum(r.metrics?.likes || r.score)} upvotes, ${r.metrics?.comments || r.numComments} comments)`
    ).join("\n"));
  }
  if (data.news?.length) {
    parts.push("NEWS:\n" + data.news.slice(0, 5).map((n) =>
      `- "${n.title}" — ${n.author || n.source}`
    ).join("\n"));
  }
  if (data.x?.length) {
    parts.push("X/TWITTER:\n" + data.x.slice(0, 5).map((t) =>
      `- "${t.title}" by ${t.author}`
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
