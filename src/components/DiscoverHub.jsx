"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MonitorPlay, Camera, Hash, MessageSquare, Newspaper, Eye, Heart, ExternalLink, Zap, TrendingUp, Bell, ArrowRight } from "lucide-react";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: MonitorPlay, color: "bg-red-500/15 text-red-400 border-red-500/20" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  { id: "x", label: "X", icon: Hash, color: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
  { id: "reddit", label: "Reddit", icon: MessageSquare, color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  { id: "news", label: "News", icon: Newspaper, color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
];

const NEWS_SIGNALS = [
  { topic: "NEP 2020 Implementation", desc: "New vocational standards for Grade 6-8", category: "Regulation" },
  { topic: "AI in Classroom Guidelines", desc: "UNESCO's latest framework for educators", category: "Technology" },
  { topic: "Children Data Privacy 2026", desc: "Updates to digital safety in schools", category: "Legal" },
  { topic: "Board Exam Reforms", desc: "Bi-annual testing cycle updates", category: "Policy" },
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

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 animate-fade-in">
      {/* Educational News Signals - User's Specific Requirement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-txt-secondary uppercase tracking-widest flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-primary" /> Educational Headlines & Changes
          </h3>
          <span className="text-[10px] font-bold text-success flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" /> Live Newsjacking Enabled
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEWS_SIGNALS.map((news, i) => (
            <button 
              key={i} 
              onClick={() => { setQuery(news.topic); handleSearch(news.topic); }}
              className="p-4 rounded-2xl bg-bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all text-left group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <span className="inline-block px-1.5 py-0.5 rounded bg-primary/5 text-[9px] font-bold text-primary uppercase tracking-tighter mb-2">
                {news.category}
              </span>
              <h4 className="text-xs font-bold text-txt mb-1 group-hover:text-primary transition-colors">{news.topic}</h4>
              <p className="text-[10px] text-txt-muted leading-relaxed line-clamp-2">{news.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Discovery */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-border bg-bg-card shadow-sm">
        <div className="absolute inset-0 grad-primary opacity-[0.03]" />
        <div className="relative space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-txt tracking-tight flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> Social Intelligence Discovery
            </h2>
            <p className="text-sm text-txt-secondary">Scan social signals to see how educational changes are being discussed online.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-2xl mx-auto">
            <div className="relative flex items-center group">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder='Enter topic or paste headline...'
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all focus:border-primary/30 focus:bg-bg-card shadow-sm" />
              <Search className="absolute left-4 text-txt-muted w-5 h-5 group-focus-within:text-primary transition-colors" />
              <button type="submit" disabled={loading || !query.trim()}
                className={`absolute right-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : query.trim() ? "grad-primary text-white cursor-pointer hover:opacity-90 shadow-md shadow-primary/20" : "bg-bg-card text-txt-muted cursor-not-allowed"}`}>
                {loading ? "Crawling Platforms..." : "Discover Signals"}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setSelectedPlatforms((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-2 ${selectedPlatforms.includes(p.id) ? p.color : "bg-bg-elevated border-border text-txt-muted opacity-40 hover:opacity-100"}`}>
                <p.icon className="w-4 h-4" /> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-2xl bg-danger/5 border border-danger/20 text-sm text-danger animate-shake">{error}</div>}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-txt">{results.length} Competitive Signals Found</h3>
            <div className="flex gap-1 p-1 rounded-xl bg-bg-card border border-border shadow-sm">
              {["score", "views", "recent"].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all uppercase tracking-widest ${sortBy === s ? "bg-primary-muted text-primary-hover shadow-sm" : "text-txt-muted hover:text-txt-secondary"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.sort((a, b) => {
              if (sortBy === "views") return (b.metrics?.views || 0) - (a.metrics?.views || 0);
              if (sortBy === "recent") return new Date(b.publishedAt) - new Date(a.publishedAt);
              return (b.score || 0) - (a.score || 0);
            }).map((item, i) => {
              const pm = PLATFORMS.find((p) => p.id === item.platform) || { icon: Newspaper, label: item.platform, color: "" };
              const isExpanded = expanded === (item.id || i);
              return (
                <div key={item.id || i} onClick={() => setExpanded(isExpanded ? null : (item.id || i))}
                  className={`p-5 rounded-3xl bg-bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md ${i < 2 ? "border-primary/10 bg-primary/[0.01]" : ""}`}>
                  <div className="flex gap-4">
                    <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${i === 0 ? "bg-yellow-500/10 text-yellow-500" : "bg-bg-elevated text-txt-muted"}`}>{i + 1}</div>
                      <div className="text-[10px] font-bold text-success bg-success/5 px-1.5 rounded border border-success/10">{item.score}</div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-txt leading-snug group-hover:text-primary transition-colors">{item.title}</h4>
                        <span className={`shrink-0 p-2 rounded-xl border flex items-center justify-center ${pm.color} shadow-sm`}><pm.icon className="w-4 h-4" /></span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-txt-muted uppercase tracking-wider">
                        <span className="truncate text-primary">{item.author}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      
                      {!isExpanded && (
                        <div className="flex gap-4 pt-1">
                          {item.metrics?.views > 0 && <span className="text-[11px] font-bold text-txt flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-txt-muted" /> {fmt(item.metrics.views)}</span>}
                          {item.metrics?.likes > 0 && <span className="text-[11px] font-bold text-txt flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-danger/60" /> {fmt(item.metrics.likes)}</span>}
                          <div className="ml-auto flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Analyze</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="pt-4 border-t border-border space-y-4 animate-fade-in">
                          {item.description && <p className="text-xs text-txt-secondary leading-relaxed">{item.description}</p>}
                          <div className="flex gap-2">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-bg-elevated border border-border text-txt flex items-center justify-center gap-2 hover:bg-bg-card transition-all shadow-sm">
                              View on {pm.label} <ExternalLink className="w-3 h-3" />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); onStartResearch?.(item.title); }}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold grad-primary text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer">
                              <Search className="w-3 h-3" /> Research Topic
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-bg-card border border-border" />
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(n) { if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return String(n); }
