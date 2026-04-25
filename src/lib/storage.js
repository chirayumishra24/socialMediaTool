/**
 * SkilizeeAI — localStorage persistence
 */

import { useMemo, useSyncExternalStore } from "react";

const KEYS = {
  research: "skilizee_research",
  content: "skilizee_content",
  settings: "skilizee_settings",
};

const STORAGE_EVENT = "skilizee-storage-updated";
const PIPELINE_STATUSES = new Set(["pending", "approved", "in_production", "published", "rejected"]);
const EMPTY_SETTINGS = {};
const EMPTY_PERFORMANCE = {
  views: 0,
  clicks: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  impressions: 0,
};
const EMPTY_PUBLICATION = {
  platform: "",
  publishedUrl: "",
  postId: "",
  mediaId: "",
  publishedAt: "",
  lastSyncedAt: "",
  syncStatus: "",
  syncError: "",
  source: "",
};
const FORMAT_PLATFORMS = {
  youtube_long: ["youtube"],
  youtube_short: ["youtube"],
  instagram_reel: ["instagram"],
  instagram_carousel: ["instagram"],
  x_thread: ["x"],
  linkedin_post: ["linkedin"],
  blog_article: ["blog"],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON(key) {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
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
  } catch {
    return [];
  }
}

function parseObjectSnapshot(rawValue) {
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
}

