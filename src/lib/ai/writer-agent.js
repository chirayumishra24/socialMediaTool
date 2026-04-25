/**
 * SkilizeeAI — Writer Agent
 * Multi-format, platform-specific content generation.
 */

import { generate } from "./ai-client";

const FORMAT_SPECS = {
  youtube_long: {
    name: "YouTube Long-form",
    duration: "8-20 minutes",
    structure: "Hook (0-30s) → Context (30s-2m) → Main Content with 3-5 chapters → CTA → Outro",
    notes: "Include B-roll suggestions, chapter timestamps, pattern interrupts every 2-3 min, retention loops",
  },
  youtube_short: {
    name: "YouTube Short",
    duration: "15-60 seconds",
    structure: "Hook (0-3s) → One key insight → Twist/payoff → CTA",
    notes: "Pattern-interrupt in first 2s, text overlay cues, vertical format",
  },
  instagram_reel: {
    name: "Instagram Reel",
    duration: "15-90 seconds",
    structure: "Visual hook (0-2s) → Problem → Solution → CTA overlay",
    notes: "Text-overlay driven, trending audio suggestion, save-worthy",
  },
  instagram_carousel: {
    name: "Instagram Carousel",
    duration: "8-12 slides",
    structure: "Hook slide → Problem slides → Solution slides → Summary → CTA slide",
    notes: "Each slide max 30 words, swipe psychology, save-worthy data/tips",
  },
  x_thread: {
    name: "X/Twitter Thread",
    duration: "5-15 tweets",
    structure: "Banger opener → Numbered insights → Data/proof → CTA + retweet ask",
    notes: "Each tweet max 280 chars, engagement hooks between tweets, contrarian angle",
  },
  linkedin_post: {
    name: "LinkedIn Post",
    duration: "800-1500 characters",
    structure: "Hook line → Story/insight → Key takeaways → Soft CTA",
    notes: "Professional tone, personal experience angle, line breaks for readability",
  },
  blog_article: {
    name: "Blog Article",
    duration: "1000-3000 words",
    structure: "H1 → Intro hook → H2 sections (3-5) → Conclusion → CTA",
    notes: "SEO-optimized headings, internal linking suggestions, FAQ section",
  },
};

const STYLES = {
  professional: "Professional, data-backed, authoritative tone",
  casual: "Casual, conversational, relatable Gen-Z friendly tone",
  hinglish: "Hinglish (Hindi+English mix), relatable Indian internet culture",
  story: "Story-driven, narrative arc, emotional journey",
  data: "Data-driven, statistics-heavy, research-backed",
  provocative: "Contrarian, bold claims, debate-sparking, pattern-interrupting",
  educational: "Teacher-like, step-by-step, clear explanations",
};

const PERSONA_SPECS = {
  visionary: "Visionary Leader: Focus on the future of education, bold transformations, and inspiring parents to think ahead. Use vocabulary like 'frontier', 'evolution', 'paradigm shift'. Speak with a sense of exciting momentum.",
  nurturing: "Nurturing Mentor: Focus on child safety, emotional well-being, and personalized growth. Use warm, empathetic language like 'support', 'journey', 'care', 'safe space'. Speak like a trusted advisor to parents.",
  authoritative: "Professional Expert: Focus on academic excellence, data-backed results, and strict standards. Use direct, precise language like 'measurable', 'standardized', 'excellence', 'rigorous'. Speak with undeniable credibility.",
  community: "Community Pillar: Focus on local impact, inclusivity, and shared growth. Use warm, welcoming language like 'together', 'our family', 'local community', 'belonging'. Speak like a pillar of the neighborhood.",
};

/**
 * Generate a content script from research.
 */
