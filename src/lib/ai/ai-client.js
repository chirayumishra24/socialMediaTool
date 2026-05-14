/**
 * SkilizeeAI — Unified AI Client (2026 Edition)
 * Gemini for research/SEO/editing, GPT-4.1 for script generation.
 */

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

let _ai = null;
let _openai = null;

function getAI() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set");
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

function getOpenAI() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set — required for script generation (GPT-4.1)");
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

/**
 * Generate content with Gemini (used for research, SEO, editing).
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
      console.error(`Gemini attempt ${attempt + 1} failed:`, err.message);
      if (attempt < maxRetries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw new Error(`Gemini generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Generate content with GPT-4.1 (used for script generation).
 * @param {string} prompt
 * @param {object} options
 * @param {number} options.maxRetries
 * @param {number} options.temperature — 0.7 default for creative writing
 * @param {number} options.maxTokens — cap output length
 */
export async function generateGPT(prompt, { maxRetries = 2, temperature = 0.7, maxTokens = 8192 } = {}) {
  const client = getOpenAI();

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: "You are an elite content strategist and script writer. Write production-ready scripts that are specific, human, and platform-optimized." },
          { role: "user", content: prompt },
        ],
        temperature,
        max_completion_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || "";
    } catch (err) {
      lastError = err;
      // Log the full error to help debug 500 errors in the terminal
      console.error(`GPT-5.4-mini Error (Attempt ${attempt + 1}):`, {
        message: err.message,
        status: err.status,
        type: err.type,
        code: err.code
      });
      
      if (attempt < maxRetries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw new Error(`GPT-5.4-mini failed: ${lastError?.message}`);
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
