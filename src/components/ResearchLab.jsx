"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, Camera, Hash, MessageSquare, Newspaper, Zap, BarChart2, Search, Globe, Heart, ArrowRight, Flame, Lightbulb, Target, Loader2, Sparkles, Compass, Repeat2, Play, User, ExternalLink, MessageCircle } from "lucide-react";

const PLATFORMS_LIST = [
  { id: "youtube", label: "YouTube", icon: MonitorPlay },
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "x", label: "X / Twitter", icon: Hash },
  { id: "reddit", label: "Reddit", icon: MessageSquare },
  { id: "news", label: "News", icon: Newspaper },
];

const DEPTHS = [
  { id: "quick", label: "Quick Scan", desc: "~30s — basic overview", icon: Zap },
  { id: "standard", label: "Standard", desc: "~60s — balanced analysis", icon: BarChart2 },
  { id: "deep", label: "Deep Dive", desc: "~90s — full R&D", icon: Search },
];

const LOCATIONS = [
  { code: "IN", label: "India", icon: Globe },
  { code: "US", label: "United States", icon: Globe },
  { code: "GB", label: "United Kingdom", icon: Globe },
  { code: "GLOBAL", label: "Global", icon: Globe },
];

export default function ResearchLab({ onResearchComplete, onGoToStudio, initialKeyword }) {
  const [keyword, setKeyword] = useState(initialKeyword || "");
  useEffect(() => { if (initialKeyword) setKeyword(initialKeyword); }, [initialKeyword]);

  const [platforms, setPlatforms] = useState(["youtube", "instagram", "x", "reddit", "news"]);
  const [depth, setDepth] = useState("deep");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [topKeywords, setTopKeywords] = useState(null);
  const [error, setError] = useState(null);

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

      let savedResearch = null;
      try {
        const { saveResearch } = require("@/lib/storage");
        savedResearch = saveResearch({ keyword, research: data.research, platformData: data.platformData, topKeywords: data.topKeywords || [], location, depth });
      } catch {}

      onResearchComplete?.({
        id: savedResearch?.id, keyword,
        research: data.research, platformData: data.platformData,
        topKeywords: data.topKeywords || [], location, depth,
        researchedAt: new Date().toISOString(),
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [depth, keyword, location, onResearchComplete, platforms]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-border pb-6">
        <h3 className="text-2xl font-bold text-txt tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" strokeWidth={2.5} /> R&D Intelligence Lab
        </h3>
        <p className="text-sm text-txt-muted font-medium">Crawl 2026 trends, news, and viral signals before scripting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] bg-bg-card border border-border p-8 space-y-8 shadow-sm">
            <Field label="Topic">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "AI in education 2026"'
                className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleResearch()} />
            </Field>

            <Field label="Location">
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l.code} onClick={() => setLocation(l.code)}
                    className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${location === l.code ? "bg-primary/10 text-primary border-primary" : "bg-bg-elevated border-border text-txt-muted hover:text-txt"}`}>
                    <l.icon className="w-3.5 h-3.5" /> {l.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Depth">
              <div className="grid grid-cols-1 gap-2">
                {DEPTHS.map((d) => (
                  <button key={d.id} onClick={() => setDepth(d.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${depth === d.id ? "bg-primary/5 border-primary shadow-sm" : "bg-bg-elevated border-border hover:bg-bg-card"}`}>
                    <div className={`p-2.5 rounded-xl ${depth === d.id ? "bg-primary text-white" : "bg-bg-card text-txt-muted"}`}>
                      <d.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-txt">{d.label}</p>
                      <p className="text-[10px] text-txt-muted">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <button onClick={handleResearch} disabled={loading || !keyword.trim()}
              className={`w-full py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : "grad-primary text-white cursor-pointer shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95"}`}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Crawling 2026 Signals...</> : <><Sparkles className="w-5 h-5" /> Run Research</>}
            </button>
          </div>

          <div className="rounded-2xl p-6 bg-accent/5 border border-accent/10 space-y-4">
            <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS_LIST.map(p => (
                <div key={p.id} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-2 ${platforms.includes(p.id) ? "bg-white border-accent/20 text-accent" : "opacity-30 border-border grayscale"}`}>
                  <p.icon className="w-3 h-3" /> {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8">
          {error && <div className="p-4 mb-6 rounded-xl bg-danger/5 border border-danger/10 text-danger text-sm font-bold">{error}</div>}

          {!result && !loading && (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[3rem] bg-bg-elevated/10">
              <div className="w-24 h-24 rounded-3xl bg-bg-card border border-border flex items-center justify-center text-txt-muted mx-auto mb-8 shadow-sm ring-8 ring-bg-elevated/30"><Compass className="w-12 h-12" /></div>
              <h3 className="text-2xl font-bold text-txt mb-3 tracking-tight">R&D Workspace</h3>
              <p className="text-sm text-txt-muted max-w-sm mx-auto font-medium leading-relaxed">Enter a topic to crawl YouTube, Instagram, X, Reddit & News for the latest 2026 signals.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[3rem] bg-bg-elevated/10 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-8 ring-8 ring-primary/5 animate-bounce"><Search className="w-10 h-10" /></div>
              <h3 className="text-2xl font-bold text-txt mb-8 tracking-tight">Crawling 2026 Signals...</h3>
              <div className="space-y-4 w-80 mx-auto">
                {platforms.map((p, i) => (
                  <div key={p} className="flex items-center justify-between text-[11px] font-black text-txt-muted uppercase tracking-wider">
                    <span>{PLATFORMS_LIST.find(pl => pl.id === p)?.label} Agent</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-10 animate-fade-in pb-20">
              {result.isVague ? (
                <VagueResult
                  result={result}
                  onUseSuggestion={(suggestion) => setKeyword(suggestion)}
                />
              ) : (
                <ResearchResults research={result} platformData={platformData} topKeywords={topKeywords} />
              )}

              {!result.isVague && (
                <div className="sticky bottom-6 left-0 right-0 p-1 bg-white/80 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 z-50">
                  <div className="pl-8">
                    <p className="text-xs font-bold text-txt">Research Complete</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ready to Script</p>
                  </div>
                  <button onClick={() => onGoToStudio({ keyword, research: result, platformData, topKeywords, location, depth, researchedAt: new Date().toISOString() })}
                    className="px-12 py-4 rounded-[2rem] grad-primary text-white text-[13px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer">
                    <Sparkles className="w-5 h-5" /> Open Script Studio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResearchResults({ research, platformData, topKeywords }) {
  const r = research;
  const ytVideos = (platformData?.youtube || []).sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
  const igPosts = (platformData?.instagram || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const igVideoPosts = igPosts.filter((post) => post.isVideo || post.videoUrl || String(post.contentFormat || "").toLowerCase().includes("video") || String(post.contentFormat || "").toLowerCase().includes("reel"));
  const featuredIgPosts = igVideoPosts.length > 0 ? igVideoPosts : igPosts;
  const xPosts = (platformData?.x || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const newsPosts = (platformData?.news || []).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className="space-y-12">
      <div className="rounded-[3rem] bg-white border border-border p-8 lg:p-10 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">R&D Output</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {r.keyword}
              </span>
              <span className="px-3 py-1 rounded-full bg-bg-elevated border border-border text-[10px] font-black uppercase tracking-widest text-txt-muted">
                Fit {r.relevanceCheck?.score || 0}/100
              </span>
            </div>
            <h4 className="text-3xl lg:text-4xl font-black text-txt tracking-tight leading-tight">Top video signals first, then the deeper strategy.</h4>
            <p className="text-sm text-txt-secondary font-medium leading-relaxed">
              YouTube appears first, Instagram video links second, and the rest of the research stack follows below.
            </p>
          </div>
          {r.recommendedStrategy && (
            <div className="rounded-[2rem] bg-accent/5 border border-accent/15 px-5 py-4 space-y-2 lg:max-w-sm w-full">
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Primary Angle</p>
              <p className="text-base font-bold text-txt leading-snug">{r.recommendedStrategy.bestAngle}</p>
              <p className="text-sm text-txt-secondary leading-relaxed font-medium">{r.recommendedStrategy.keyMessage}</p>
            </div>
          )}
        </div>

        {ytVideos.length > 0 && (
          <Section icon={MonitorPlay} label="YouTube Videos" color="text-red-500">
            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <FeaturedVideoCard data={ytVideos[0]} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ytVideos.slice(1, 5).map((video, index) => (
                  <MediaCard key={`${video.id || index}-yt`} data={video} compact />
                ))}
              </div>
            </div>
          </Section>
        )}

        {featuredIgPosts.length > 0 && (
          <Section icon={Camera} label="Instagram Video Links" color="text-pink-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featuredIgPosts.slice(0, 4).map((post, index) => (
                <InstagramLinkCard key={`${post.id || index}-ig`} data={post} />
              ))}
            </div>
          </Section>
        )}
      </div>

      <div className="rounded-[3rem] bg-white border border-border p-10 space-y-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Topic Focus</span>
              <span className="px-3 py-1 rounded-full bg-bg-elevated border border-border text-[10px] font-black uppercase tracking-widest text-txt-muted">
                {r.topicFocus?.interpretedTopic || r.keyword}
              </span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-txt tracking-tight">{r.keyword}</h4>
              <p className="text-sm text-txt-muted font-medium mt-2">
                {r.executiveSummary}
              </p>
            </div>
          </div>

          {r.recommendedStrategy && (
            <div className="lg:max-w-sm w-full rounded-[2rem] bg-primary/5 border border-primary/10 p-6 space-y-4">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Best Move</p>
              <p className="text-lg font-bold text-txt leading-snug">{r.recommendedStrategy.bestAngle}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-white border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary">
                  {r.recommendedStrategy.bestPlatform}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary">
                  {r.recommendedStrategy.bestFormat}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary">
                  Viral {r.recommendedStrategy.estimatedViralPotential || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightTile label="Why Now" value={r.topicFocus?.whyNow || r.marketLandscape?.summary} tone="primary" />
          <InsightTile label="Audience Lens" value={r.topicFocus?.audienceLens || r.audienceSentiment?.demographics} tone="accent" />
          <InsightTile label="Geo Lens" value={r.topicFocus?.geoLens || "Use regional nuance only where it changes demand or behavior."} tone="neutral" />
        </div>
      </div>

      {r.sourceEvidence?.length > 0 && (
        <Section icon={Compass} label="Topic Evidence" color="text-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {r.sourceEvidence.slice(0, 4).map((item, index) => (
              <EvidenceCard key={`${item.platform}-${index}`} item={item} />
            ))}
          </div>
        </Section>
      )}

      {r.trendingAngles?.length > 0 && (
        <Section icon={Flame} label="Angles That Fit This Topic" color="text-orange-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {r.trendingAngles.slice(0, 4).map((angle, index) => (
              <AngleCard key={`${angle.angle}-${index}`} angle={angle} />
            ))}
          </div>
        </Section>
      )}

      {topKeywords?.length > 0 && (
        <div className="rounded-[2.5rem] bg-bg-card border border-border p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-accent" />
            <h4 className="text-xs font-black text-txt uppercase tracking-[0.2em]">Related Terms From Live Search</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {topKeywords.slice(0, 10).map((kw) => (
              <span key={kw.keyword} className="px-4 py-2 rounded-xl bg-white border border-border text-[11px] font-bold text-txt-secondary">
                #{kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {r.strategyBlueprint && (
        <div className="rounded-[3rem] bg-white border border-border p-10 space-y-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Lightbulb className="w-64 h-64" /></div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Sparkles className="w-6 h-6" /></div>
            <div>
              <h4 className="text-sm font-black text-txt uppercase tracking-widest">Strategy Blueprint</h4>
              <p className="text-xs text-txt-muted font-medium">AI-synthesized from 2026 signals</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <Field label="Core Concept">
                <p className="text-base text-txt-secondary leading-loose font-medium italic">"{r.strategyBlueprint.concept}"</p>
              </Field>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                {r.strategyBlueprint.recommendedTools?.map(t => (
                  <span key={t} className="px-4 py-2 rounded-xl bg-bg-elevated border border-border text-[11px] font-bold text-txt-muted">#{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Execution Roadmap</h5>
              <div className="space-y-4">
                {r.strategyBlueprint.executionPhases?.map((phase, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">{i + 1}</div>
                    <p className="text-sm text-txt-secondary leading-relaxed font-medium pt-1.5">{phase}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {xPosts.length > 0 && (
            <Section icon={Hash} label="X / Twitter" color="text-txt">
              <div className="space-y-4">
                {xPosts.slice(0, 4).map((t, i) => <TweetCard key={i} data={t} />)}
              </div>
            </Section>
          )}
          {newsPosts.length > 0 && (
            <Section icon={Newspaper} label="Latest News" color="text-blue-500">
              <div className="space-y-4">
                {newsPosts.slice(0, 4).map((n, i) => <NewsCard key={i} data={n} />)}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Audience & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {r.audienceSentiment && (
          <div className="p-10 rounded-[3rem] bg-white border border-border space-y-8 shadow-sm">
            <h4 className="text-sm font-black text-txt uppercase tracking-widest flex items-center gap-3">
              <Heart className="w-5 h-5 text-danger" /> Audience Sentiment
            </h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-danger/5 border border-danger/10">
                <p className="text-[11px] font-black text-danger uppercase tracking-widest">Pain Points</p>
                <p className="text-[10px] text-txt-muted">{r.audienceSentiment.demographics}</p>
              </div>
              <ul className="space-y-3">
                {r.audienceSentiment.painPoints?.map((p, i) => (
                  <li key={i} className="text-sm text-txt-secondary leading-relaxed font-medium flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger mt-2 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {r.contentGaps?.length > 0 && (
          <div className="p-10 rounded-[3rem] bg-white border border-border space-y-8 shadow-sm">
            <h4 className="text-sm font-black text-txt uppercase tracking-widest flex items-center gap-3">
              <Target className="w-5 h-5 text-accent" /> Opportunity Gaps
            </h4>
            <div className="space-y-4">
              {r.contentGaps.slice(0, 3).map((g, i) => (
                <div key={i} className="p-6 rounded-3xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-txt uppercase tracking-tight">{g.gap}</span>
                    <span className="text-[10px] font-black text-accent-hover uppercase bg-white px-2 py-0.5 rounded-lg border border-accent/10">{g.difficulty}</span>
                  </div>
                  <p className="text-xs text-txt-secondary leading-relaxed font-medium">{g.opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VagueResult({ result, onUseSuggestion }) {
  return (
    <div className="rounded-[3rem] bg-white border border-border p-10 shadow-sm space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-3xl font-black text-txt tracking-tight">Refine The Search</h4>
          <p className="text-base text-txt-secondary leading-loose font-medium mt-3">
            {result.message || "This topic is too broad to produce a precise R&D strategy."}
          </p>
        </div>
      </div>

      {result.suggestions?.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Suggested Searches</p>
          <div className="flex flex-wrap gap-3">
            {result.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onUseSuggestion(suggestion)}
                className="px-5 py-3 rounded-2xl bg-bg-card border border-border text-sm font-bold text-txt hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightTile({ label, value, tone = "neutral" }) {
  const toneClass = tone === "primary"
    ? "bg-primary/5 border-primary/10"
    : tone === "accent"
      ? "bg-accent/5 border-accent/10"
      : "bg-bg-elevated/40 border-border";

  return (
    <div className={`rounded-[2rem] border p-5 space-y-3 ${toneClass}`}>
      <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">{label}</p>
      <p className="text-sm text-txt-secondary leading-relaxed font-medium">{value}</p>
    </div>
  );
}

function EvidenceCard({ item }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-6 rounded-[2rem] bg-white border border-border hover:border-primary/20 transition-all shadow-sm hover:shadow-xl block"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
          {item.platform}
        </span>
        <span className="text-[10px] font-bold text-txt-muted">{item.publishedAt || "recent"}</span>
      </div>
      <p className="text-sm font-bold text-txt leading-relaxed group-hover:text-primary transition-colors">{item.title}</p>
      <p className="text-xs text-txt-muted font-bold uppercase tracking-widest mt-4">{item.engagementHint}</p>
      <p className="text-sm text-txt-secondary leading-relaxed font-medium mt-3">{item.whyItMatters}</p>
    </a>
  );
}

function AngleCard({ angle }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Viral {angle.viralPotential || 0}</span>
        <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">{angle.suggestedFormat}</span>
      </div>
      <div className="space-y-2">
        <p className="text-base font-bold text-txt leading-snug">{angle.angle}</p>
        <p className="text-sm text-txt-secondary leading-relaxed font-medium">{angle.description}</p>
      </div>
      {angle.hookIdea && (
        <div className="rounded-2xl bg-bg-elevated/50 border border-border p-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Hook</p>
          <p className="text-sm text-txt-secondary leading-relaxed font-medium">{angle.hookIdea}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {(angle.platforms || []).map((platform) => (
          <span key={platform} className="px-3 py-1 rounded-xl bg-bg-card border border-border text-[10px] font-black uppercase tracking-widest text-txt-muted">
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ icon: Icon, label, color, children }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h4 className="text-xs font-black text-txt uppercase tracking-[0.2em]">{label}</h4>
      </div>
      {children}
    </div>
  );
}

function FeaturedVideoCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="group rounded-[2.5rem] border border-border overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-primary/25 transition-all block">
      <div className="aspect-video relative overflow-hidden bg-bg-elevated">
        {data.thumbnail && <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/90 text-[10px] font-black uppercase tracking-widest">Featured Video</span>
            {data.duration ? <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest">{data.duration}</span> : null}
          </div>
          <p className="text-xl lg:text-2xl font-black tracking-tight leading-tight max-w-2xl">{data.title}</p>
          <div className="flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-widest text-white/80">
            <span>{data.author}</span>
            <div className="flex items-center gap-4">
              <span>{fmt(data.metrics?.views)} views</span>
              <span>{fmt(data.metrics?.likes)} likes</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function MediaCard({ data, compact = false }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-[2rem] border border-border overflow-hidden hover:border-primary/30 transition-all shadow-sm hover:shadow-xl block">
      <div className={`relative overflow-hidden bg-bg-elevated ${compact ? "aspect-[16/10]" : "aspect-video"}`}>
        {data.thumbnail && <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30"><Play className="w-6 h-6 fill-white" /></div>
        </div>
        {data.metrics?.views > 0 && <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">{fmt(data.metrics.views)} views</div>}
      </div>
      <div className={`space-y-3 ${compact ? "p-5" : "p-6"}`}>
        <p className="text-sm font-bold text-txt leading-snug line-clamp-2 group-hover:text-primary transition-colors">{data.title}</p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-txt-muted font-bold uppercase tracking-widest">{data.author}</p>
          <div className="flex gap-2"><Heart className="w-3 h-3 text-txt-muted" /> <span className="text-[10px] font-bold text-txt-muted">{fmt(data.metrics?.likes)}</span></div>
        </div>
      </div>
    </a>
  );
}

function InstagramLinkCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="group rounded-[2rem] border border-border bg-white p-5 shadow-sm hover:shadow-xl hover:border-pink-500/25 transition-all block">
      <div className="flex items-start gap-4">
        <div className="w-24 h-28 rounded-[1.4rem] overflow-hidden bg-bg-elevated shrink-0 relative">
          {data.thumbnail ? (
            <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-pink-500/8 text-pink-500">
              <Camera className="w-8 h-8" />
            </div>
          )}
          <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
            <Play className="w-3.5 h-3.5 fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 text-[9px] font-black uppercase tracking-widest">
              {data.isFallback ? "Instagram Idea" : "Instagram Reel"}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-txt-muted">{data.author}</span>
          </div>
          <p className="text-sm font-bold text-txt leading-relaxed line-clamp-2 group-hover:text-pink-500 transition-colors">
            {data.title || data.description}
          </p>
          <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2">
            {data.description}
          </p>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-txt-muted">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {fmt(data.metrics?.likes)}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {fmt(data.metrics?.comments)}</span>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              Open Link <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function TweetCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="group p-6 rounded-[1.8rem] bg-bg-elevated/50 border border-border hover:bg-white hover:border-primary/20 transition-all block">
      <div className="flex items-center gap-3 mb-4">
        {data.profileImage ? <img src={data.profileImage} alt="" className="w-8 h-8 rounded-full border border-border" /> : <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><User className="w-4 h-4" /></div>}
        <div>
          <p className="text-xs font-black text-txt leading-none mb-0.5">{data.authorName || data.author}</p>
          <p className="text-[10px] text-txt-muted font-medium">{data.author}</p>
        </div>
      </div>
      <p className="text-[13px] text-txt-secondary leading-relaxed font-medium mb-4 line-clamp-3 group-hover:text-txt transition-colors">{data.title || data.description}</p>
      <div className="flex items-center gap-6 text-[10px] font-black text-txt-muted uppercase tracking-tighter">
        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {fmt(data.metrics?.likes)}</span>
        <span className="flex items-center gap-1.5"><Repeat2 className="w-3.5 h-3.5" /> {fmt(data.metrics?.retweets)}</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {fmt(data.metrics?.comments)}</span>
      </div>
    </a>
  );
}

function NewsCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" className="group p-6 rounded-[1.8rem] bg-bg-elevated/50 border border-border hover:bg-white hover:border-blue-500/20 transition-all block">
      <div className="flex items-center gap-3 mb-3">
        <div className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest">{data.author}</div>
        <span className="text-[10px] text-txt-muted font-medium italic">{fmtDate(data.publishedAt)}</span>
      </div>
      <p className="text-sm font-bold text-txt leading-relaxed line-clamp-2 group-hover:text-blue-500 transition-colors">{data.title}</p>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Full Article <ArrowRight className="w-3 h-3" />
      </div>
    </a>
  );
}

function Field({ label, children }) {
  return (<div><label className="block text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-4 ml-1">{label}</label>{children}</div>);
}

function fmt(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return dateStr; }
}
