/**
 * SkilizeeAI — Writer Agent (2026 Edition)
 * Generates dramatically better, more human, platform-optimized scripts.
 */

import { generate } from "./ai-client";

const FORMAT_SPECS = {
  youtube_long: {
    name: "YouTube Long-form",
    duration: "8-20 minutes",
    structure: "Cold Open Hook (0-15s) → Context Bridge (15s-1m) → 3-5 Content Chapters with timestamps → Emotional Climax → CTA → Outro",
    notes: "Include B-roll/visual cues in [brackets], chapter timestamps, pattern interrupts every 90s, open loops between sections, curiosity gaps before each chapter transition. Write camera directions.",
  },
  youtube_short: {
    name: "YouTube Short",
    duration: "30-60 seconds",
    structure: "Pattern-interrupt hook (0-2s) → One powerful insight with proof → Unexpected twist → Rewatch trigger + CTA",
    notes: "First frame must stop the scroll. Use text overlay cues [TEXT: ...]. End with a loop or cliffhanger that encourages rewatch. Vertical format.",
  },
  instagram_reel: {
    name: "Instagram Reel",
    duration: "30-90 seconds",
    structure: "Visual pattern-interrupt (0-1s) → Problem agitation → Solution reveal → Save-worthy takeaway → CTA overlay",
    notes: "Text overlays drive retention. Suggest trending audio. Make it save-worthy with a surprising stat or framework. Include [VISUAL: ...] cues.",
  },
  instagram_carousel: {
    name: "Instagram Carousel",
    duration: "8-12 slides",
    structure: "Slide 1: Bold hook question/claim → Slides 2-3: Problem → Slides 4-8: Framework/Solution → Slide 9: Summary → Slide 10: CTA",
    notes: "Max 25 words per slide. Each slide must create a reason to swipe. Use data, frameworks, or contrarian takes. Make it screenshot-worthy.",
  },
  x_thread: {
    name: "X/Twitter Thread",
    duration: "8-15 tweets",
    structure: "Tweet 1: Banger claim or story hook → Tweets 2-12: Numbered insights with proof → Tweet 13: Surprising conclusion → Tweet 14: CTA + repost ask",
    notes: "Each tweet max 280 chars. Tweet 1 is EVERYTHING — it must stop the scroll. Use numbers, bold claims, or 'I studied X and here's what I found'. Mix data tweets with story tweets.",
  },
  linkedin_post: {
    name: "LinkedIn Post",
    duration: "1000-1800 characters",
    structure: "Hook line (controversial or surprising) → White space → Personal story/insight → 3-5 key takeaways → Soft CTA with question",
    notes: "First line must stop the feed. Use lots of line breaks. Mix personal experience with data. End with an engaging question. No hashtag spam — max 3-5 relevant ones.",
  },
  blog_article: {
    name: "Blog Article",
    duration: "1500-3000 words",
    structure: "H1 with keyword → Intro hook with stat/story → H2 sections (4-6) each with actionable content → FAQ section → Conclusion with CTA",
    notes: "SEO-optimized headings (include target keyword naturally). Each H2 should answer a specific question. Include internal linking suggestions, data citations, and a structured FAQ for featured snippets.",
  },
};

const STYLES = {
  professional: "Professional, authoritative, data-backed. Like a McKinsey analyst presenting to a boardroom.",
  casual: "Casual, conversational, warm. Like a smart friend explaining over coffee. Use contractions, rhetorical questions.",
  hinglish: "Hinglish (Hindi+English mix). Relatable Indian internet culture. Use common Hindi phrases naturally woven into English.",
  story: "Story-driven, narrative arc. Open with a scene, build tension, deliver the lesson through lived experience.",
  data: "Data-heavy, research-backed. Every claim has a number. Use 'according to...', 'research shows...'. Cite specific studies.",
  provocative: "Contrarian, bold. Challenge conventional wisdom. Start with 'Everyone says X. They're wrong.' Spark debate.",
  educational: "Teacher-like, clear, step-by-step. Use analogies, examples, and progressive complexity. Make complex simple.",
};

