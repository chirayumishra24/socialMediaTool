/**
 * EduTrend AI Agent — Multi-Agent Script Generation Pipeline
 * Uses Google Gemini API (free tier)
 * Pipeline: Researcher → Writer → Editor → SEO Optimizer
 */

import { GoogleGenAI } from "@google/genai";

let genAIInstance = null;

function getGenAI(apiKey) {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
}

async function callGemini(apiKey, systemPrompt, userPrompt, temperature = 0.8) {
  const ai = getGenAI(apiKey);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature,
      maxOutputTokens: 4096,
    },
  });
  return response.text;
}

// ═══════════════════════════════════════════════
// AGENT 1: RESEARCHER
// ═══════════════════════════════════════════════
const RESEARCHER_SYSTEM = `You are a trend research specialist focused on education content for YouTube and Instagram.

Your job is to analyze trending data and identify the BEST content angle for maximum engagement.

RULES:
- Focus on what makes the topic CURRENT and URGENT
- Identify 3 unique sub-angles not yet covered by most creators
- Find the emotional hook that will grab viewers
- Consider the target audience deeply
- Always return valid JSON`;

async function runResearcher(apiKey, { niche, audience, trendData, newsData }) {
  const prompt = `Analyze this data and produce a research brief for creating education content.

NICHE: ${niche}
TARGET AUDIENCE: ${audience}

TRENDING TOPICS ON YOUTUBE:
${trendData || "No trend data available — use your knowledge of current education trends."}

CURRENT NEWS:
${newsData || "No news data available — use your knowledge of recent events."}

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "selectedTopic": "The specific topic to create content about",
  "whyNow": "Why this topic is timely and relevant RIGHT NOW",
  "mainAngle": "The unique angle/perspective to take",
  "subAngles": ["Sub-angle 1", "Sub-angle 2", "Sub-angle 3"],
  "emotionalHook": "The core emotion this content should trigger (curiosity, fear of missing out, surprise, etc.)",
  "keyFacts": ["Fact 1 to include", "Fact 2 to include", "Fact 3 to include"],
  "competitorGap": "What most creators are missing about this topic"
}`;

  const response = await callGemini(apiKey, RESEARCHER_SYSTEM, prompt, 0.7);
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      selectedTopic: niche,
      whyNow: "Currently trending in education space",
      mainAngle: `Fresh perspective on ${niche}`,
      subAngles: ["Practical tips", "Common mistakes", "Expert insights"],
      emotionalHook: "curiosity",
      keyFacts: ["Based on latest research", "Proven techniques", "Expert recommended"],
      competitorGap: "Most creators only cover surface level",
    };
  }
}

// ═══════════════════════════════════════════════
// AGENT 2: WRITER
// ═══════════════════════════════════════════════
const WRITER_SYSTEM = `You are an expert scriptwriter for educational YouTube and Instagram content.
You write scripts that are ENGAGING, CONVERSATIONAL, and OPTIMIZED for viewer retention.

RULES:
- Write for the EAR, not the eye — short punchy sentences (max 12 words)
- Use the Hook → Promise → Value → CTA framework
- Include [ONSCREEN TEXT: ...] annotations for visual text overlays
- Include [B-ROLL: ...] annotations for visual suggestions
- Make every sentence earn its place — no filler
- Use rhetorical questions, pattern interrupts, and curiosity loops
- Write in a conversational, relatable tone — like talking to a friend`;

