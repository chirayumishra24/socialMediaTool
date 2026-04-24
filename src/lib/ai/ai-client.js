/**
 * SkilizeeAI — Unified Gemini 3.1 Pro Client
 * Central AI wrapper with retry logic, JSON mode, and model selection.
 */

import { GoogleGenAI } from "@google/genai";

let _ai = null;

function getAI() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set");
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

/**
 * Generate content with Gemini.
 * @param {string} prompt
 * @param {"pro"|"flash"} tier — "pro" = Gemini 3.1 Pro, "flash" = fast model
 * @param {boolean} jsonMode — enforce JSON output
 * @param {number} maxRetries
 */
export async function generate(prompt, { tier = "pro", jsonMode = false, maxRetries = 2 } = {}) {
  const ai = getAI();
  const model = tier === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const config = { model, contents: prompt };

      if (jsonMode) {
        config.config = { responseMimeType: "application/json" };
      }

      const response = await ai.models.generateContent(config);
      const text = response.text || "";

      if (jsonMode) {
        return parseJSON(text);
      }
      return text;
    } catch (err) {
      lastError = err;
      console.error(`AI attempt ${attempt + 1} failed:`, err.message);
      if (attempt < maxRetries) {
        await sleep(1000 * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw new Error(`AI generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Generate with structured JSON output
 */
export async function generateJSON(prompt, tier = "pro") {
  return generate(prompt, { tier, jsonMode: true });
}

/**
 * Robust JSON parser — handles markdown-wrapped JSON
 */
function parseJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}

  // Try extracting from markdown code blocks
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock) {
    try { return JSON.parse(jsonBlock[1].trim()); } catch {}
  }

  // Try finding JSON array or object
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch {}
  }

  throw new Error("Failed to parse AI response as JSON");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