function normalizeTag(tag) {
  if (typeof tag !== "string") return "";
  const cleanTag = tag.trim().replace(/^#+/, "");
  return cleanTag ? `#${cleanTag.toLowerCase()}` : "";
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getPlatformsForFormat(format) {
  return FORMAT_PLATFORMS[format] || ["general"];
}

function getPrimaryPlatform(format, fallback = "") {
  return fallback || getPlatformsForFormat(format)[0] || "general";
}

function extractTagSnapshot(seo = {}, format = "youtube_long") {
  const tags = [];
  const appendTags = (list = []) => {
    list.forEach((entry) => {
      const value = typeof entry === "string" ? entry : entry?.tag;
      const normalized = normalizeTag(value);
      if (normalized) tags.push(normalized);
    });
  };

  appendTags(seo?.tags?.primary);
  appendTags(seo?.tags?.secondary);
  appendTags(seo?.tags?.longTail);

  getPlatformsForFormat(format).forEach((platform) => {
    appendTags(seo?.tags?.platformSpecific?.[platform]);
  });

  return uniqueValues(tags);
}

function normalizePublication(publication = {}, existing = EMPTY_PUBLICATION, format = "youtube_long") {
  const merged = {
    ...EMPTY_PUBLICATION,
    ...existing,
    ...publication,
  };

  return {
    ...merged,
    platform: merged.platform || getPrimaryPlatform(format),
    publishedUrl: merged.publishedUrl || "",
    postId: merged.postId || merged.mediaId || "",
    mediaId: merged.mediaId || merged.postId || "",
    publishedAt: merged.publishedAt || "",
    lastSyncedAt: merged.lastSyncedAt || "",
    syncStatus: merged.syncStatus || "",
    syncError: merged.syncError || "",
    source: merged.source || (merged.lastSyncedAt ? "meta_instagram" : merged.publishedUrl ? "manual" : ""),
  };
}

function normalizePerformance(performance = {}, existing = EMPTY_PERFORMANCE) {
  const merged = { ...EMPTY_PERFORMANCE, ...existing, ...performance };
  return {
    views: normalizeNumber(merged.views),
    clicks: normalizeNumber(merged.clicks),
    likes: normalizeNumber(merged.likes),
    comments: normalizeNumber(merged.comments),
    shares: normalizeNumber(merged.shares),
    saves: normalizeNumber(merged.saves),
    impressions: normalizeNumber(merged.impressions),
  };
}

function getEngagementCount(performance = EMPTY_PERFORMANCE) {
  return normalizeNumber(performance.likes) +
    normalizeNumber(performance.comments) +
    normalizeNumber(performance.shares) +
    normalizeNumber(performance.saves);
}

function getCtr(performance = EMPTY_PERFORMANCE) {
  const denominator = normalizeNumber(performance.impressions) || normalizeNumber(performance.views);
  if (!denominator) return 0;
  return Number(((normalizeNumber(performance.clicks) / denominator) * 100).toFixed(1));
}

function getContentScore(entry) {
  const performance = entry.performance || EMPTY_PERFORMANCE;
  return (
    normalizeNumber(performance.clicks) * 5 +
    normalizeNumber(performance.views) +
    getEngagementCount(performance) * 3
  );
}

function isPublishedContent(entry) {
  return entry?.status === "published" || Boolean(entry?.publication?.publishedUrl);
}

function normalizeResearchEntry(data = {}, existing = null) {
  const now = new Date().toISOString();
  const relatedContentIds = Array.from(new Set([
    ...(existing?.relatedContentIds || []),
    ...(data.relatedContentIds || []),
    ...(data.relatedContentId ? [data.relatedContentId] : []),
  ]));

  return {
    ...existing,
    ...data,
    id: data.id || existing?.id || genId(),
    keyword: data.keyword || existing?.keyword || "Untitled Topic",
    location: data.location || existing?.location || "IN",
    savedAt: existing?.savedAt || data.savedAt || now,
    updatedAt: now,
    status: resolvePipelineStatus(data.status || existing?.status || "pending"),
    relatedContentIds,
  };
}

function normalizeContentEntry(data = {}, existing = null) {
  const now = new Date().toISOString();
  const metadata = {
    ...(existing?.metadata || {}),
    ...(data.metadata || {}),
  };
  const seo = {
    ...(existing?.seo || {}),
    ...(data.seo || {}),
  };
  const format = data.format || existing?.format || metadata.format || "youtube_long";
  const publication = normalizePublication(data.publication, existing?.publication, format);
  const performance = normalizePerformance(data.performance, existing?.performance);
  const tagSnapshot = uniqueValues([
    ...(existing?.tagSnapshot || []),
    ...(data.tagSnapshot || []),
    ...extractTagSnapshot(seo, format),
  ].map(normalizeTag));
  const status = resolvePipelineStatus(data.status || existing?.status || "pending", "pending");

  return {
    ...existing,
    ...data,
    metadata,
    seo,
    publication,
    performance,
    tagSnapshot,
    id: data.id || existing?.id || genId(),
    keyword: data.keyword || existing?.keyword || metadata.keyword || "Untitled Topic",
    format,
    savedAt: existing?.savedAt || data.savedAt || now,
    updatedAt: now,
    status,
  };
}

function resolvePipelineStatus(status, fallback = "pending") {
  return PIPELINE_STATUSES.has(status) ? status : fallback;
}

function syncContentStatuses(content, researchId, status, researchKeyword = null) {
  const nextStatus = resolvePipelineStatus(status);
  return content.map((item) => {
    const matchesResearch = item.metadata?.researchId === researchId;
    const matchesFallbackKeyword = !researchId && researchKeyword && item.keyword === researchKeyword;
    if (!matchesResearch && !matchesFallbackKeyword) return item;
    return { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
  });
}

function syncResearchStatuses(research, contentId, status, keyword = null) {
  const nextStatus = resolvePipelineStatus(status);
  return research.map((item) => {
    const matchesContent = item.relatedContentIds?.includes(contentId);
    const matchesFallbackKeyword = !contentId && keyword && item.keyword === keyword;
    if (!matchesContent && !matchesFallbackKeyword) return item;
    return { ...item, status: nextStatus, updatedAt: new Date().toISOString() };
  });
}

function ensureResearchLink(research, entry) {
  const requestedResearchId = entry.metadata?.researchId || entry.researchId;
  const directIndex = requestedResearchId ? research.findIndex((item) => item.id === requestedResearchId) : -1;
  const fallbackIndex = directIndex >= 0
    ? directIndex
    : research.findIndex((item) =>
        item.keyword === entry.keyword &&
        (item.location || "IN") === (entry.metadata?.location || entry.location || "IN") &&
        item.status !== "rejected"
      );

  const now = new Date().toISOString();

  if (fallbackIndex >= 0) {
    const existing = research[fallbackIndex];
    research[fallbackIndex] = normalizeResearchEntry({
      ...existing,
      location: entry.metadata?.location || entry.location || existing.location,
      relatedContentIds: [...(existing.relatedContentIds || []), entry.id],
      status: entry.status === "published" ? "published" : existing.status || "pending",
    }, existing);
    return research[fallbackIndex];
  }

  const syntheticResearch = normalizeResearchEntry({
    keyword: entry.keyword,
    location: entry.metadata?.location || entry.location || "IN",
    status: entry.status === "published" ? "published" : "pending",
    source: "content_studio",
    savedAt: now,
    research: entry.research || {
      executiveSummary: "Created from Content Studio without a dedicated research brief.",
      recommendedStrategy: {
        bestAngle: entry.keyword,
        bestFormat: entry.format,
      },
    },
    relatedContentIds: [entry.id],
  });

  research.unshift(syntheticResearch);
  return syntheticResearch;
}

function persistResearchAndContent(research, content) {
  writeJSON(KEYS.research, research);
  writeJSON(KEYS.content, content);
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
  const existingIndex = data.id ? all.findIndex((item) => item.id === data.id) : -1;
  const existing = existingIndex >= 0 ? all[existingIndex] : null;
  const entry = normalizeResearchEntry(data, existing);

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

export function updateResearchStatus(id, status) {
  const research = getResearchHistory();
  const index = research.findIndex((item) => item.id === id);
  if (index < 0) return;

  research[index] = {
    ...research[index],
    status: resolvePipelineStatus(status),
    updatedAt: new Date().toISOString(),
  };

  const content = syncContentStatuses(
    getContentHistory(),
    research[index].id,
    research[index].status,
    research[index].keyword
  );

  persistResearchAndContent(research, content);
}

export function updateResearchDate(id, scheduledDate) {
  const all = getResearchHistory();
  const item = all.find((r) => r.id === id);
  if (!item) return;
  item.scheduledDate = scheduledDate;
  item.updatedAt = new Date().toISOString();
  writeJSON(KEYS.research, all);
}

export function getApprovedResearch() {
  return getResearchHistory().filter((r) => r.status === "approved");
}

export function useResearchHistory() {
  const rawValue = useStorageString(KEYS.research, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

// ═══ CONTENT ═══
export function saveContent(data) {
  const content = getContentHistory();
  const research = getResearchHistory();

  const researchId = data.metadata?.researchId || data.researchId;
  const existingIndex = content.findIndex((item) => {
    if (data.id && item.id === data.id) return true;
    if (researchId && item.metadata?.researchId === researchId && item.format === (data.format || item.format)) return true;
    return false;
  });

  const existing = existingIndex >= 0 ? content[existingIndex] : null;
  const entry = normalizeContentEntry(data, existing);
  const linkedResearch = ensureResearchLink(research, entry);

  entry.metadata = {
    ...entry.metadata,
    keyword: entry.keyword,
    format: entry.format,
    researchId: linkedResearch.id,
    location: entry.metadata?.location || entry.location || linkedResearch.location || "IN",
    platforms: uniqueValues(entry.metadata?.platforms?.length ? entry.metadata.platforms : getPlatformsForFormat(entry.format)),
  };
  entry.status = resolvePipelineStatus(entry.status, linkedResearch.status || "pending");

  if (existingIndex >= 0) {
    content[existingIndex] = entry;
  } else {
    content.unshift(entry);
  }

  if (content.length > 100) content.length = 100;
  persistResearchAndContent(research, content);
  return entry;
}

export function getContentHistory() {
  return readJSON(KEYS.content);
}

export function useContentHistory() {
  const rawValue = useStorageString(KEYS.content, "[]");
  return useMemo(() => parseArraySnapshot(rawValue), [rawValue]);
}

export function updateContentStatus(id, status) {
  const content = getContentHistory();
  const index = content.findIndex((item) => item.id === id);
  if (index < 0) return;

  content[index] = {
    ...content[index],
    status: resolvePipelineStatus(status),
    updatedAt: new Date().toISOString(),
  };

  const research = syncResearchStatuses(
    getResearchHistory(),
    content[index].id,
    content[index].status,
    content[index].keyword
  );

  persistResearchAndContent(research, content);
}

export function updateContentTracking(id, updates = {}) {
  const content = getContentHistory();
  const index = content.findIndex((item) => item.id === id);
  if (index < 0) return null;

  content[index] = normalizeContentEntry({
    ...content[index],
    seo: content[index].seo,
    publication: {
      ...content[index].publication,
      ...(updates.publication || {}),
    },
    performance: {
      ...content[index].performance,
      ...(updates.performance || {}),
    },
    tagSnapshot: updates.tagSnapshot || content[index].tagSnapshot,
  }, content[index]);

  writeJSON(KEYS.content, content);
  return content[index];
}

export function publishContent(id, publication = {}) {
  const content = getContentHistory();
  const index = content.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const current = content[index];
  const nextPublication = normalizePublication({
    ...publication,
    publishedAt: publication.publishedAt || current.publication?.publishedAt || new Date().toISOString(),
  }, current.publication, current.format);

  content[index] = normalizeContentEntry({
    ...current,
    status: "published",
    publication: nextPublication,
    performance: {
      ...current.performance,
      ...(publication.performance || {}),
    },
    tagSnapshot: publication.tagSnapshot || current.tagSnapshot,
  }, current);

  const research = syncResearchStatuses(
    getResearchHistory(),
    content[index].id,
    "published",
    content[index].keyword
  );

  persistResearchAndContent(research, content);
  return content[index];
}

export function updateContentBody(id, script) {
  const all = getContentHistory();
  const item = all.find((c) => c.id === id);
  if (!item) return;
  item.script = script;
  item.updatedAt = new Date().toISOString();
  writeJSON(KEYS.content, all);
}

export function deleteContent(id) {
  const content = getContentHistory().filter((item) => item.id !== id);
  const research = getResearchHistory().map((item) => ({
    ...item,
    relatedContentIds: (item.relatedContentIds || []).filter((contentId) => contentId !== id),
  }));
  persistResearchAndContent(research, content);
}

// ═══ SETTINGS ═══
export function saveSettings(settings) {
  if (!canUseStorage()) return;
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: KEYS.settings } }));
}

export function getSettings() {
  if (!canUseStorage()) return {};
  try {
    return JSON.parse(localStorage.getItem(KEYS.settings) || "{}");
  } catch {
    return {};
  }
}

export function useSettingsSnapshot(defaults = EMPTY_SETTINGS) {
  const rawValue = useStorageString(KEYS.settings, "{}");
  const baseDefaults = defaults;
  return useMemo(
    () => ({ ...baseDefaults, ...parseObjectSnapshot(rawValue) }),
    [baseDefaults, rawValue]
  );
}

// ═══ STATS ═══
export function getStats() {
  const research = getResearchHistory();
  const content = getContentHistory();
  const publishedContent = content.filter(isPublishedContent);
  return {
    totalResearch: research.length,
    pendingApproval: research.filter((r) => r.status === "pending").length,
    approved: research.filter((r) => r.status === "approved").length,
    inProduction: research.filter((r) => r.status === "in_production").length,
    rejected: research.filter((r) => r.status === "rejected").length,
    totalContent: content.length,
    drafts: content.filter((c) => c.status === "draft" || c.status === "pending").length,
    published: publishedContent.length,
    totalClicks: publishedContent.reduce((sum, item) => sum + normalizeNumber(item.performance?.clicks), 0),
    totalViews: publishedContent.reduce((sum, item) => sum + normalizeNumber(item.performance?.views), 0),
  };
}

export function useStats() {
  const research = useResearchHistory();
  const content = useContentHistory();
  const publishedContent = useMemo(
    () => content.filter(isPublishedContent),
    [content]
  );

  return useMemo(() => ({
    totalResearch: research.length,
    pendingApproval: research.filter((item) => item.status === "pending").length,
    approved: research.filter((item) => item.status === "approved").length,
    inProduction: research.filter((item) => item.status === "in_production").length,
    rejected: research.filter((item) => item.status === "rejected").length,
    totalContent: content.length,
    drafts: content.filter((item) => item.status === "draft" || item.status === "pending").length,
    published: publishedContent.length,
    totalClicks: publishedContent.reduce((sum, item) => sum + normalizeNumber(item.performance?.clicks), 0),
    totalViews: publishedContent.reduce((sum, item) => sum + normalizeNumber(item.performance?.views), 0),
  }), [content, publishedContent, research]);
}

export function getPerformanceInsights(content = getContentHistory()) {
  const publishedContent = content
    .filter(isPublishedContent)
    .map((item) => ({
      ...item,
      performance: normalizePerformance(item.performance),
      publication: normalizePublication(item.publication, EMPTY_PUBLICATION, item.format),
      tagSnapshot: item.tagSnapshot?.length ? item.tagSnapshot : extractTagSnapshot(item.seo, item.format),
    }));

  const totals = publishedContent.reduce((acc, item) => {
    acc.posts += 1;
    acc.clicks += normalizeNumber(item.performance.clicks);
    acc.views += normalizeNumber(item.performance.views);
    acc.engagements += getEngagementCount(item.performance);
    return acc;
  }, { posts: 0, clicks: 0, views: 0, engagements: 0 });

  const platformMap = new Map();
  const tagMap = new Map();

  publishedContent.forEach((item) => {
    const platforms = item.metadata?.platforms?.length ? item.metadata.platforms : getPlatformsForFormat(item.format);
    const clicks = normalizeNumber(item.performance.clicks);
    const views = normalizeNumber(item.performance.views);
    const engagements = getEngagementCount(item.performance);
    const ctr = getCtr(item.performance);

    platforms.forEach((platform) => {
      const record = platformMap.get(platform) || {
        platform,
        posts: 0,
        totalClicks: 0,
        totalViews: 0,
        totalEngagements: 0,
        ctrSum: 0,
      };
      record.posts += 1;
      record.totalClicks += clicks;
      record.totalViews += views;
      record.totalEngagements += engagements;
      record.ctrSum += ctr;
      platformMap.set(platform, record);
    });

    item.tagSnapshot.forEach((tag) => {
      const record = tagMap.get(tag) || {
        tag,
        posts: 0,
        totalClicks: 0,
        totalViews: 0,
        totalEngagements: 0,
        ctrSum: 0,
        formats: new Set(),
        lastPublishedAt: "",
      };
      record.posts += 1;
      record.totalClicks += clicks;
      record.totalViews += views;
      record.totalEngagements += engagements;
      record.ctrSum += ctr;
      record.formats.add(item.format);
      record.lastPublishedAt = [record.lastPublishedAt, item.publication.publishedAt].filter(Boolean).sort().pop() || record.lastPublishedAt;
      tagMap.set(tag, record);
    });
  });

  const platformPerformance = Array.from(platformMap.values())
    .map((record) => ({
      ...record,
      avgCtr: record.posts ? Number((record.ctrSum / record.posts).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks);

  const topTags = Array.from(tagMap.values())
    .map((record) => ({
      tag: record.tag,
      posts: record.posts,
      totalClicks: record.totalClicks,
      totalViews: record.totalViews,
      totalEngagements: record.totalEngagements,
      avgCtr: record.posts ? Number((record.ctrSum / record.posts).toFixed(1)) : 0,
      formats: Array.from(record.formats),
      lastPublishedAt: record.lastPublishedAt,
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks);

  const topContent = [...publishedContent]
    .sort((a, b) => getContentScore(b) - getContentScore(a))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      keyword: item.keyword,
      format: item.format,
      publishedUrl: item.publication.publishedUrl,
      publishedAt: item.publication.publishedAt,
      clicks: normalizeNumber(item.performance.clicks),
      views: normalizeNumber(item.performance.views),
      engagements: getEngagementCount(item.performance),
      ctr: getCtr(item.performance),
      tags: item.tagSnapshot.slice(0, 6),
    }));

  return {
    totals: {
      posts: totals.posts,
      clicks: totals.clicks,
      views: totals.views,
      engagements: totals.engagements,
      avgCtr: totals.posts ? Number((publishedContent.reduce((sum, item) => sum + getCtr(item.performance), 0) / totals.posts).toFixed(1)) : 0,
    },
    platformPerformance,
    topTags,
    topContent,
  };
}

export function getLearningSignals(content = getContentHistory()) {
  const insights = getPerformanceInsights(content);
  const winningFormatsMap = new Map();

  content.filter(isPublishedContent).forEach((item) => {
    const record = winningFormatsMap.get(item.format) || { format: item.format, posts: 0, totalClicks: 0, totalViews: 0 };
    record.posts += 1;
    record.totalClicks += normalizeNumber(item.performance?.clicks);
    record.totalViews += normalizeNumber(item.performance?.views);
    winningFormatsMap.set(item.format, record);
  });

  const winningFormats = Array.from(winningFormatsMap.values())
    .map((record) => ({
      ...record,
      avgClicks: record.posts ? Math.round(record.totalClicks / record.posts) : 0,
      avgViews: record.posts ? Math.round(record.totalViews / record.posts) : 0,
    }))
    .sort((a, b) => b.avgClicks - a.avgClicks)
    .slice(0, 4);

  const lessons = [];
  if (winningFormats[0]) {
    lessons.push(`Top performing format so far is ${winningFormats[0].format} with ${winningFormats[0].avgClicks} average clicks per published post.`);
  }
  if (insights.topTags[0]) {
    lessons.push(`The tag ${insights.topTags[0].tag} has appeared on ${insights.topTags[0].posts} strong post(s) and is associated with ${insights.topTags[0].totalClicks} total clicks.`);
  }
  if (!lessons.length) {
    lessons.push("No published performance history yet. Optimize from first principles and start tracking every post after publication.");
  }

  return {
    publishedPosts: insights.totals.posts,
    totalClicks: insights.totals.clicks,
    totalViews: insights.totals.views,
    averageCtr: insights.totals.avgCtr,
    topTags: insights.topTags.slice(0, 8),
    winningFormats,
    topContent: insights.topContent.slice(0, 3),
    lessons,
  };
}

export function usePerformanceInsights() {
  const content = useContentHistory();
  return useMemo(() => getPerformanceInsights(content), [content]);
}

export function useLearningSignals() {
  const content = useContentHistory();
  return useMemo(() => getLearningSignals(content), [content]);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