function getWriterPrompt(format) {
  const formats = {
    youtube_longform: `Write a YouTube LONG-FORM script (8-12 minutes, ~1500-2000 words).
Structure:
- HOOK (0-15 seconds): Bold claim or curiosity gap
- PROMISE (15-30 seconds): What they'll learn and why it matters
- VALUE SECTIONS (3-5 main points): Each with its own mini-hook + insight + example
- RETENTION BAIT: "Wait until point #4..." style tease
- CTA (final 15 seconds): Subscribe + comment prompt
Include [TIMESTAMP: X:XX] markers for chapter segments.`,

    youtube_short: `Write a YouTube SHORT script (45-60 seconds, ~120-150 words).
Structure:
- HOOK (first 3 seconds): One shocking line
- SINGLE INSIGHT (30-40 seconds): One punchy idea with an example
- LOOP ENDING: End with a line that makes them want to watch again
Keep it FAST. No dead air. Every second counts.`,

    instagram_reel: `Write an Instagram REEL script (15-30 seconds, ~60-80 words).
Structure:
- HOOK (first 1.5 seconds): Bold text-friendly statement
- VALUE (10-20 seconds): Quick fire insight
- CTA (last 3 seconds): "Save this" or "Share with someone who needs this"
Optimize for TEXT OVERLAYS — most viewers watch without sound.
Include [TEXT OVERLAY: ...] for each frame.`,

    instagram_carousel: `Write an Instagram CAROUSEL script (8-10 slides).
Structure:
- SLIDE 1: Hook headline (curiosity-driven, makes them swipe)
- SLIDES 2-8: One insight per slide, short sentences, use → arrows between points
- SLIDE 9: Summary/takeaway
- SLIDE 10: CTA — "Save for later \\ud83d\\udccc" + "Share with a friend"
Each slide: MAX 30 words. Use emojis sparingly.`,
  };

  return formats[format] || formats.youtube_longform;
}

async function runWriter(apiKey, { research, format, niche, audience, keywords }) {
  const formatInstructions = getWriterPrompt(format);

  const prompt = `Write a ${format.replace(/_/g, " ")} script based on this research.

RESEARCH BRIEF:
Topic: ${research.selectedTopic}
Angle: ${research.mainAngle}
Why Now: ${research.whyNow}
Key Facts: ${research.keyFacts?.join(", ")}
Emotional Hook: ${research.emotionalHook}
Sub-Angles: ${research.subAngles?.join(", ")}

TARGET: ${audience} interested in ${niche}
KEYWORDS TO NATURALLY INCLUDE: ${keywords || "use topic-relevant keywords"}

FORMAT INSTRUCTIONS:
${formatInstructions}

Write the script NOW. Be specific, use real examples, and make every line count.`;

  return await callGemini(apiKey, WRITER_SYSTEM, prompt, 0.85);
}

// ═══════════════════════════════════════════════
// AGENT 3: EDITOR
// ═══════════════════════════════════════════════
const EDITOR_SYSTEM = `You are a senior content editor specializing in educational video scripts.
You improve scripts to MAXIMIZE viewer retention and engagement.

Your editing priorities:
1. HOOK STRENGTH — Does the first 3 seconds stop the scroll?
2. PACING — Is every sentence earning its place?
3. CLARITY — Can a 15-year-old understand this?
4. EMOTIONAL ARC — Does it take the viewer on a journey?
5. CTA CLARITY — Is the call-to-action specific and compelling?

RULES:
- Rewrite weak sections completely
- Add retention loops where engagement might drop
- Make hooks more dramatic
- Ensure keyword usage feels natural, not forced
- Keep the conversational tone`;

async function runEditor(apiKey, { script, format, audience }) {
  const prompt = `Review and improve this ${format.replace(/_/g, " ")} script.

SCRIPT:
${script}

TARGET AUDIENCE: ${audience}

INSTRUCTIONS:
1. Score each section (Hook, Value, CTA) from 1-10
2. Rewrite any section scoring below 7
3. Add retention loops if missing
4. Strengthen the hook if it's not instantly captivating
5. Ensure the CTA is specific and compelling

Return the IMPROVED SCRIPT with a brief note at the end about what you changed.`;

  return await callGemini(apiKey, EDITOR_SYSTEM, prompt, 0.7);
}

// ═══════════════════════════════════════════════
// AGENT 4: SEO OPTIMIZER
// ═══════════════════════════════════════════════
const SEO_SYSTEM = `You are an SEO specialist for YouTube and Instagram educational content.
You optimize content metadata for MAXIMUM discoverability and click-through rate.

RULES:
- Titles: Use curiosity gaps, numbers, and power words. Max 60 chars.
- Descriptions: Front-load keywords in first 2 lines (visible before "Show more")
- Hashtags: Use 3-tier strategy (Mega 5M+, Mid 500K-5M, Niche <500K)
- Tags: Mix broad and specific for YouTube
- Instagram captions: Keyword-rich, NOT hashtag-heavy
- Always return valid JSON`;