export async function generateScript({
  keyword,
  format = "youtube_long",
  style = "professional",
  audience = "general audience",
  research = null,
  location = "IN",
  language = "en",
  brandVoice = null,
} = {}) {
  const spec = FORMAT_SPECS[format] || FORMAT_SPECS.youtube_long;
  const styleDesc = STYLES[style] || STYLES.professional;
  const today = new Date().toISOString().split("T")[0];

  let researchContext = "";
  if (research) {
    const parts = ["═══ VERIFIED RESEARCH INTELLIGENCE ═══"];
    if (research.summary) parts.push(`Summary: ${research.summary}`);
    if (research.angles?.length) parts.push(`Angles: ${research.angles.map(a => typeof a === "string" ? a : a.angle || a.title || JSON.stringify(a)).join("; ")}`);
    if (research.hooks?.length) parts.push(`Hooks: ${research.hooks.map(h => typeof h === "string" ? h : h.hook || h.text || JSON.stringify(h)).join("; ")}`);
    if (research.topKeywords?.length) parts.push(`Trending Keywords: ${research.topKeywords.join(", ")}`);
    parts.push("═══════════════════════════════════════");
    researchContext = parts.join("\n");
  }

  const brandCtx = brandVoice
    ? `\nBRAND VOICE: Tone=${brandVoice.tone || "N/A"}, Audience=${brandVoice.audience || "N/A"}, Values=${brandVoice.values || "N/A"}, AVOID: ${brandVoice.avoidWords || "None"}\n`
    : "";

  const prompt = `You are one of the world's top content strategists — your scripts consistently get millions of views.

TODAY: ${today}. Your script MUST feel current, referencing 2025-2026 developments where relevant.

TASK: Write a COMPLETE, PRODUCTION-READY ${spec.name} script.

TOPIC: "${keyword}"
FORMAT: ${spec.name} (${spec.duration})
TONE: ${styleDesc}
AUDIENCE: ${audience}
LOCATION: ${location}
LANGUAGE: ${language === "hi" ? "Hindi" : language === "hinglish" ? "Hinglish" : "English"}

${researchContext}
${brandCtx}

FORMAT STRUCTURE: ${spec.structure}
FORMAT NOTES: ${spec.notes}

═══ QUALITY STANDARDS (NON-NEGOTIABLE) ═══

1. HOOK: The first 2-3 lines must be IMPOSSIBLE to ignore. Use one of these proven patterns:
   - Shocking statistic: "97% of parents don't know this about..."
   - Contrarian take: "Everything you've been told about X is wrong"
   - Story cold-open: "Last Tuesday, a principal in Bangalore did something no one expected..."
   - Curiosity gap: "There's one thing that separates top students from everyone else. And it's not what you think."

2. SPECIFICITY: Never be generic. Replace every vague claim with a specific example, number, or story.
   - BAD: "Many schools are adopting AI"
   - GOOD: "In January 2026, 340 CBSE schools integrated AI tutoring — and dropout rates fell 23%"

3. RETENTION ARCHITECTURE: Build in a retention trigger every 60-90 seconds:
   - Open loop: "But there's a catch — I'll get to that in a moment"
   - Question: "Now ask yourself — does YOUR child's school do this?"
   - Tease: "The third point is the one that shocked even me"
   - Pattern interrupt: [CUT TO B-ROLL] or [SWITCH CAMERA ANGLE]

4. EMOTIONAL DEPTH: Connect to real human emotions. Parents worry about their children's future. Students feel pressure. Teachers feel overwhelmed. Tap into these authentically.

5. ACTIONABLE VALUE: The viewer/reader must leave with at least ONE thing they can DO immediately. Not just inspiration — concrete action.

6. NATURAL LANGUAGE: Write like a real human speaks. No corporate buzzwords. No "In today's rapidly evolving landscape..." garbage. Be direct, warm, and real.

7. CTA: End with a specific, natural call-to-action that feels like a genuine invitation, not a sales pitch.

8. 2026 CURRENCY: Reference at least 1-2 specific 2025-2026 developments, policies, tools, or cultural moments relevant to this topic.

Write the COMPLETE script now. Every single line must earn its place. If a line doesn't hook, inform, or move — cut it.`;

  return generate(prompt, { tier: "pro" });
}

export async function generateBundle(options) {
  const formats = options.formats || ["instagram_reel", "x_thread", "linkedin_post"];
  const results = await Promise.all(
    formats.map(format =>
      generateScript({ ...options, format }).then(script => ({ format, script }))
    )
  );
  return results.reduce((acc, curr) => ({ ...acc, [curr.format]: curr.script }), {});
}

export { FORMAT_SPECS, STYLES };
