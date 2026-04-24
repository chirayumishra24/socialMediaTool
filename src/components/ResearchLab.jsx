"use client";

import { useState, useCallback } from "react";

const PLATFORMS_LIST = [
  { id: "youtube", label: "YouTube", icon: "🎬" },
  { id: "reddit", label: "Reddit", icon: "📡" },
  { id: "x", label: "X / Twitter", icon: "𝕏" },
  { id: "news", label: "News", icon: "📰" },
];

const DEPTHS = [
  { id: "quick", label: "Quick Scan", desc: "~30s — basic overview", icon: "⚡" },
  { id: "standard", label: "Standard", desc: "~60s — balanced analysis", icon: "📊" },
  { id: "deep", label: "Deep Dive", desc: "~90s — full R&D", icon: "🔬" },
];

const LOCATIONS = [
  { code: "IN", label: "🇮🇳 India" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "GB", label: "🇬🇧 United Kingdom" },
  { code: "GLOBAL", label: "🌍 Global" },
];

export default function ResearchLab() {
  const [keyword, setKeyword] = useState("");
  const [platforms, setPlatforms] = useState(["youtube", "reddit", "x", "news"]);
  const [depth, setDepth] = useState("deep");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [topKeywords, setTopKeywords] = useState(null);
  const [error, setError] = useState(null);

  const togglePlatform = (id) => {
    setPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleResearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true); setError(null); setResult(null); setPlatformData(null); setTopKeywords(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, platforms, location, depth, language: "en" }),
      });

      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Research failed"); }

      const data = await res.json();
      setResult(data.research);
      setPlatformData(data.platformData);
      setTopKeywords(data.topKeywords || []);

      // Auto-save to localStorage
      try {
        const { saveResearch } = require("@/lib/storage");
        saveResearch({ keyword, research: data.research, platformData: data.platformData, location, depth });
      } catch {}
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [keyword, platforms, location, depth]);

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Input Panel */}
      <div className="rounded-2xl bg-bg-card border border-border p-5 space-y-4">
        <h3 className="text-sm font-bold text-txt flex items-center gap-2">🔬 Research Pipeline</h3>

        {/* Keyword */}
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Topic / Keyword *</label>
          <input
            type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder='e.g. "AI Tools for Creators", "Startup Funding", "Mental Health"'
            className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Target Location</label>
          <div className="flex gap-2 flex-wrap">
            {LOCATIONS.map((l) => (
              <button key={l.code} onClick={() => setLocation(l.code)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${location === l.code ? "bg-primary-muted text-primary-hover border-primary/30" : "bg-bg-elevated border-border text-txt-muted hover:text-txt-secondary"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Platforms to Crawl</label>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS_LIST.map((p) => (
              <button key={p.id} onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${platforms.includes(p.id) ? "bg-accent/15 text-accent-hover border-accent/30" : "bg-bg-elevated border-border text-txt-muted opacity-50"}`}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Depth */}
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Research Depth</label>
          <div className="grid grid-cols-3 gap-2">
            {DEPTHS.map((d) => (
              <button key={d.id} onClick={() => setDepth(d.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${depth === d.id ? "bg-primary-muted border-primary/30" : "bg-bg-elevated border-border hover:border-border"}`}>
                <span className="text-lg">{d.icon}</span>
                <p className="text-xs font-bold text-txt mt-1">{d.label}</p>
                <p className="text-[10px] text-txt-muted">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleResearch} disabled={loading || !keyword.trim()}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : keyword.trim() ? "grad-primary text-white hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20" : "bg-bg-elevated text-txt-muted cursor-not-allowed"}`}>
          {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Running R&D Pipeline...</span> : "🔬 Start Research"}
        </button>

        {error && <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger animate-fade-in">⚠️ {error}</div>}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl bg-bg-card border border-border p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center text-sm animate-pulse">🤖</div>
            <div>
              <p className="text-sm font-bold text-txt cursor-blink">AI Research Agents Working</p>
              <p className="text-[11px] text-txt-muted">Crawling {platforms.length} platforms + analyzing with Gemini 3.1 Pro</p>
            </div>
          </div>
          <div className="space-y-2">
            {platforms.map((p) => (
              <div key={p} className="flex items-center gap-2 text-[11px] text-txt-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Crawling {PLATFORMS_LIST.find((pl) => pl.id === p)?.label || p}...
              </div>
            ))}
            <div className="flex items-center gap-2 text-[11px] text-txt-muted mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Running deep analysis with Gemini 3.1 Pro...
            </div>
          </div>
          <div className="h-1 rounded-full bg-bg-elevated overflow-hidden mt-4">
            <div className="h-full rounded-full grad-primary" style={{ animation: "progressFlow 90s linear forwards" }} />
          </div>
        </div>
      )}

      {/* Results */}
      {result && <ResearchResults research={result} platformData={platformData} topKeywords={topKeywords} />}
    </div>
  );
}

function ResearchResults({ research, platformData, topKeywords }) {
  const r = research;
  if (!r) return null;

  // Build sorted video lists
  const ytVideos = (platformData?.youtube || []).sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
  const latestVideos = [...(platformData?.youtube || [])].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const redditPosts = (platformData?.reddit || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const newsPosts = (platformData?.news || []).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const xPosts = (platformData?.x || []);

  const [videoSort, setVideoSort] = useState("views");
  const displayVideos = videoSort === "views" ? ytVideos : latestVideos;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ═══ TRENDING VIDEOS ═══ */}
      {ytVideos.length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">🎬 Trending Videos — {ytVideos.length} found</h4>
            <div className="flex gap-1 p-0.5 rounded-lg bg-bg-elevated border border-border">
              <button onClick={() => setVideoSort("views")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-all ${videoSort === "views" ? "bg-primary-muted text-primary-hover" : "text-txt-muted"}`}>🔥 Most Views</button>
              <button onClick={() => setVideoSort("latest")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer transition-all ${videoSort === "latest" ? "bg-primary-muted text-primary-hover" : "text-txt-muted"}`}>🕐 Latest</button>
            </div>
          </div>
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scroll pr-1">
            {displayVideos.map((v, i) => (
              <a key={v.id || i} href={v.url} target="_blank" rel="noopener noreferrer"
                className="flex gap-3 p-3 rounded-lg bg-bg-elevated border border-border hover:border-primary/20 transition-all group block">
                {/* Rank */}
                <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-yellow-500/15 text-yellow-400" : i === 1 ? "bg-slate-400/15 text-slate-300" : i === 2 ? "bg-amber-600/15 text-amber-500" : "bg-bg-card text-txt-muted"}`}>#{i + 1}</span>
                </div>
                {/* Thumbnail */}
                {v.thumbnail && (
                  <div className="shrink-0 w-28 h-[72px] rounded-lg overflow-hidden bg-bg-card relative">
                    <img src={v.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    {v.duration && <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-black/80 text-white">{v.duration}</span>}
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-txt leading-snug line-clamp-2 group-hover:text-primary-hover transition-colors">{v.title}</p>
                  <p className="text-[10px] text-txt-muted mt-0.5">{v.author} {v.publishedAt && `• ${formatDate(v.publishedAt)}`}</p>
                  {/* Metrics */}
                  <div className="flex gap-3 mt-1.5">
                    {v.metrics?.views > 0 && <span className="text-[10px] text-txt-secondary font-semibold">👁 {fmt(v.metrics.views)} views</span>}
                    {v.metrics?.likes > 0 && <span className="text-[10px] text-txt-muted">❤️ {fmt(v.metrics.likes)}</span>}
                    {v.metrics?.comments > 0 && <span className="text-[10px] text-txt-muted">💬 {fmt(v.metrics.comments)}</span>}
                  </div>
                  {/* Tags */}
                  {v.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {v.tags.slice(0, 5).map((tag, j) => (
                        <span key={j} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-accent/10 text-accent-hover border border-accent/15">{tag}</span>
                      ))}
                      {v.tags.length > 5 && <span className="text-[8px] text-txt-muted">+{v.tags.length - 5} more</span>}
                    </div>
                  )}
                </div>
                {/* Link icon */}
                <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-lg">↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ═══ TOP KEYWORDS ═══ */}
      {topKeywords?.length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">🏷️ Top Keywords — Driving Video Performance</h4>
            <button onClick={() => {
              const text = topKeywords.map((k) => k.keyword).join(", ");
              navigator.clipboard.writeText(text);
            }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-bg-elevated border border-border text-txt-secondary hover:text-txt cursor-pointer transition-all">📋 Copy All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {topKeywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated border border-border">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-yellow-500/15 text-yellow-400" : i < 7 ? "bg-primary-muted text-primary-hover" : "bg-bg-card text-txt-muted"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-txt truncate">{kw.keyword}</p>
                    {kw.isOfficialTag && <span className="text-[8px] px-1 py-0.5 rounded bg-success/15 text-success font-bold">TAG</span>}
                  </div>
                  <p className="text-[10px] text-txt-muted">{fmt(kw.totalViews)} total views • {kw.appearsIn} video{kw.appearsIn > 1 ? "s" : ""}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="w-10 h-1.5 rounded-full bg-bg-card overflow-hidden">
                    <div className="h-full rounded-full grad-primary" style={{ width: `${kw.score}%` }} />
                  </div>
                  <p className="text-[9px] text-txt-muted mt-0.5">{kw.score}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ REDDIT & NEWS & X ═══ */}
      {(redditPosts.length > 0 || newsPosts.length > 0 || xPosts.length > 0) && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">📡 More Platform Data</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Reddit */}
            {redditPosts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-orange-400 mb-2">📡 Reddit — {redditPosts.length} posts</p>
                <div className="space-y-1.5">
                  {redditPosts.slice(0, 5).map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                      className="block p-2 rounded-lg bg-bg-card-hover border border-border hover:border-orange-500/20 transition-all">
                      <p className="text-[11px] font-semibold text-txt line-clamp-2">{p.title}</p>
                      <p className="text-[9px] text-txt-muted mt-0.5">r/{p.subreddit} • ⬆️ {fmt(p.metrics?.likes || 0)} • 💬 {p.metrics?.comments || 0}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* News */}
            {newsPosts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-blue-400 mb-2">📰 News — {newsPosts.length} articles</p>
                <div className="space-y-1.5">
                  {newsPosts.slice(0, 5).map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                      className="block p-2 rounded-lg bg-bg-card-hover border border-border hover:border-blue-500/20 transition-all">
                      <p className="text-[11px] font-semibold text-txt line-clamp-2">{n.title}</p>
                      <p className="text-[9px] text-txt-muted mt-0.5">{n.author} • {formatDate(n.publishedAt)}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* X/Twitter */}
            {xPosts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-300 mb-2">𝕏 Twitter — {xPosts.length} posts</p>
                <div className="space-y-1.5">
                  {xPosts.slice(0, 5).map((t, i) => (
                    <a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
                      className="block p-2 rounded-lg bg-bg-card-hover border border-border hover:border-slate-400/20 transition-all">
                      <p className="text-[11px] font-semibold text-txt line-clamp-2">{t.title}</p>
                      <p className="text-[9px] text-txt-muted mt-0.5">{t.author}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Landscape */}
      {r.marketLandscape && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">📊 Market Landscape</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <MiniStat label="Saturation" value={r.marketLandscape.saturationLevel} />
            <MiniStat label="Score" value={`${r.marketLandscape.saturationScore}/100`} />
            <MiniStat label="Content Volume" value={r.marketLandscape.totalEstimatedContent} />
            <MiniStat label="Growth" value={r.marketLandscape.growthTrend} />
          </div>
          <p className="text-xs text-txt-secondary leading-relaxed">{r.marketLandscape.summary}</p>
        </div>
      )}

      {/* Audience Sentiment */}
      {r.audienceSentiment && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">🎯 Audience Sentiment — {r.audienceSentiment.overall}</h4>
          <p className="text-xs text-txt-muted mb-2">{r.audienceSentiment.demographics}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-danger mb-1.5">Pain Points</p>
              {r.audienceSentiment.painPoints?.map((p, i) => (
                <p key={i} className="text-xs text-txt-secondary mb-1">• {p}</p>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-success mb-1.5">Desires</p>
              {r.audienceSentiment.desires?.map((d, i) => (
                <p key={i} className="text-xs text-txt-secondary mb-1">• {d}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Gaps */}
      {r.contentGaps?.length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">🕳️ Content Gaps — Opportunities</h4>
          <div className="space-y-2">
            {r.contentGaps.map((g, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-elevated border border-border">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-txt">{g.gap}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold ${g.difficulty === "easy" ? "badge-cool" : g.difficulty === "hard" ? "badge-hot" : "badge-warm"}`}>{g.difficulty}</span>
                </div>
                <p className="text-[11px] text-txt-muted mt-1">{g.opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Angles */}
      {r.trendingAngles?.length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">🔥 Trending Angles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {r.trendingAngles.map((a, i) => (
              <div key={i} className="p-3 rounded-lg bg-bg-elevated border border-border hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-txt">{a.angle}</p>
                  <span className="text-[10px] font-bold text-primary-hover">{a.viralPotential}/100</span>
                </div>
                <p className="text-[11px] text-txt-muted mb-2">{a.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-accent/15 text-accent-hover">{a.suggestedFormat}</span>
                  {a.platforms?.map((p) => (
                    <span key={p} className="text-[9px] text-txt-muted">{p}</span>
                  ))}
                </div>
                {a.hookIdea && <p className="text-[10px] text-primary-hover mt-1.5 italic">💡 Hook: "{a.hookIdea}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Strategy */}
      {r.recommendedStrategy && (
        <div className="rounded-xl bg-bg-card border border-primary/20 p-5 glow-pulse">
          <h4 className="text-sm font-bold text-txt mb-2">🎯 Recommended Strategy</h4>
          <p className="text-xs text-txt-secondary mb-2">{r.recommendedStrategy.keyMessage}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MiniStat label="Best Platform" value={r.recommendedStrategy.bestPlatform} />
            <MiniStat label="Best Format" value={r.recommendedStrategy.bestFormat} />
            <MiniStat label="Viral Potential" value={`${r.recommendedStrategy.estimatedViralPotential}/100`} />
            <MiniStat label="Best Angle" value={r.recommendedStrategy.bestAngle?.substring(0, 30)} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-bg-card-hover">
      <p className="text-[9px] text-txt-muted uppercase tracking-wider">{label}</p>
      <p className="text-xs font-bold text-txt truncate">{value || "—"}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function fmt(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    if (diffD < 30) return `${Math.floor(diffD / 7)}w ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}