async function runSEOOptimizer(apiKey, { script, format, niche, platform }) {
  const platformInstructions =
    platform === "instagram"
      ? `Generate Instagram-optimized SEO. Focus on caption with keywords, tiered hashtags (25 total), and alt text.`
      : `Generate YouTube-optimized SEO. Focus on title, description with chapters, and tags (500 char limit).`;

  const prompt = `Optimize SEO for this ${format.replace(/_/g, " ")} script.

SCRIPT (first 500 chars):
${script.substring(0, 500)}

NICHE: ${niche}
PLATFORM: ${platform}
${platformInstructions}

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "titles": [
    "Title variant A (max 60 chars)",
    "Title variant B (max 60 chars)",
    "Title variant C (max 60 chars)"
  ],
  "description": "Full SEO description (YouTube: 160 chars first 2 lines visible)",
  "instagramCaptions": [
    "Variant A: Direct/Value-driven hook with actionable steps",
    "Variant B: Story-based/Emotional hook building curiosity"
  ],
  "hashtags": {
    "mega": ["#education", "#learnwithme", "#studytips"],
    "mid": ["#studyhacks", "#educationalcontent", "#learnontiktok", "#knowledgeispower", "#brainpower", "#smartlearning", "#studymotivation", "#learneveryday"],
    "niche": ["#specifictag1", "#specifictag2", "#specifictag3", "#specifictag4", "#specifictag5", "#specifictag6", "#specifictag7", "#specifictag8", "#specifictag9", "#specifictag10", "#specifictag11", "#specifictag12", "#specifictag13", "#specifictag14"]
  },
  "tags": ["youtube tag 1", "youtube tag 2", "youtube tag 3"],
  "thumbnailText": "Suggested text for thumbnail (max 6 words)",
  "bestPostingTime": "Recommended posting time with reason"
}`;

  const response = await callGemini(apiKey, SEO_SYSTEM, prompt, 0.6);
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      titles: [
        `${niche} — Everything You Need to Know`,
        `Why ${niche} Changes Everything`,
        `${niche} Explained in Simple Terms`,
      ],
      description: `Learn about ${niche} in this comprehensive video. Perfect for students and curious minds.`,
      hashtags: {
        mega: ["#education", "#learnwithme", "#studytips"],
        mid: ["#studyhacks", "#educationalcontent", "#learning", "#knowledge", "#smartlearning"],
        niche: [`#${niche.replace(/\s+/g, "")}`, "#edutok", "#conceptlearning"],
      },
      tags: [niche, "education", "learning", "study tips", "explained"],
      thumbnailText: niche,
      bestPostingTime: "Tuesday/Thursday 5-7 PM",
    };
  }
}

