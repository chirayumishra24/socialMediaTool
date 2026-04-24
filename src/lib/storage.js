/**
 * SkilizeeAI — localStorage persistence
 */

const KEYS = {
  research: "skilizee_research",
  content: "skilizee_content",
  settings: "skilizee_settings",
};

// ═══ RESEARCH ═══
export function saveResearch(data) {
  const all = getResearchHistory();
  const entry = { ...data, id: data.id || genId(), savedAt: new Date().toISOString(), status: "pending" };
  all.unshift(entry);
  if (all.length > 50) all.length = 50;
  localStorage.setItem(KEYS.research, JSON.stringify(all));
  return entry;
}

export function getResearchHistory() {
  try { return JSON.parse(localStorage.getItem(KEYS.research) || "[]"); } catch { return []; }
}

export function updateResearchStatus(id, status) {
  const all = getResearchHistory();
  const item = all.find((r) => r.id === id);
  if (item) { item.status = status; item.updatedAt = new Date().toISOString(); }
  localStorage.setItem(KEYS.research, JSON.stringify(all));
}

export function getApprovedResearch() {
  return getResearchHistory().filter((r) => r.status === "approved");
}

// ═══ CONTENT ═══
export function saveContent(data) {
  const all = getContentHistory();
  const entry = { ...data, id: data.id || genId(), savedAt: new Date().toISOString(), status: "draft" };
  all.unshift(entry);
  if (all.length > 100) all.length = 100;
  localStorage.setItem(KEYS.content, JSON.stringify(all));
  return entry;
}

export function getContentHistory() {
  try { return JSON.parse(localStorage.getItem(KEYS.content) || "[]"); } catch { return []; }
}

export function updateContentStatus(id, status) {
  const all = getContentHistory();
  const item = all.find((c) => c.id === id);
  if (item) { item.status = status; item.updatedAt = new Date().toISOString(); }
  localStorage.setItem(KEYS.content, JSON.stringify(all));
}

export function deleteContent(id) {
  const all = getContentHistory().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.content, JSON.stringify(all));
}

// ═══ SETTINGS ═══
export function saveSettings(settings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.settings) || "{}");
  } catch { return {}; }
}

// ═══ STATS ═══
export function getStats() {
  const research = getResearchHistory();
  const content = getContentHistory();
  return {
    totalResearch: research.length,
    pendingApproval: research.filter((r) => r.status === "pending").length,
    approved: research.filter((r) => r.status === "approved").length,
    totalContent: content.length,
    drafts: content.filter((c) => c.status === "draft").length,
    published: content.filter((c) => c.status === "published").length,
  };
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 8); }
