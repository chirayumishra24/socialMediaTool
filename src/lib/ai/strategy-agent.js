/**
 * SkilizeeAI — Instagram Strategy Agent
 * Takes scraped profile data + user context → generates 7-step marketing strategy via Gemini.
 */

import { generate } from "./ai-client.js";

/**
 * Generate a comprehensive Instagram marketing strategy.
 * @param {object} profileData — output from scrapeProfile()
 * @param {object} profileContext — user-provided context fields
 * @returns {Promise<object>} — parsed strategy with 7 sections
 */
export async function generateStrategy(profileData, profileContext) {
  const prompt = buildStrategyPrompt(profileData, profileContext);
  const raw = await generate(prompt, { tier: "pro", jsonMode: true, maxRetries: 2 });
  return normalizeStrategy(raw);
}

// ─── Prompt Builder ─────────────────────────────────────────

function buildStrategyPrompt(profileData, ctx) {
  const { profile, posts, analysis } = profileData;

  // Build post table
  const postTable = posts.map((p, i) => {
    const date = p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "N/A";
    return `${i + 1}. [${p.contentType}] ${date} | ❤️ ${p.likes} | 💬 ${p.comments} | 👁️ ${p.views} | "${p.caption.substring(0, 80)}..."`;
  }).join("\n");

  // Build hashtag summary
  const allHashtags = posts.flatMap((p) => p.hashtags);
  const hashtagFreq = {};
  allHashtags.forEach((h) => { hashtagFreq[h] = (hashtagFreq[h] || 0) + 1; });
  const topHashtags = Object.entries(hashtagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => `${tag} (${count}x)`)
    .join(", ");

  return `You are a content strategist for the Instagram account @${profile.username}.

═══ REAL PROFILE DATA (SCRAPED) ═══

Profile:
- Username: @${profile.username}
- Full Name: ${profile.fullName || "N/A"}
- Bio: "${profile.bio || "N/A"}"
- Followers: ${profile.followers.toLocaleString()}
- Following: ${profile.following.toLocaleString()}
- Total Posts: ${profile.postCount}
- Verified: ${profile.isVerified ? "Yes" : "No"}
- External URL: ${profile.externalUrl || "None"}
- Category: ${profile.category || "N/A"}

═══ LAST ${posts.length} POSTS ANALYZED ═══

${postTable}

═══ ENGAGEMENT ANALYTICS ═══

- Avg Likes: ${analysis.avgLikes}
- Avg Comments: ${analysis.avgComments}
- Avg Views: ${analysis.avgViews}
- Engagement Rate: ${analysis.engagementRate}%
- Top Format: ${analysis.topFormat}
- Format Distribution: Reels (${analysis.formatDistribution.reels}), Carousels (${analysis.formatDistribution.carousels}), Static (${analysis.formatDistribution.static})
- Posting Frequency: ${analysis.postingFrequency}
- Most Used Hashtags: ${topHashtags || "None found"}

═══ PROFILE CONTEXT (USER-PROVIDED) ═══

- Age: ${ctx.age || "Not specified"}
- Role: ${ctx.role || "Founder"}
- Content Niche: ${ctx.niche || "Education / EdTech"}
- Target Audience: ${ctx.audience || "Students, parents, educators"}
- Other Platforms: ${ctx.otherPlatforms || "None specified"}
- Goals:
  1. ${ctx.goal1 || "Grow followers in my niche"}
  2. ${ctx.goal2 || "Drive leads for my service/product"}
  3. ${ctx.goal3 || "Grow my community/newsletter"}
  4. ${ctx.goal4 || "Build a personal brand"}

═══ YOUR TASK ═══

Based on the REAL data above (not generic advice), produce a comprehensive Instagram strategy.

Every recommendation MUST reference specific data points from the scraped profile above.

Return your response as a JSON object with EXACTLY this structure:

{
  "profileAudit": {
    "whatsWorking": ["item1", "item2", "item3"],
    "whatsNot": ["item1", "item2", "item3"],
    "quickFixes": ["fix1 for bio", "fix2 for highlights", "fix3 for profile"]
  },
  "contentPillars": [
    {
      "name": "Pillar Name",
      "weeklyPercent": 30,
      "goal": "Attract | Nurture | Convert | Authority",
      "description": "Why this pillar based on profile data"
    }
  ],
  "weeklyFormatMix": {
    "reels": { "count": 3, "percent": 40, "reasoning": "why" },
    "carousels": { "count": 2, "percent": 30, "reasoning": "why" },
    "stories": { "count": 5, "percent": 20, "reasoning": "why" },
    "staticPosts": { "count": 1, "percent": 10, "reasoning": "why" }
  },
  "weeklyCalendar": [
    {
      "day": "Monday",
      "title": "Post title",
      "format": "Reel | Carousel | Static | Story",
      "hook": "Opening hook text (first 3 sec for Reels, first slide for Carousels)",
      "cta": "Call to action text",
      "pillar": "Which content pillar"
    }
  ],
  "viralHooks": [
    {
      "template": "Hook template text",
      "example": "Filled-in example for this niche",
      "whyItWorks": "Psychological reason"
    }
  ],
  "conversionFunnel": {
    "cold": "How to attract cold audience",
    "warm": "How to nurture warm audience",
    "hot": "How to convert hot audience",
    "endGoal": "The final conversion action"
  },
  "weeklyKPIs": [
    {
      "metric": "KPI name",
      "target": "Specific number/range to aim for",
      "whyItMatters": "Explanation"
    }
  ],
  "summary": "2-3 sentence executive summary of the strategy"
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;
}

// ─── Response Normalizer ────────────────────────────────────

function normalizeStrategy(raw) {
  // raw should already be parsed JSON from ai-client's jsonMode
  const strategy = typeof raw === "string" ? JSON.parse(raw) : raw;

  // Ensure all expected keys exist with defaults
  return {
    profileAudit: strategy.profileAudit || { whatsWorking: [], whatsNot: [], quickFixes: [] },
    contentPillars: Array.isArray(strategy.contentPillars) ? strategy.contentPillars : [],
    weeklyFormatMix: strategy.weeklyFormatMix || {},
    weeklyCalendar: Array.isArray(strategy.weeklyCalendar) ? strategy.weeklyCalendar : [],
    viralHooks: Array.isArray(strategy.viralHooks) ? strategy.viralHooks : [],
    conversionFunnel: strategy.conversionFunnel || {},
    weeklyKPIs: Array.isArray(strategy.weeklyKPIs) ? strategy.weeklyKPIs : [],
    summary: strategy.summary || "",
    generatedAt: new Date().toISOString(),
  };
}
