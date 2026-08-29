/**
 * SkilizeeAI — Editor Agent (2026 Edition)
 * Ruthless content polishing: hook scoring, retention loops, CTA optimization.
 */

import { generateJSON } from "./ai-client";

export async function editContent(scriptOrOptions, options = {}) {
  const isObjectInput = typeof scriptOrOptions === "object" && scriptOrOptions !== null;
  const script = isObjectInput ? scriptOrOptions.script || "" : scriptOrOptions || "";
  const mergedOptions = isObjectInput ? { ...scriptOrOptions, ...options } : options;
  const { format = "youtube_long", audience = "general", research = null, tier = "flash" } = mergedOptions;
  const summarizedResearch = summarizeResearch(research);
  const researchContext = summarizedResearch ? `

RESEARCH CONTEXT:
${JSON.stringify(summarizedResearch, null, 2)}
` : "";

  const prompt = `You are a ruthless content editor. Your edits have turned average scripts into viral hits.

TASK: Edit and drastically improve this ${format} script. Be AGGRESSIVE with improvements.

ORIGINAL SCRIPT:
"""
${script}
"""
${researchContext}

YOUR EDITING PHILOSOPHY & MANDATORY SKILL STANDARDS:
1. AVOID AI WRITING (PURGE ALL AI-ISMS):
   - Scan for and REPLACE all Tier 1/2 AI vocabulary (delve, landscape, tapestry, realm, cutting-edge, leverage, seamless, game-changer, unpack, robust, holistic, utilize, foster, elevate, revolutionize, myriad, overarching, embark, nestled, bustling, etc.).
   - Cut hollow intensifiers: "genuinely", "actually", "truly", "quite frankly", "let's be clear", "it's worth noting that".
   - Fix "It's not X — it's Y" and split-negation reveals with direct positive statements.
   - Remove aphorism formulas ("X is the currency/language of Y") and replace with concrete claims.
   - Strip generic future-narrative closers ("poised to become the defining trend...").
   - Strip robotic transitions ("Moreover", "Furthermore", "In today's fast-paced world", "At the end of the day").
   - Eliminate em dashes (—). Replace with periods, commas, or parentheses.
   - Strip emoji from headers. Cap social hashtags to 2-3 maximum.

2. CONTENT REPURPOSING & MEDIUM INTEGRITY:
   - Verify format constraints: Carousel (max 25 words per slide, slide 1 bold hook), Reel/Short (visual/audio pattern interrupt in 0-2s, conversational spoken cadence), LinkedIn (first-line hook, generous line breaks), Thread (tweet-by-tweet clarity), Blog (clean H1/H2 hierarchy).
   - Ensure the piece stands 100% on its own with full self-contained value.

3. POLISHING:
   - Every line must EARN its place. If it doesn't hook, inform, or move — rewrite or cut it.
   - Replace every generic phrase with a specific example, number, or story.
   - The hook must be impossible to scroll past — rewrite it if it's weak.
   - Add retention triggers every 60-90 seconds (open loops, questions, teases, pattern interrupts).
   - CTAs should feel like genuine invitations, not sales pitches.
   - Reference 2025-2026 developments where relevant to feel current.

Return this JSON:
{
  "editedScript": "the fully improved script — completely purged of AI-isms and tuned for the medium",
  "hookScore": 0-100,
  "hookFeedback": "specific feedback on the hook with concrete improvement suggestions",
  "retentionLoops": ["list of specific retention triggers you added and where"],
  "ctaStrength": 0-100,
  "readabilityScore": 0-100,
  "platformFit": 0-100,
  "aiCleanlinessScore": 0-100,
  "formatAdaptationScore": 0-100,
  "contentTypeMatch": 0-100,
  "viralReadiness": 0-100,
  "aiIsmsRemoved": ["specific AI-isms, buzzwords, or formulas purged from the original"],
  "optimizationSummary": [
    "specific optimization the editor made for this platform"
  ],
  "changes": [
    { "type": "hook|retention|cta|clarity|flow|specificity|emotion|anti-ai", "description": "what was changed and WHY it's better" }
  ],
  "overallScore": 0-100
}

SCORING RULES:
- Below 60 = needs significant work
- 60-79 = decent but not viral-worthy
- 80-89 = strong, publishable
- 90+ = exceptional, share-worthy

Be honest with scores. Most scripts land 65-80. Only give 90+ if it's genuinely exceptional.`;

  return generateJSON(prompt, tier);
}

function summarizeResearch(research) {
  if (!research || typeof research !== "object") return null;

  return {
    summary: research.summary || research.executiveSummary || "",
    topAngles: (research.angles || research.suggestedAngles || []).slice(0, 4),
    topHooks: (research.hooks || research.suggestedHooks || []).slice(0, 4),
    recommendedStrategy: research.recommendedStrategy || null,
    viralCheck: research.viralCheck || null,
    trendSignals: (research.trendSignals || []).slice(0, 3),
    evidence: (research.evidence || research.sourceEvidence || []).slice(0, 3).map((item) => {
      if (typeof item === "string") return item;
      return {
        platform: item.platform,
        title: item.title,
        whyItMatters: item.whyItMatters || item.engagementHint || "",
      };
    }),
  };
}