export async function generateScript({
  keyword,
  format = "youtube_long",
  style = "professional",
  audience = "general audience",
  research = null,
  approvedAngles = [],
  location = "IN",
  language = "en",
  brandVoice = null,
  directorPersona = "visionary",
  schoolContext = "", // NEW: Knowledge Base Context
} = {}) {
  const spec = FORMAT_SPECS[format] || FORMAT_SPECS.youtube_long;
  const styleDesc = STYLES[style] || STYLES.professional;
  const personaDesc = PERSONA_SPECS[directorPersona] || PERSONA_SPECS.visionary;

  let researchContext = "";
  if (research) {
    const parts = ["RESEARCH INTELLIGENCE (use this to make the script highly specific and data-driven):"];
    if (research.summary) parts.push(`- Executive Summary: ${research.summary}`);
    if (research.angles?.length) parts.push(`- Suggested Angles: ${research.angles.map(a => typeof a === "string" ? a : a.angle || a.title || JSON.stringify(a)).join("; ")}`);
    if (research.hooks?.length) parts.push(`- Hook Ideas: ${research.hooks.map(h => typeof h === "string" ? h : h.hook || h.text || JSON.stringify(h)).join("; ")}`);
    if (research.topKeywords?.length) parts.push(`- Trending Keywords: ${research.topKeywords.join(", ")}`);
    if (research.platformInsights) {
      const pi = research.platformInsights;
      if (pi.youtubeCount) parts.push(`- YouTube: ${pi.youtubeCount} videos found. Top: "${pi.topVideoTitle}" (${pi.topVideoViews?.toLocaleString()} views)`);
      if (pi.redditCount) parts.push(`- Reddit: ${pi.redditCount} discussions found`);
      if (pi.newsCount) parts.push(`- News: ${pi.newsCount} recent articles`);
    }
    if (approvedAngles.length) parts.push(`- APPROVED ANGLES: ${approvedAngles.map((a) => a.angle).join("; ")}`);
    researchContext = parts.join("\n");
  }

  const schoolKnowledgeContext = schoolContext 
    ? `
=== INSTITUTIONAL KNOWLEDGE BASE (INTERNAL TRUTH) ===
You MUST adhere to the following school-specific rules, mission, and context:
${schoolContext}
=====================================================
` 
    : "";

  const brandVoiceContext = brandVoice 
    ? `
=== BRAND VOICE & GUIDELINES ===
- Tone: ${brandVoice.tone || "N/A"}
- Target Audience: ${brandVoice.audience || "N/A"}
- Core Values: ${brandVoice.values || "N/A"}
- WORDS TO AVOID: ${brandVoice.avoidWords || "None"}
================================
`
    : "";

  const prompt = `You are a highly respected School Director and Educational Content Strategist. 

TASK: Write a complete ${spec.name} script.

TOPIC: "${keyword}"
FORMAT: ${spec.name} (${spec.duration})
STYLE: ${styleDesc}
DIRECTOR PERSONA: ${personaDesc}
AUDIENCE: ${audience}
LOCATION: ${location}
LANGUAGE: ${language === "hi" ? "Hindi" : language === "hinglish" ? "Hinglish" : "English"}

${schoolKnowledgeContext}
${researchContext}
${brandVoiceContext}

FORMAT STRUCTURE: ${spec.structure}
FORMAT NOTES: ${spec.notes}

REQUIREMENTS:
1. ADOPT THE DIRECTOR PERSONA: Speak with the exact voice of the selected leadership style.
2. INTERNAL TRUTH FIRST: Prioritize the Institutional Knowledge Base over general trends. If the school policy conflicts with a trend, the policy wins.
3. The hook MUST be irresistible — use curiosity gap, bold claim, or shocking stat.
4. Every 60-90 seconds should have a retention trigger (question, tease, pattern interrupt).
5. EXACTLY MATCH THE BRAND VOICE TONE AND NEVER USE THE "WORDS TO AVOID".

Write the COMPLETE script now. Be specific, not generic. Every line should earn its place.`;

  return generate(prompt, { tier: "pro" });
}

/**
 * Generate a bundle of scripts for different platforms.
 */
export async function generateBundle(options) {
  const formats = options.formats || ["instagram_reel", "x_thread", "linkedin_post"];
  
  const bundlePromises = formats.map(format => 
    generateScript({ ...options, format })
      .then(script => ({ format, script }))
  );
  
  const results = await Promise.all(bundlePromises);
  return results.reduce((acc, curr) => ({ ...acc, [curr.format]: curr.script }), {});
}

export { FORMAT_SPECS, STYLES };
