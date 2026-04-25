/**
 * SkilizeeAI — SEO & Precision Tags Agent
 * Data-driven tags, titles, descriptions, posting time optimization.
 */

import { generateJSON } from "./ai-client";

/**
 * Generate precision SEO metadata for content.
 */
export async function generateSEO({
  keyword,
  script = "",
  format = "youtube_long",
  location = "IN",
  language = "en",
  platforms = ["youtube"],
  learningSignals = null,
} = {}) {
  const learningContext = learningSignals?.publishedPosts
    ? `
PREVIOUS PERFORMANCE MEMORY:
- Published Posts Tracked: ${learningSignals.publishedPosts}
- Top Tags By Clicks: ${(learningSignals.topTags || []).slice(0, 8).map((item) => `${item.tag} (${item.totalClicks} clicks)`).join("; ")}
- Winning Formats: ${(learningSignals.winningFormats || []).slice(0, 4).map((item) => `${item.format} (${item.avgClicks} avg clicks)`).join("; ")}
- Lessons: ${(learningSignals.lessons || []).join(" ")}
`
    : "";

  const prompt = `You are an SEO specialist with 500+ #1 ranking videos and posts across YouTube, Instagram, and X.

TASK: Generate precision SEO metadata for content about "${keyword}".

FORMAT: ${format}
TARGET LOCATION: ${location}
LANGUAGE: ${language}
TARGET PLATFORMS: ${platforms.join(", ")}
${learningContext}

SCRIPT EXCERPT:
"""
${script.substring(0, 1500)}
"""

Return this JSON:
{
  "titles": [
    { "title": "optimized title", "ctrScore": 0-100, "strategy": "why this title works" }
  ],
  "description": {
    "youtube": "full YouTube description with links and timestamps",
    "instagram": "Instagram caption with line breaks",
    "x": "Tweet-optimized description (280 chars)",
    "linkedin": "LinkedIn post excerpt",
    "blog": "Meta description (155 chars)"
  },
  "tags": {
    "primary": [
      { "tag": "#hashtag", "competition": "low|medium|high", "volume": "estimated monthly searches", "trending": true/false }
    ],
    "secondary": [
      { "tag": "#hashtag", "competition": "low|medium|high", "volume": "estimated", "trending": false }
    ],
    "longTail": [
      { "tag": "#longtailkeyword", "competition": "low", "volume": "niche" }
    ],
    "platformSpecific": {
      "youtube": ["tag1", "tag2", "...up to 15"],
      "instagram": ["#tag1", "#tag2", "...up to 30"],
      "x": ["#tag1", "#tag2", "...max 5"],
      "linkedin": ["#tag1", "#tag2", "#tag3"]
    }
  },
  "postingTime": {
    "bestDay": "e.g. Tuesday",
    "bestTime": "e.g. 6:00 PM IST",
    "timezone": "IST|EST|UTC",
    "reasoning": "why this time"
  },
  "thumbnailSuggestions": [
    { "concept": "description", "textOverlay": "bold text for thumb", "emotion": "shock|curiosity|excitement" }
  ]
}

RULES:
1. Tags MUST be precise — no generic tags like #viral or #trending
2. Each tag should have realistic competition and volume estimates
3. Titles must trigger curiosity gap or bold claim — score honestly
4. Platform-specific tags should follow each platform's algorithm preferences
5. Consider ${location} audience timezone for posting time
6. If previous tag performance is provided, prefer proven themes while still keeping the set specific to this topic`;

  return generateJSON(prompt, "pro");
}
