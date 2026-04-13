"use client";

import { useState, useEffect } from "react";
import {
  getHistory,
  searchHistory,
  deleteContent,
  updateStatus,
} from "@/lib/storage";
import { exportAsJSON, exportAsMarkdown, copyAllToClipboard } from "@/lib/export";

const FORMAT_LABELS = {
  youtube_longform: "YT Long-form",
  youtube_short: "YT Short",
  instagram_reel: "IG Reel",
  instagram_carousel: "IG Carousel",
};

const FORMAT_COLORS = {
  youtube_longform: "bg-red-500/10 text-red-400 border-red-500/20",
  youtube_short: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  instagram_reel: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  instagram_carousel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_COLORS = {
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function ContentHistory({ onRegenerate }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);

  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = () => {
    if (searchQuery) {
      setItems(searchHistory(searchQuery));
    } else {
      setItems(getHistory());
    }
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (q.trim()) {
      setItems(searchHistory(q));
    } else {
      setItems(getHistory());
    }
  };

  const handleDelete = (id) => {
    deleteContent(id);
    refreshHistory();
  };

  const handleStatusChange = (id, status) => {
    updateStatus(id, status);
    refreshHistory();
  };

  const handleCopy = async (item) => {
    await copyAllToClipboard(item);
    setCopyFeedback(item.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filtered = items.filter((item) => {
    if (filterFormat && item.format !== filterFormat) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search history by topic, niche, script content..."
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:border-primary/40 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-secondary cursor-pointer focus:outline-none"
          >
            <option value="">All Formats</option>
            {Object.entries(FORMAT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text-secondary cursor-pointer focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="text-[10px] text-text-muted">
        {filtered.length} item{filtered.length !== 1 ? "s" : ""} in history
      </p>

      {/* Content List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-lg font-bold text-text-primary mb-1">No Content Yet</h3>
          <p className="text-sm text-text-muted max-w-md">
            Generated content will automatically appear here. Start by generating some content in the Generate tab!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-primary/20"
            >
              {/* Collapsed header */}
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full text-left p-3.5 flex items-center gap-3 cursor-pointer"
              >
                {/* Platform icon */}
                <span className="text-xl shrink-0">
                  {item.platform === "youtube" ? "📺" : "📱"}
                </span>

                {/* Title & Meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${FORMAT_COLORS[item.format] || ""}`}>
                      {FORMAT_LABELS[item.format] || item.format}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${STATUS_COLORS[item.status] || ""}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="text-right shrink-0">
                  <span className={`text-sm font-black ${
                    (item.quality?.score || 0) >= 75 ? "text-green-400" :
                    (item.quality?.score || 0) >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {item.quality?.score || 0}
                  </span>
                  <p className="text-[9px] text-text-muted">score</p>
                </div>

                {/* Expand arrow */}
                <span className={`text-text-muted transition-transform ${expandedId === item.id ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {/* Expanded details */}
              {expandedId === item.id && (
                <div className="border-t border-border p-4 space-y-3 animate-fade-in">
                  {/* Quick Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-surface-hover">
                      <p className="text-[10px] text-text-muted">Views Est.</p>
                      <p className="text-xs font-bold text-text-primary">{item.quality?.predictions?.views || "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-hover">
                      <p className="text-[10px] text-text-muted">Engagement</p>
                      <p className="text-xs font-bold text-text-primary">{item.quality?.predictions?.engagementRate || "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-hover">
                      <p className="text-[10px] text-text-muted">Competition</p>
                      <p className="text-xs font-bold text-text-primary">{item.quality?.predictions?.competition || "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-hover">
                      <p className="text-[10px] text-text-muted">Duration</p>
                      <p className="text-xs font-bold text-text-primary">{item.quality?.estimatedDuration || "—"}</p>
                    </div>
                  </div>

                  {/* Script Preview */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted mb-1">SCRIPT PREVIEW</p>
                    <div className="p-3 rounded-lg bg-surface-hover text-xs text-text-secondary max-h-[200px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {item.script?.substring(0, 800) || "No script available"}
                      {(item.script?.length || 0) > 800 && "..."}
                    </div>
                  </div>

                  {/* SEO Title */}
                  {item.seo?.titles?.[0] && (
                    <div>
                      <p className="text-[10px] font-bold text-text-muted mb-1">SEO TITLE</p>
                      <p className="text-xs text-primary-light font-semibold">{item.seo.titles[0]}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(item)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      {copyFeedback === item.id ? "✓ Copied!" : "📋 Copy All"}
                    </button>
                    <button
                      onClick={() => exportAsMarkdown(item)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-surface-hover text-text-secondary border border-border hover:text-text-primary transition-all cursor-pointer"
                    >
                      📄 Export MD
                    </button>
                    <button
                      onClick={() => exportAsJSON(item)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-surface-hover text-text-secondary border border-border hover:text-text-primary transition-all cursor-pointer"
                    >
                      📦 Export JSON
                    </button>

                    {/* Status Actions */}
                    <div className="flex-1" />
                    {item.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "approved")}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
                      >
                        ✅ Approve
                      </button>
                    )}
                    {item.status === "approved" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "published")}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all cursor-pointer"
                      >
                        🚀 Mark Published
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(item.id, "archived")}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-surface-hover text-text-muted border border-border hover:text-text-secondary transition-all cursor-pointer"
                    >
                      📦 Archive
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
