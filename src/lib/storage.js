/**
 * SkilizeeAI — Multi-Account localStorage persistence (with workflow statuses & analytics)
 * 
 * All storage keys are dynamically scoped by the active account's prefix.
 * This ensures complete data isolation between accounts (e.g. Skillizee vs CCIS).
 */

import { useMemo, useSyncExternalStore } from "react";

/**
 * Build account-scoped storage keys.
 * @param {string} prefix - Account storage prefix (e.g. "skilizee", "ccis")
 */
function getKeys(prefix = "skilizee") {
  return {
    research: `${prefix}_research`,
    content: `${prefix}_content`,
    ig_analysis: `${prefix}_ig_analysis`,
    strategies: `${prefix}_saved_strategies`,
    active_strategy: `${prefix}_active_strategy`,
    active_calendar: `${prefix}_active_calendar`,
  };
}

// Default keys for backward compatibility
const KEYS = getKeys("skilizee");

const STORAGE_EVENT = "skilizee-storage-updated";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON(key) {
  if (!canUseStorage()) return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function writeJSON(key, value) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

function readStorageString(key, fallback) {
  if (!canUseStorage()) return fallback;
  return localStorage.getItem(key) ?? fallback;
}

function parseArraySnapshot(rawValue) {
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeToStorage(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function useStorageString(key, fallback) {
  return useSyncExternalStore(
    subscribeToStorage,
    () => readStorageString(key, fallback),
    () => fallback
  );
}

// ═══ RESEARCH ═══
export function saveResearch(data, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getResearchHistory(prefix);
  const entry = {
    ...data,
    id: data.id || genId(),
    keyword: data.keyword || "Untitled",
    status: data.status || "pending",
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const existingIndex = all.findIndex(r => r.id === entry.id);
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.unshift(entry);
  }
  
  if (all.length > 50) all.length = 50;
  writeJSON(keys.research, all);
  return entry;
}

export function getResearchHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSON(keys.research);
}

export function useResearchHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  const rawValue = useStorageString(keys.research, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function updateResearchStatus(id, status, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getResearchHistory(prefix);
  const index = all.findIndex(r => r.id === id);
  if (index >= 0) {
    all[index].status = status;
    all[index].updatedAt = new Date().toISOString();
    writeJSON(keys.research, all);
  }
}

// ═══ CONTENT ═══
export function saveContent(data, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getContentHistory(prefix);
  const entry = {
    ...data,
    id: data.id || genId(),
    keyword: data.keyword || data.metadata?.keyword || "Untitled",
    format: data.format || data.metadata?.format || "youtube_long",
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const existingIndex = all.findIndex(c => c.id === entry.id);
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.unshift(entry);
  }
  
  if (all.length > 100) all.length = 100;
  writeJSON(keys.content, all);
  
  // Link to research if possible
  if (entry.metadata?.researchId) {
    const research = getResearchHistory(prefix);
    const rIndex = research.findIndex(r => r.id === entry.metadata.researchId);
    if (rIndex >= 0) {
      const r = research[rIndex];
      r.relatedContentIds = [...new Set([...(r.relatedContentIds || []), entry.id])];
      writeJSON(keys.research, research);
    }
  }
  
  return entry;
}

export function getContentHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSON(keys.content);
}

export function useContentHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  const rawValue = useStorageString(keys.content, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function updateContentBody(id, script, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getContentHistory(prefix);
  const index = all.findIndex(c => c.id === id);
  if (index >= 0) {
    all[index].script = script;
    all[index].updatedAt = new Date().toISOString();
    writeJSON(keys.content, all);
  }
}

export function updateContentTracking(id, trackingData, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getContentHistory(prefix);
  const index = all.findIndex(c => c.id === id);
  if (index >= 0) {
    all[index].publication = { ...(all[index].publication || {}), ...(trackingData.publication || {}) };
    all[index].performance = { ...(all[index].performance || {}), ...(trackingData.performance || {}) };
    all[index].updatedAt = new Date().toISOString();
    writeJSON(keys.content, all);
    return all[index];
  }
  return null;
}

export function getWorkflowStage(entry) {
  return entry?.status || "saved";
}

// ═══ ANALYTICS & STATS ═══
export function getStats(prefix = "skilizee") {
  const research = getResearchHistory(prefix);
  const content = getContentHistory(prefix);
  return {
    totalResearch: Array.isArray(research) ? research.length : 0,
    totalScripts: Array.isArray(content) ? content.length : 0,
    totalContent: Array.isArray(content) ? content.length : 0,
    pendingApproval: (Array.isArray(research) ? research : []).filter(r => (r.status || "pending") === "pending").length,
    approved: (Array.isArray(content) ? content : []).filter(c => c.status === "approved" || c.workflowStage === "approved").length,
    published: (Array.isArray(content) ? content : []).filter(c => c.status === "published" || c.workflowStage === "published").length,
    totalClicks: (Array.isArray(content) ? content : []).reduce((acc, c) => acc + (c.performance?.clicks || 0), 0),
    totalViews: (Array.isArray(content) ? content : []).reduce((acc, c) => acc + (c.performance?.views || 0), 0),
  };
}

export function useStats(prefix = "skilizee") {
  const research = useResearchHistory(prefix);
  const content = useContentHistory(prefix);

  return useMemo(() => {
    const researchArr = Array.isArray(research) ? research : [];
    const contentArr = Array.isArray(content) ? content : [];
    const stats = {
      totalResearch: researchArr.length,
      totalScripts: contentArr.length,
      totalContent: contentArr.length,
      pendingApproval: researchArr.filter(r => (r.status || "pending") === "pending").length,
      approved: contentArr.filter(c => c.status === "approved" || c.workflowStage === "approved").length,
      published: contentArr.filter(c => c.status === "published" || c.workflowStage === "published").length,
      totalClicks: contentArr.reduce((acc, c) => acc + (c.performance?.clicks || 0), 0),
      totalViews: contentArr.reduce((acc, c) => acc + (c.performance?.views || 0), 0),
    };
    return stats;
  }, [research, content]);
}

export function usePerformanceInsights(prefix = "skilizee") {
  const content = useContentHistory(prefix);

  return useMemo(() => {
    const contentArr = Array.isArray(content) ? content : [];
    const platformMap = {};
    const tagMap = {};
    let totalClicks = 0;
    let totalViews = 0;

    contentArr.forEach(c => {
      const clicks = c.performance?.clicks || 0;
      const views = c.performance?.views || 0;
      const platform = c.publication?.platform || "unknown";
      const tags = c.tagSnapshot || [];

      totalClicks += clicks;
      totalViews += views;

      if (!platformMap[platform]) platformMap[platform] = 0;
      platformMap[platform] += clicks;

      tags.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = { totalClicks: 0, posts: 0 };
        tagMap[tag].totalClicks += clicks;
        tagMap[tag].posts += 1;
      });
    });

    const platformPerformance = Object.entries(platformMap).map(([platform, totalClicks]) => ({
      platform,
      totalClicks
    }));

    const topTags = Object.entries(tagMap)
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.totalClicks - a.totalClicks);

    const topContent = contentArr
      .map(c => ({
        id: c.id,
        keyword: c.keyword,
        format: c.format,
        views: c.performance?.views || 0,
        clicks: c.performance?.clicks || 0,
        ctr: c.performance?.views ? ((c.performance.clicks / c.performance.views) * 100).toFixed(1) : "0.0",
        tags: c.tagSnapshot || [],
        publishedUrl: c.publication?.publishedUrl
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      platformPerformance,
      topTags,
      topContent,
      totals: {
        avgCtr: totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0"
      }
    };
  }, [content]);
}

// --- SETTINGS (MOCK) ---
export function useSettingsSnapshot() {
  return { schoolName: "Skilizee Academy", schoolVision: "Shaping the future of education" };
}

// ═══ INSTAGRAM ANALYSES ═══
export function saveAnalysis(data, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getAnalysisHistory(prefix);
  const entry = {
    ...data,
    id: data.id || genId(),
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const existingIndex = all.findIndex(a => a.id === entry.id || a.profile?.username === entry.profile?.username);
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.unshift(entry);
  }
  
  if (all.length > 20) all.length = 20; // Cap at 20 historical audits
  writeJSON(keys.ig_analysis, all);
  return entry;
}

export function getAnalysisHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSON(keys.ig_analysis);
}

export function useAnalysisHistory(prefix = "skilizee") {
  const keys = getKeys(prefix);
  const rawValue = useStorageString(keys.ig_analysis, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function saveStrategy(data, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getSavedStrategies(prefix);
  const entry = {
    ...data,
    id: data.id || `strategy_${Date.now()}`,
    savedAt: data.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(entry);
  if (all.length > 30) all.length = 30;
  writeJSON(keys.strategies, all);
  return entry;
}

export function getSavedStrategies(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSON(keys.strategies);
}

export function useSavedStrategies(prefix = "skilizee") {
  const keys = getKeys(prefix);
  const rawValue = useStorageString(keys.strategies, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function deleteStrategy(id, prefix = "skilizee") {
  const keys = getKeys(prefix);
  const all = getSavedStrategies(prefix).filter(s => s.id !== id);
  writeJSON(keys.strategies, all);
}

// ═══ ACTIVE STRATEGY & CALENDAR CONTEXT (Client-side) ═══

function readJSONObject(key) {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function writeJSONObject(key, value) {
  if (!canUseStorage()) return;
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

export function setClientActiveStrategy(strategy, prefix = "skilizee") {
  const keys = getKeys(prefix);
  writeJSONObject(keys.active_strategy, strategy ? { ...strategy, _clientPersistedAt: new Date().toISOString() } : null);
}

export function getClientActiveStrategy(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSONObject(keys.active_strategy);
}

export function setClientActiveCalendar(calendar, prefix = "skilizee") {
  const keys = getKeys(prefix);
  writeJSONObject(keys.active_calendar, calendar ? { ...calendar, _clientPersistedAt: new Date().toISOString() } : null);
}

export function getClientActiveCalendar(prefix = "skilizee") {
  const keys = getKeys(prefix);
  return readJSONObject(keys.active_calendar);
}

/**
 * Check if a calendar's format distribution aligns with a strategy's weeklyFormatMix.
 * Returns { aligned: boolean, mismatches: string[] }
 */
export function checkStrategyCalendarAlignment(strategy, calendar) {
  if (!strategy || !calendar) return { aligned: true, mismatches: [] };

  const mismatches = [];
  const mix = strategy.weeklyFormatMix || {};
  const dist = calendar.formatDistribution || {};

  // Check format counts
  const formatMap = { reels: "reels", carousels: "carousels", staticPosts: "static", stories: "stories" };
  for (const [stratKey, distKey] of Object.entries(formatMap)) {
    const expected = mix[stratKey]?.count;
    const actual = dist[distKey]?.count;
    if (expected != null && actual != null && expected !== actual) {
      mismatches.push(`${stratKey}: strategy says ${expected}/week, calendar has ${actual}`);
    }
  }

  // Check pillar coverage
  const strategyPillars = (strategy.contentPillars || []).map(p => p.name?.toLowerCase());
  const calendarPillars = [...new Set((calendar.calendar || []).map(e => e.pillar?.toLowerCase()).filter(Boolean))];
  const missingPillars = strategyPillars.filter(p => p && !calendarPillars.includes(p));
  if (missingPillars.length > 0) {
    mismatches.push(`Missing pillars in calendar: ${missingPillars.join(", ")}`);
  }

  return { aligned: mismatches.length === 0, mismatches };
}
