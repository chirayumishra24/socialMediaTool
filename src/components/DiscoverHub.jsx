"use client";

import { useState, useCallback } from "react";
import { Search, MonitorPlay, Camera, Hash, MessageSquare, Newspaper, Eye, Heart, ExternalLink } from "lucide-react";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: MonitorPlay, color: "bg-red-500/15 text-red-400 border-red-500/20" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { id: "x", label: "X", icon: Hash, color: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
  { id: "reddit", label: "Reddit", icon: MessageSquare, color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  { id: "news", label: "News", icon: Newspaper, color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
];

const SORT_OPTIONS = [
  { id: "score", label: "Best Match" },
  { id: "views", label: "Most Views" },
  { id: "recent", label: "Most Recent" },
];

export default function DiscoverHub({ onStartResearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(PLATFORMS.map((p) => p.id));
  const [sortBy, setSortBy] = useState("score");
  const [expanded, setExpanded] = useState(null);

  const handleSearch = useCallback(async (q) => {
    const term = q || query;
    if (!term.trim()) return;
    setLoading(true); setError(null); setResults([]); setQuery(term);

    try {
      const res = await fetch(`/api/discover?q=${encodeURIComponent(term)}&platforms=${selectedPlatforms.join(",")}`);
      if (!res.ok) throw new Error("Discovery failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [query, selectedPlatforms]);

  const toggle = (id) => setPlatforms => setSelectedPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "views") return (b.metrics?.views || 0) - (a.metrics?.views || 0);
    if (sortBy === "recent") return new Date(b.publishedAt) - new Date(a.publishedAt);
    return (b.score || 0) - (a.score || 0);
  });

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Search Hero */}
      <div className="relative rounded-2xl overflow-hidden p-6 border border-border">
        <div className="absolute inset-0 grad-primary opacity-[0.04]" />
        <div className="relative text-center space-y-4">
          <h2 className="text-xl font-bold text-txt flex items-center justify-center gap-2"><Search className="w-5 h-5 text-primary" /> Discover Trending Content</h2>
          <p className="text-sm text-txt-muted">Search across 5 platforms — find what's working right now</p>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder='Search any topic...'
                className="w-full pl-10 pr-24 py-3.5 rounded-2xl bg-bg-card border border-border text-sm text-txt placeholder:text-txt-muted transition-all" />
              <Search className="absolute left-3.5 text-txt-muted w-4 h-4" />
              <button type="submit" disabled={loading || !query.trim()}
                className={`absolute right-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : query.trim() ? "grad-primary text-white cursor-pointer" : "bg-bg-elevated text-txt-muted cursor-not-allowed"}`}>
                {loading ? "Crawling..." : "Discover"}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setSelectedPlatforms((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${selectedPlatforms.includes(p.id) ? p.color : "bg-bg-elevated border-border text-txt-muted opacity-40"}`}>
                <p.icon className="w-3.5 h-3.5" /> {p.label}
              </button>
            ))}
          </div>

          {!results.length && !loading && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {["AI Tools 2026", "Startup Ideas", "Study Hacks", "Web3", "Mental Health"].map((t) => (
                <button key={t} onClick={() => { setQuery(t); handleSearch(t); }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-bg-elevated border border-border text-txt-secondary hover:border-primary/30 cursor-pointer transition-all">
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">{error}</div>}

      {loading && (
        <div className="space-y-3 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-bg-card border border-border flex gap-4">
              <div className="w-20 h-14 rounded-lg shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded shimmer" />
                <div className="h-3 w-1/2 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-txt">{sorted.length} results</span>
            <div className="flex gap-1 p-0.5 rounded-lg bg-bg-card border border-border">
              {SORT_OPTIONS.map((s) => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-all ${sortBy === s.id ? "bg-primary-muted text-primary-hover" : "text-txt-muted"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sorted.map((item, i) => {
              const pm = PLATFORMS.find((p) => p.id === item.platform) || { icon: Newspaper, label: item.platform, color: "" };
              return (
                <div key={item.id || i} onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className={`p-4 rounded-xl bg-bg-card border border-border hover:border-primary/20 transition-all cursor-pointer animate-fade-in ${i < 3 ? "ring-1 ring-primary/10" : ""}`}
                  style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
                  <div className="flex gap-3">
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-yellow-500/15 text-yellow-400" : i === 1 ? "bg-slate-400/15 text-slate-300" : i === 2 ? "bg-amber-600/15 text-amber-500" : "bg-bg-elevated text-txt-muted"}`}>#{i + 1}</div>
                      <span className={`text-[10px] font-bold ${item.score >= 70 ? "text-success" : item.score >= 40 ? "text-warning" : "text-txt-muted"}`}>{item.score}</span>
                    </div>
                    {item.thumbnail && <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-bg-elevated"><img src={item.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-txt leading-snug line-clamp-2">{item.title}</h4>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center justify-center ${pm.color}`}><pm.icon className="w-3.5 h-3.5" /></span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-txt-muted">
                        <span className="truncate max-w-[120px]">{item.author}</span>
                        {item.duration && <span className="px-1.5 py-0.5 rounded bg-bg-elevated">{item.duration}</span>}
                      </div>
                      <div className="flex gap-3 mt-1">
                        {item.metrics?.views > 0 && <span className="text-[10px] text-txt-muted flex items-center gap-1"><Eye className="w-3 h-3" /> {fmt(item.metrics.views)}</span>}
                        {item.metrics?.likes > 0 && <span className="text-[10px] text-txt-muted flex items-center gap-1"><Heart className="w-3 h-3" /> {fmt(item.metrics.likes)}</span>}
                        {item.metrics?.comments > 0 && <span className="text-[10px] text-txt-muted flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {fmt(item.metrics.comments)}</span>}
                      </div>
                    </div>
                  </div>
                  {expanded === item.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2 animate-fade-in">
                      {item.description && <p className="text-xs text-txt-secondary">{item.description}</p>}
                      {item.tags?.length > 0 && <div className="flex flex-wrap gap-1">{item.tags.map((t, j) => <span key={j} className="px-2 py-0.5 rounded-full text-[9px] bg-bg-elevated border border-border text-txt-muted">{t}</span>)}</div>}
                      <div className="flex gap-2">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold grad-primary text-white hover:opacity-90 transition-opacity">
                          Open on {pm.label} <ExternalLink className="w-3 h-3" />
                        </a>
                        <button onClick={(e) => { e.stopPropagation(); onStartResearch?.(item.title); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-primary/10 text-primary-hover border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer">
                          <Search className="w-3 h-3" /> Research this Topic
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function fmt(n) { if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return String(n); }
