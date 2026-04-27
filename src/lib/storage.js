/**
 * SkilizeeAI — Simplified localStorage persistence (with workflow statuses & analytics)
 */

import { useMemo, useSyncExternalStore } from "react";

const KEYS = {
  research: "skilizee_research",
  content: "skilizee_content",
};

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
export function saveResearch(data) {
  const all = getResearchHistory();
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
  writeJSON(KEYS.research, all);
  return entry;
}

export function getResearchHistory() {
  return readJSON(KEYS.research);
}

export function useResearchHistory() {
  const rawValue = useStorageString(KEYS.research, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function updateResearchStatus(id, status) {
  const all = getResearchHistory();
  const index = all.findIndex(r => r.id === id);
  if (index >= 0) {
    all[index].status = status;
    all[index].updatedAt = new Date().toISOString();
    writeJSON(KEYS.research, all);
  }
}

// ═══ CONTENT ═══
export function saveContent(data) {
  const all = getContentHistory();
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
  writeJSON(KEYS.content, all);
  
  // Link to research if possible
  if (entry.metadata?.researchId) {
    const research = getResearchHistory();
    const rIndex = research.findIndex(r => r.id === entry.metadata.researchId);
    if (rIndex >= 0) {
      const r = research[rIndex];
      r.relatedContentIds = [...new Set([...(r.relatedContentIds || []), entry.id])];
      writeJSON(KEYS.research, research);
    }
  }
  
  return entry;
}

export function getContentHistory() {
  return readJSON(KEYS.content);
}

export function useContentHistory() {
  const rawValue = useStorageString(KEYS.content, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function updateContentBody(id, script) {
  const all = getContentHistory();
  const index = all.findIndex(c => c.id === id);
  if (index >= 0) {
    all[index].script = script;
    all[index].updatedAt = new Date().toISOString();
    writeJSON(KEYS.content, all);
  }
}

export function updateContentTracking(id, trackingData) {
  const all = getContentHistory();
  const index = all.findIndex(c => c.id === id);
  if (index >= 0) {
    all[index].publication = { ...(all[index].publication || {}), ...(trackingData.publication || {}) };
    all[index].performance = { ...(all[index].performance || {}), ...(trackingData.performance || {}) };
    all[index].updatedAt = new Date().toISOString();
    writeJSON(KEYS.content, all);
    return all[index];
  }
  return null;
}

export function getWorkflowStage(entry) {
  return entry?.status || "saved";
}

// ═══ ANALYTICS ═══
export function useStats() {
  const research = useResearchHistory();
  const content = useContentHistory();

  return useMemo(() => {
    const stats = {
      totalResearch: research.length,
      pendingApproval: research.filter(r => (r.status || "pending") === "pending").length,
      approved: research.filter(r => r.status === "approved").length,
      published: research.filter(r => r.status === "published").length,
      totalContent: content.length,
      totalClicks: content.reduce((acc, c) => acc + (c.performance?.clicks || 0), 0),
      totalViews: content.reduce((acc, c) => acc + (c.performance?.views || 0), 0),
    };
    return stats;
  }, [research, content]);
}

export function usePerformanceInsights() {
  const content = useContentHistory();

  return useMemo(() => {
    const platformMap = {};
    const tagMap = {};
    let totalClicks = 0;
    let totalViews = 0;

    content.forEach(c => {
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

    const topContent = content
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

