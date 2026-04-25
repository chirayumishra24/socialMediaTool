/**
 * SkilizeeAI — Editor Agent
 * Content polishing: hook scoring, retention loops, CTA optimization.
 */

import { generateJSON } from "./ai-client";

export async function editContent(scriptOrOptions, options = {}) {
  const isObjectInput = typeof scriptOrOptions === "object" && scriptOrOptions !== null;
  const script = isObjectInput ? scriptOrOptions.script || "" : scriptOrOptions || "";
  const mergedOptions = isObjectInput ? { ...scriptOrOptions, ...options } : options;
  const { format = "youtube_long", audience = "general" } = mergedOptions;

  const prompt = `You are a world-class content editor who has polished scripts for MrBeast, Ali Abdaal, and Kurzgesagt.

TASK: Edit and improve the following ${format} script. Return JSON.

ORIGINAL SCRIPT:
"""
${script}
"""

Return this JSON structure:
{
  "editedScript": "the improved full script",
  "hookScore": 0-100,
  "hookFeedback": "what makes the hook work or how to improve it",
  "retentionLoops": ["list of retention triggers you added"],
  "ctaStrength": 0-100,
  "readabilityScore": 0-100,
  "changes": [
    { "type": "hook|retention|cta|clarity|flow", "description": "what was changed and why" }
  ],
  "overallScore": 0-100
}

EDITING RULES:
1. Strengthen the hook — make it impossible to scroll past
2. Add retention loops every 60-90s (questions, teases, callbacks)
3. Remove any generic/filler phrases
4. Make CTAs feel natural, not salesy
5. Ensure language matches ${audience} audience level
6. Maintain original voice and intent`;

  return generateJSON(prompt, "pro");
}
