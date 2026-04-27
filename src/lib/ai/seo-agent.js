/**
 * SkilizeeAI — SEO Agent (2026 Edition)
 * Precision tags, titles, descriptions with 2026 algorithm awareness.
 */

import { generateJSON } from "./ai-client";

export async function generateSEO({
  keyword,
  script = "",
  format = "youtube_long",
  location = "IN",
  language = "en",
  platforms = ["youtube"],
} = {}) {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are an SEO specialist with 500+ #1 ranking videos and posts. You understand the 2026 algorithm landscape.

TODAY: ${today}. Your recommendations must reflect CURRENT 2026 platform algorithms and search behavior.

TASK: Generate precision SEO metadata for content about "${keyword}".

FORMAT: ${format}
LOCATION: ${location}
LANGUAGE: ${language}
PLATFORMS: ${platforms.join(", ")}

SCRIPT EXCERPT:
"""
${script.substring(0, 2000)}
"""

Return this JSON:
{
  "titles": [
    { "title": "optimized title — must trigger curiosity or bold claim", "ctrScore": 0-100, "strategy": "why this title works in 2026" }
  ],
  "description": {
    "youtube": "full YouTube description with timestamps and links",
    "instagram": "Instagram caption with strategic line breaks",
    "x": "Tweet-optimized (280 chars max)",
    "linkedin": "LinkedIn excerpt",
    "blog": "Meta description (155 chars)"
  },
  "tags": {
    "primary": [
      { "tag": "#hashtag", "competition": "low|medium|high", "volume": "estimated monthly searches", "trending": true }
    ],
    "secondary": [
      { "tag": "#hashtag", "competition": "low|medium|high", "volume": "estimated", "trending": false }
    ]
  },
  "postingTime": {
    "bestDay": "e.g. Tuesday",
    "bestTime": "e.g. 6:00 PM IST",
    "timezone": "IST|EST|UTC",
    "reasoning": "why this time based on 2026 audience behavior"
  },
  "thumbnailSuggestions": [
    { "concept": "visual description", "textOverlay": "bold text for thumb", "emotion": "shock|curiosity|excitement" }
  ]
}

RULES:
1. Tags must be PRECISE — no generic #viral or #trending
2. Titles must trigger curiosity gap or make a bold claim — score honestly
3. Consider ${location} audience timezone and cultural context
4. Reflect 2026 algorithm preferences (YouTube values watch time, IG values saves, X values replies)`;

  return generateJSON(prompt, "pro");
}