// ═══════════════════════════════════════════════
// QUALITY SCORER & PREDICTION MODEL (v1)
// ═══════════════════════════════════════════════
function scoreContentQuality(script, seo, format) {
  let score = 0;
  const suggestions = [];

  // Hook check (0-25 points)
  const firstLine = script.split("\n").find((l) => l.trim().length > 5) || "";
  if (firstLine.includes("?") || /\d/.test(firstLine)) {
    score += 20;
  } else if (firstLine.length > 10) {
    score += 12;
    suggestions.push("Hook could be stronger — try adding a question or number");
  } else {
    score += 5;
    suggestions.push("Hook is weak — start with a bold claim or surprising question");
  }
  if (/you|your/i.test(firstLine)) score += 5;

  // Script length check (0-20 points)
  const wordCount = script.split(/\s+/).length;
  const idealRanges = {
    youtube_longform: [1200, 2500],
    youtube_short: [80, 180],
    instagram_reel: [40, 100],
    instagram_carousel: [200, 400],
  };
  const [min, max] = idealRanges[format] || [100, 2000];
  if (wordCount >= min && wordCount <= max) {
    score += 20;
  } else if (wordCount < min) {
    score += 8;
    suggestions.push(`Script is short (${wordCount} words). Aim for ${min}-${max} words for ${format.replace(/_/g, " ")}`);
  } else {
    score += 12;
    suggestions.push(`Script may be too long (${wordCount} words). Consider trimming to ${max} words`);
  }

  // CTA check (0-15 points)
  if (/subscribe|save|share|comment|follow|like/i.test(script)) {
    score += 15;
  } else {
    score += 3;
    suggestions.push("Add a clear Call-to-Action (subscribe, save, share)");
  }

  // SEO check (0-20 points)
  if (seo?.titles?.length >= 3) score += 8;
  if (seo?.hashtags?.mega?.length > 0) score += 4;
  if (seo?.hashtags?.niche?.length >= 5) score += 4;
  if (seo?.description?.length > 50) score += 4;
  else suggestions.push("SEO description is too short — add more keywords");

  // Engagement markers (0-20 points)
  const questions = (script.match(/\?/g) || []).length;
  if (questions >= 3) score += 8;
  else suggestions.push("Add more rhetorical questions to boost engagement");

  if (/\[ONSCREEN TEXT:|TEXT OVERLAY:|B-ROLL:/i.test(script)) score += 6;
  else suggestions.push("Add [ONSCREEN TEXT:] or [B-ROLL:] annotations for production guidance");

  if (/imagine|picture this|here's the thing|let me tell you/i.test(script)) score += 6;
  else suggestions.push("Add conversational phrases (\"Here's the thing...\", \"Imagine this...\")");

  const finalScore = Math.min(100, score);

  // --- v1 Engagement Prediction Model ---
  const isShortForm = format.includes('short') || format.includes('reel') || format.includes('carousel');
  const baseViews = isShortForm ? 12000 : 5000;
  
  // Predict views based on score and tags presence
  const estimatedMinViews = Math.floor(baseViews * (finalScore / 100) * (seo?.tags?.length > 5 ? 1.5 : 1.0));
  const estimatedMaxViews = Math.floor(estimatedMinViews * (isShortForm ? 3.5 : 2.0));
  
  // Predict engagement rate (%)
  const baseEngRate = isShortForm ? 3.5 : 5.8;
  const engagementRate = (baseEngRate + (finalScore / 40)).toFixed(1);

  // Determine competition level based on mega hashtags and format
  let competition = "Medium";
  if (seo?.hashtags?.mega?.length > 4 || format === "instagram_reel") competition = "High";
  if (seo?.hashtags?.niche?.length > 10) competition = "Low (Niche)";

  return {
    score: finalScore,
    suggestions: suggestions.slice(0, 5),
    wordCount,
    estimatedDuration:
      format === "youtube_longform" ? `${Math.round(wordCount / 150)} min` :
      format === "youtube_short" ? `${Math.round(wordCount / 2.5)} sec` :
      format === "instagram_reel" ? `${Math.round(wordCount / 2.5)} sec` :
      `${Math.round(wordCount / 30)} slides`,
    predictions: {
      views: `${estimatedMinViews.toLocaleString()} - ${estimatedMaxViews.toLocaleString()}`,
      engagementRate: `${engagementRate}%`,
      competition: competition
    }
  };
}

// ═══════════════════════════════════════════════
// MAIN PIPELINE ORCHESTRATOR
// ═══════════════════════════════════════════════
export async function generateContent(apiKey, {
  niche,
  audience,
  platform,
  format,
  style,
  trendData,
  newsData,
  keywords,
}) {
  const stages = {};

  // Stage 1: Research
  stages.research = await runResearcher(apiKey, {
    niche,
    audience,
    trendData,
    newsData,
  });

  // Stage 2: Write
  const rawScript = await runWriter(apiKey, {
    research: stages.research,
    format,
    niche,
    audience,
    keywords,
  });

  // Stage 3: Edit
  stages.script = await runEditor(apiKey, {
    script: rawScript,
    format,
    audience,
  });

  // Stage 4: SEO Optimize
  stages.seo = await runSEOOptimizer(apiKey, {
    script: stages.script,
    format,
    niche,
    platform,
  });

  // Stage 5: Quality Score
  stages.quality = scoreContentQuality(stages.script, stages.seo, format);

  return {
    research: stages.research,
    script: stages.script,
    seo: stages.seo,
    quality: stages.quality,
    metadata: {
      niche,
      audience,
      platform,
      format,
      style,
      generatedAt: new Date().toISOString(),
      pipeline: "Researcher → Writer → Editor → SEO Optimizer",
    },
  };
}
