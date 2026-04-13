/**
 * EduTrend AI Agent — Content History Storage
 * localStorage-based persistence for generated content packages.
 */

const STORAGE_KEY = "edutrend_content_history";

/**
 * Generate a unique content ID.
 */
function generateId() {
  return `content_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Load all content history from localStorage.
 */
export function getHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

/**
 * Save a new content package to history.
 */
export function saveContent(content) {
  if (typeof window === "undefined") return null;
  
  const history = getHistory();
  
  const contentPackage = {
    id: generateId(),
    title: content.seo?.titles?.[0] || content.research?.selectedTopic || "Untitled Content",
    niche: content.metadata?.niche || "",
    audience: content.metadata?.audience || "",
    platform: content.metadata?.platform || "youtube",
    format: content.metadata?.format || "youtube_longform",
    script: content.script || "",
    research: content.research || {},
    seo: content.seo || {},
    quality: content.quality || {},
    metadata: content.metadata || {},
    status: "draft", // draft → approved → published → archived
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  history.unshift(contentPackage);

  // Keep max 100 entries
  const trimmed = history.slice(0, 100);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save content:", err);
    // If localStorage is full, remove oldest entries
    const reduced = trimmed.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
  }

  return contentPackage;
}

/**
 * Get a specific content package by ID.
 */
export function getContent(id) {
  const history = getHistory();
  return history.find((c) => c.id === id) || null;
}

/**
 * Delete a content package by ID.
 */
export function deleteContent(id) {
  if (typeof window === "undefined") return false;
  const history = getHistory();
  const filtered = history.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered.length < history.length;
}

/**
 * Update the status of a content package.
 */
export function updateStatus(id, status) {
  if (typeof window === "undefined") return null;
  const history = getHistory();
  const idx = history.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  
  history[idx].status = status;
  history[idx].updatedAt = new Date().toISOString();
  
  if (status === "published") {
    history[idx].publishedAt = new Date().toISOString();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history[idx];
}

/**
 * Search content history by keyword.
 */
export function searchHistory(query) {
  if (!query || query.trim().length === 0) return getHistory();
  
  const q = query.toLowerCase().trim();
  const history = getHistory();
  
  return history.filter((c) => {
    const searchable = [
      c.title,
      c.niche,
      c.audience,
      c.platform,
      c.format,
      c.script,
      c.research?.selectedTopic,
      c.research?.mainAngle,
      c.seo?.description,
      ...(c.seo?.titles || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    
    return searchable.includes(q);
  });
}

/**
 * Get content history filtered by criteria.
 */
export function filterHistory({ format, platform, status, dateRange } = {}) {
  let history = getHistory();
  
  if (format) {
    history = history.filter((c) => c.format === format);
  }
  if (platform) {
    history = history.filter((c) => c.platform === platform);
  }
  if (status) {
    history = history.filter((c) => c.status === status);
  }
  if (dateRange?.from) {
    history = history.filter((c) => new Date(c.createdAt) >= new Date(dateRange.from));
  }
  if (dateRange?.to) {
    history = history.filter((c) => new Date(c.createdAt) <= new Date(dateRange.to));
  }
  
  return history;
}

/**
 * Get content summary statistics.
 */
export function getStats() {
  const history = getHistory();
  
  if (history.length === 0) {
    return {
      total: 0,
      byStatus: {},
      byFormat: {},
      byPlatform: {},
      avgQuality: 0,
      thisWeek: 0,
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const byStatus = {};
  const byFormat = {};
  const byPlatform = {};
  let totalQuality = 0;
  let qualityCount = 0;

  history.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byFormat[c.format] = (byFormat[c.format] || 0) + 1;
    byPlatform[c.platform] = (byPlatform[c.platform] || 0) + 1;
    if (c.quality?.score) {
      totalQuality += c.quality.score;
      qualityCount++;
    }
  });

  return {
    total: history.length,
    byStatus,
    byFormat,
    byPlatform,
    avgQuality: qualityCount > 0 ? Math.round(totalQuality / qualityCount) : 0,
    thisWeek: history.filter((c) => new Date(c.createdAt) > weekAgo).length,
  };
}
