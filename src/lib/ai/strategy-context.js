/**
 * Skilizee — Shared Strategy ↔ Calendar Context
 *
 * Stores the active strategy and calendar so either agent can reference the
 * other during generation.  Persists via module-level state (server-side)
 * and exposes digest helpers for compact prompt injection.
 */

// ─── In-memory store (survives across API calls within the same process) ────

let _activeStrategy = null;
let _activeCalendar = null;

// ─── Getters / Setters ─────────────────────────────────────────

export function setActiveStrategy(strategy) {
  _activeStrategy = strategy ? { ...strategy, _persistedAt: new Date().toISOString() } : null;
}

export function getActiveStrategy() {
  return _activeStrategy;
}

export function setActiveCalendar(calendar) {
  _activeCalendar = calendar ? { ...calendar, _persistedAt: new Date().toISOString() } : null;
}

export function getActiveCalendar() {
  return _activeCalendar;
}

// ─── Strategy Digest (compact summary for calendar prompt) ─────

/**
 * Extract a compact, prompt-friendly summary of a strategy.
 * @param {object} strategy — full strategy object from strategy-agent
 * @returns {string} — formatted text block for prompt injection
 */
export function getStrategyDigest(strategy) {
  if (!strategy) return null;

  const pillarsText = (strategy.contentPillars || [])
    .map((p) => `  • ${p.name} (${p.weeklyPercent}%) — Goal: ${p.goal}`)
    .join("\n");

  const mix = strategy.weeklyFormatMix || {};
  const formatLines = Object.entries(mix)
    .map(([fmt, data]) => `  • ${fmt}: ${data.count}/week (${data.percent}%)`)
    .join("\n");

  const funnel = strategy.conversionFunnel || {};
  const funnelText = funnel.endGoal
    ? `Cold → ${funnel.cold || "N/A"}\n  Warm → ${funnel.warm || "N/A"}\n  Hot → ${funnel.hot || "N/A"}\n  End Goal → ${funnel.endGoal}`
    : "Not specified";

  const hooksText = (strategy.viralHooks || [])
    .slice(0, 3)
    .map((h) => `  • "${h.template}"`)
    .join("\n");

  const weeklyCalText = (strategy.weeklyCalendar || [])
    .map((d) => `  • ${d.day}: [${d.format}] ${d.title} — Pillar: ${d.pillar}`)
    .join("\n");

  return `═══ ACTIVE MARKETING STRATEGY (MUST FOLLOW) ═══

Content Pillars:
${pillarsText || "  None defined"}

Weekly Format Mix:
${formatLines || "  Not specified"}

Weekly Calendar Blueprint:
${weeklyCalText || "  Not specified"}

Conversion Funnel:
  ${funnelText}

Viral Hook Templates:
${hooksText || "  None"}

Executive Summary:
  ${strategy.summary || "N/A"}

CRITICAL: Your calendar MUST implement this strategy.
- Each post's "pillar" field must match one of the content pillars above.
- The total format distribution must match the weekly format mix above.
- CTAs should align with the conversion funnel stages.`;
}

// ─── Calendar Digest (compact summary for strategy prompt) ─────

/**
 * Extract a compact, prompt-friendly summary of a calendar.
 * @param {object} calendar — full calendar object from calendar-agent
 * @returns {string} — formatted text block for prompt injection
 */
export function getCalendarDigest(calendar) {
  if (!calendar) return null;

  const entries = calendar.calendar || [];
  const insights = calendar.insights || {};
  const dist = calendar.formatDistribution || {};

  const distText = Object.entries(dist)
    .map(([fmt, data]) => `  • ${fmt}: ${data.count} posts — ${data.reasoning || ""}`)
    .join("\n");

  const pillarsUsed = [...new Set(entries.map((e) => e.pillar).filter(Boolean))];
  const postingDays = [...new Set(entries.map((e) => e.day).filter(Boolean))];
  const postingSlots = [...new Set(entries.map((e) => e.slot).filter(Boolean))];

  const samplePosts = entries
    .slice(0, 5)
    .map((e) => `  • ${e.date} [${e.format}] "${e.topic}" — Pillar: ${e.pillar}`)
    .join("\n");

  return `═══ EXISTING CONTENT CALENDAR (MUST ALIGN WITH) ═══

Date Range: ${calendar.rangeStart || "N/A"} → ${calendar.rangeEnd || "N/A"}
Total Posts: ${entries.length}

Format Distribution:
${distText || "  Not specified"}

Content Pillars Used:
  ${pillarsUsed.join(", ") || "None tagged"}

Posting Days: ${postingDays.join(", ") || "N/A"}
Posting Times: ${postingSlots.join(", ") || "N/A"}

Best Format: ${insights.bestFormat || "N/A"}
Audience Peak: ${insights.audiencePeak || "N/A"}

Sample Posts:
${samplePosts || "  None"}

CRITICAL: Your strategy MUST be consistent with this existing calendar.
- Content pillars should encompass the pillars already assigned to calendar posts.
- The weekly format mix should match the format distribution above.
- Do NOT contradict the posting cadence or format ratios.`;
}
