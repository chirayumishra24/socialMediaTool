"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, Camera, Hash, MessageSquare, Newspaper, Zap, BarChart2, Search, Globe, Check, Eye, MessageCircle, Heart, ArrowRight, ArrowUpRight, Flame, Lightbulb, Target, Copy, Award, Loader2, Sparkles, AlertCircle, Compass, Clock, Activity, ArrowUp, Repeat2, Play, User, ExternalLink, Wand2 } from "lucide-react";

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

  useEffect(() => {
    if (initialKeyword) setKeyword(initialKeyword);
  }, [initialKeyword]);
  const [platforms, setPlatforms] = useState(["youtube", "instagram", "x", "reddit", "news"]);
  const [depth, setDepth] = useState("deep");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [topKeywords, setTopKeywords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setKeyword(e.detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('skilizee-set-keyword', handler);
    return () => window.removeEventListener('skilizee-set-keyword', handler);
  }, []);

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

      let savedResearch = null;
      try {
        const { saveResearch } = require("@/lib/storage");
        savedResearch = saveResearch({ keyword, research: data.research, platformData: data.platformData, location, depth });
      } catch {}

      onResearchComplete?.({
        id: savedResearch?.id,
        keyword,
        research: data.research,
        platformData: data.platformData,
        topKeywords: data.topKeywords || [],
        location,
        depth,
        researchedAt: new Date().toISOString(),
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [depth, keyword, location, onResearchComplete, platforms]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h3 className="text-2xl font-bold text-txt tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" strokeWidth={2.5} /> Institutional R&D Pipeline
          </h3>
          <p className="text-sm text-txt-muted font-medium">Verify global trends and newsjacking opportunities before production.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] bg-bg-card border border-border p-8 space-y-8 shadow-sm">
            <Field label="Intelligence Topic">
              <input
                type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "NEP 2024 changes"'
                className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              />
            </Field>

            <Field label="Location Focus">
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l.code} onClick={() => setLocation(l.code)}
                    className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${location === l.code ? "bg-primary/10 text-primary border-primary" : "bg-bg-elevated border-border text-txt-muted hover:text-txt"}`}>
                    <l.icon className="w-3.5 h-3.5" /> {l.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Crawl Strategy">
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
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Ingesting Intelligence...</> : <><Sparkles className="w-5 h-5" /> Execute Pipeline</>}
            </button>
          </div>

          <div className="rounded-2xl p-6 bg-accent/5 border border-accent/10 space-y-4">
             <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
               <Globe className="w-3.5 h-3.5" /> Multi-Source Engine
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

        {/* Results / Dashboard Panel */}
        <div className="lg:col-span-8">
          {!result && !loading && (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[3rem] bg-bg-elevated/10">
                <div className="w-24 h-24 rounded-3xl bg-bg-card border border-border flex items-center justify-center text-txt-muted mx-auto mb-8 shadow-sm ring-8 ring-bg-elevated/30"><Compass className="w-12 h-12" /></div>
                <h3 className="text-2xl font-bold text-txt mb-3 tracking-tight">R&D Workspace</h3>
                <p className="text-sm text-txt-muted max-w-sm mx-auto font-medium leading-relaxed">Enter an educational topic on the left to activate the research agents. We'll crawl YouTube, Instagram, X, and News for institutional insights.</p>
             </div>
          )}

          {loading && (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[3rem] bg-bg-elevated/10 animate-pulse">
               <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-8 ring-8 ring-primary/5 animate-bounce"><Search className="w-10 h-10" /></div>
               <h3 className="text-2xl font-bold text-txt mb-8 tracking-tight uppercase tracking-widest">Ingesting Global Signals...</h3>
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
               <ResearchResults research={result} platformData={platformData} topKeywords={topKeywords} />
               
               <div className="sticky bottom-6 left-0 right-0 p-1 bg-white/80 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 z-50">
                  <div className="pl-8">
                    <p className="text-xs font-bold text-txt">Intelligence Ingested</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ready for Production</p>
                  </div>
                  <button onClick={() => onGoToStudio({ keyword, research: result, platformData, topKeywords, location, depth, researchedAt: new Date().toISOString() })}
                    className="px-12 py-4 rounded-[2rem] grad-primary text-white text-[13px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer">
                    <Sparkles className="w-5 h-5" /> Start Content Studio
                  </button>
               </div>
               
               {/* ═══ RECOMMENDED STRATEGY BUNDLE ═══ */}
               <div className="relative mt-20 p-12 rounded-[3.5rem] bg-bg-card border border-primary/20 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 grad-primary opacity-[0.03]" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
                  
                  <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl grad-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                              <Sparkles className="w-5 h-5 animate-pulse" />
                           </div>
                           <h4 className="text-sm font-black text-txt uppercase tracking-widest">Recommended Execution Bundle</h4>
                        </div>
                        <h3 className="text-3xl font-black text-txt tracking-tight leading-tight">
                           Convert this research into a <span className="text-primary italic">High-Impact Bundle</span>
                        </h3>
                        <p className="text-sm text-txt-secondary leading-relaxed max-w-xl font-medium">
                           Our AI has analyzed the signals and recommends a **triple-threat** strategy: One long-form YouTube insight, two trending IG Reels, and an X Thread for community engagement.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                           {["IG Reel", "X Thread", "LinkedIn Post"].map((type, i) => (
                             <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-border text-[10px] font-black text-txt-muted uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                {type}
                             </div>
                           ))}
                        </div>
                     </div>
                     
                     <button 
                       onClick={() => onGoToStudio({ keyword, research: result, platformData, topKeywords, location, depth, researchedAt: new Date().toISOString() })}
                       className="shrink-0 px-10 py-5 rounded-[2rem] grad-primary text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 hover:scale-[1.02] transition-all flex items-center gap-4 cursor-pointer"
                     >
                        Initialize Content Bundle <Wand2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResearchResults({ research, platformData, topKeywords }) {
  const r = research;
  
  // Sort and filter data
  const ytVideos = (platformData?.youtube || []).sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0));
  const igPosts = (platformData?.instagram || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const xPosts = (platformData?.x || []).sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0));
  const newsPosts = (platformData?.news || []).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className="space-y-12">
      {/* ═══ STRATEGY BLUEPRINT ═══ */}
      {r.strategyBlueprint && (
        <div className="rounded-[3rem] bg-white border border-border p-10 space-y-10 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Lightbulb className="w-64 h-64" /></div>
           
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Sparkles className="w-6 h-6" /></div>
              <div>
                <h4 className="text-sm font-black text-txt uppercase tracking-widest">Institutional Strategy Blueprint</h4>
                <p className="text-xs text-txt-muted font-medium">Gemini 3.1 Pro Integrated Analysis</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <Field label="Core Institutional Concept">
                  <p className="text-base text-txt-secondary leading-loose font-medium italic">"{r.strategyBlueprint.concept}"</p>
                </Field>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  {r.strategyBlueprint.recommendedTools?.map(t => (
                    <span key={t} className="px-4 py-2 rounded-xl bg-bg-elevated border border-border text-[11px] font-bold text-txt-muted">#{t}</span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-8">
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
        </div>
      )}

      {/* ═══ PLATFORM INTELLIGENCE GRID ═══ */}
      <div className="space-y-10">
        
        {/* YouTube Section */}
        {ytVideos.length > 0 && (
          <Section icon={MonitorPlay} label="High-Retention Video Intelligence" color="text-red-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {ytVideos.slice(0, 4).map((v, i) => (
                 <MediaCard key={i} data={v} />
               ))}
            </div>
          </Section>
        )}

        {/* Instagram Section */}
        {igPosts.length > 0 && (
          <Section icon={Camera} label="Visual & Reel Performance" color="text-pink-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {igPosts.slice(0, 3).map((ig, i) => (
                  <InstagramCard key={i} data={ig} />
                ))}
             </div>
          </Section>
        )}

        {/* X & News Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {xPosts.length > 0 && (
             <Section icon={Hash} label="Public Sentiment (X)" color="text-txt">
                <div className="space-y-4">
                   {xPosts.slice(0, 4).map((t, i) => (
                     <TweetCard key={i} data={t} />
                   ))}
                </div>
             </Section>
           )}
           {newsPosts.length > 0 && (
             <Section icon={Newspaper} label="Newsjacking Headlines" color="text-blue-500">
                <div className="space-y-4">
                   {newsPosts.slice(0, 4).map((n, i) => (
                     <NewsCard key={i} data={n} />
                   ))}
                </div>
             </Section>
           )}
        </div>

      </div>

      {/* ═══ AUDIENCE & GAP ANALYSIS ═══ */}
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
                   <div key={i} className="p-6 rounded-3xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all cursor-default">
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

function MediaCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer" 
      className="group bg-white rounded-[2rem] border border-border overflow-hidden hover:border-primary/30 transition-all shadow-sm hover:shadow-xl block">
       <div className="aspect-video relative overflow-hidden bg-bg-elevated">
          {data.thumbnail && <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30"><Play className="w-6 h-6 fill-white" /></div>
          </div>
          {data.metrics?.views > 0 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
               {fmt(data.metrics.views)} VIEWS
            </div>
          )}
       </div>
       <div className="p-6 space-y-3">
          <p className="text-sm font-bold text-txt leading-snug line-clamp-2 group-hover:text-primary transition-colors">{data.title}</p>
          <div className="flex items-center justify-between">
             <p className="text-[10px] text-txt-muted font-bold uppercase tracking-widest">{data.author}</p>
             <div className="flex gap-2">
                <Heart className="w-3 h-3 text-txt-muted" /> <span className="text-[10px] font-bold text-txt-muted">{fmt(data.metrics?.likes)}</span>
             </div>
          </div>
       </div>
    </a>
  );
}

function InstagramCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer"
      className="group bg-white rounded-[2rem] border border-border p-6 hover:border-pink-500/30 transition-all shadow-sm hover:shadow-xl flex flex-col h-full block">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500"><Camera className="w-4 h-4" /></div>
             <p className="text-[10px] font-black text-txt uppercase tracking-widest">Reel Strategy</p>
          </div>
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
       </div>
       
       {data.thumbnail && (
          <div className="w-full aspect-[9/12] rounded-2xl overflow-hidden bg-bg-elevated mb-5 relative">
             <img src={data.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             {data.videoUrl && <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white"><Play className="w-3 h-3 fill-white" /></div>}
          </div>
       )}

       <p className="text-[13px] font-bold text-txt leading-relaxed line-clamp-3 mb-4">{data.title || data.description}</p>
       
       <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-[10px] font-black text-txt-muted uppercase tracking-widest">
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {fmt(data.metrics?.likes)}</span>
             <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {fmt(data.metrics?.comments)}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 group-hover:text-pink-500" />
       </div>
    </a>
  );
}

function TweetCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer"
      className="group p-6 rounded-[1.8rem] bg-bg-elevated/50 border border-border hover:bg-white hover:border-primary/20 transition-all block">
       <div className="flex items-center gap-3 mb-4">
          {data.profileImage ? (
            <img src={data.profileImage} alt="" className="w-8 h-8 rounded-full border border-border" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><User className="w-4 h-4" /></div>
          )}
          <div>
            <p className="text-xs font-black text-txt leading-none mb-0.5">{data.authorName || data.author}</p>
            <p className="text-[10px] text-txt-muted font-medium">{data.author}</p>
          </div>
       </div>
       <p className="text-[13px] text-txt-secondary leading-relaxed font-medium mb-4 line-clamp-3 group-hover:text-txt transition-colors">
          {data.title || data.description}
       </p>
       <div className="flex items-center gap-6 text-[10px] font-black text-txt-muted uppercase tracking-tighter">
          <span className="flex items-center gap-1.5 hover:text-primary"><Heart className="w-3.5 h-3.5" /> {fmt(data.metrics?.likes)}</span>
          <span className="flex items-center gap-1.5 hover:text-primary"><Repeat2 className="w-3.5 h-3.5" /> {fmt(data.metrics?.retweets)}</span>
          <span className="flex items-center gap-1.5 hover:text-primary"><MessageCircle className="w-3.5 h-3.5" /> {fmt(data.metrics?.comments)}</span>
       </div>
    </a>
  );
}

function NewsCard({ data }) {
  return (
    <a href={data.url} target="_blank" rel="noopener noreferrer"
      className="group p-6 rounded-[1.8rem] bg-bg-elevated/50 border border-border hover:bg-white hover:border-blue-500/20 transition-all block">
       <div className="flex items-center gap-3 mb-3">
          <div className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest">{data.author}</div>
          <span className="text-[10px] text-txt-muted font-medium italic">{formatDate(data.publishedAt)}</span>
       </div>
       <p className="text-sm font-bold text-txt leading-relaxed line-clamp-2 group-hover:text-blue-500 transition-colors">
          {data.title}
       </p>
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
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return dateStr; }
}
