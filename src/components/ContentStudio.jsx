"use client";

import { useState, useCallback, useEffect } from "react";
import { MonitorPlay, Smartphone, Clapperboard, Layers, Hash, Briefcase, BookOpen, PenTool, Sparkles, Bot, Tag, Edit3, Loader2, Copy, FileText, Globe, Flame, Clock, Wand2, ArrowLeft, Beaker, X, ChevronRight, Save, CheckCircle2, UserCheck, Eye, TrendingUp, MousePointerClick } from "lucide-react";
import SocialPreview from "./SocialPreview";
import { saveContent, useLearningSignals, useSettingsSnapshot } from "@/lib/storage";

const FORMATS = [
  { id: "youtube_long", label: "YT Long", icon: MonitorPlay, desc: "8-20min" },
  { id: "youtube_short", label: "YT Short", icon: Smartphone, desc: "15-60s" },
  { id: "instagram_reel", label: "IG Reel", icon: Clapperboard, desc: "15-90s" },
  { id: "instagram_carousel", label: "IG Carousel", icon: Layers, desc: "8-12 slides" },
  { id: "x_thread", label: "X Thread", icon: Hash, desc: "5-15 tweets" },
  { id: "linkedin_post", label: "LinkedIn", icon: Briefcase, desc: "800-1500ch" },
  { id: "blog_article", label: "Blog", icon: BookOpen, desc: "1000-3000w" },
];

const STYLES = ["professional", "casual", "hinglish", "story", "data", "provocative", "educational"];

export default function ContentStudio({ researchContext, onClearContext }) {
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("youtube_long");
  const [style, setStyle] = useState("professional");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bundleResult, setBundleResult] = useState(null); // NEW: For multi-format results
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("script");
  const [isSaved, setIsSaved] = useState(false);
  const settings = useSettingsSnapshot();
  const learningSignals = useLearningSignals();
  const activePersona = settings.directorPersona || "visionary";

  useEffect(() => {
    if (researchContext?.keyword) {
      setKeyword(researchContext.keyword);
      if (researchContext.location) setLocation(researchContext.location);
      if (researchContext.format) setFormat(researchContext.format);
    }
  }, [researchContext]);

  const handleGenerate = useCallback(async (isBundle = false) => {
    if (!keyword.trim()) return;
    setLoading(true); setError(null); setResult(null); setBundleResult(null); setIsSaved(false);
    try {
      const researchSummary = researchContext?.research ? {
        summary: researchContext.research.executiveSummary || "",
        angles: researchContext.research.suggestedAngles || [],
        hooks: researchContext.research.suggestedHooks || [],
        topKeywords: (researchContext.topKeywords || []).slice(0, 10).map(k => k.keyword || k),
      } : null;

      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          keyword, format, style, audience, location, 
          research: researchSummary,
          bundle: isBundle,
          directorPersona: settings.directorPersona || "visionary",
          schoolContext: settings.schoolContext || "",
          learningSignals,
          brandVoice: {
            tone: settings.brandTone,
            audience: settings.brandTargetAudience,
            values: settings.brandCoreValues,
            avoidWords: settings.brandAvoidWords
          }
        }),
      });
      if (!res.ok) {
        const failure = await res.json().catch(() => ({}));
        throw new Error(failure.error || "Generation failed");
      }
      const data = await res.json();
      if (data.bundle) {
        setBundleResult(data.scripts);
        // Set first script as primary result to keep UI working
        const firstFormat = Object.keys(data.scripts)[0];
        setFormat(firstFormat);
        setResult({ script: data.scripts[firstFormat], metadata: data.metadata });
      } else {
        setResult(data);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [keyword, format, style, audience, location, researchContext, settings, learningSignals]);

  const handleSave = () => {
    if (!result) return;
    try {
      saveContent({
        keyword,
        format,
        script: result.script,
        originalScript: result.originalScript,
        seo: result.seo || {},
        editing: result.editing || {},
        research: researchContext?.research || null,
        metadata: { 
          keyword, format, style, audience, location, 
          researchId: researchContext?.id,
          persona: result.metadata?.directorPersona,
        },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h3 className="text-2xl font-bold text-txt tracking-tight flex items-center gap-2">
            <PenTool className="w-6 h-6 text-primary" strokeWidth={2.5} /> Content Production Studio
          </h3>
          <p className="text-sm text-txt-muted font-medium">Turn verified intelligence into platform-optimized educational content.</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-bg-card border border-border shadow-sm">
          <UserCheck className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">Active Voice</p>
            <p className="text-xs font-bold text-txt capitalize">{activePersona.replace("_", " ")} Director</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-bg-card border border-border p-6 space-y-6 shadow-sm">
            <div className="space-y-4">
              <Field label={researchContext?.keyword ? "Topic (Verified Context)" : "Primary Topic"}>
                <div className="relative">
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter main subject..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-txt transition-all ${researchContext?.keyword ? "bg-primary/[0.03] border-primary/20" : "bg-bg-elevated border-border"}`} />
                  {researchContext?.keyword && <Sparkles className="absolute right-3 top-3 w-4 h-4 text-primary opacity-50" />}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Format Strategy">
                  <select value={format} onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-txt cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </Field>
                <Field label="Style / Tone">
                  <select value={style} onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-txt cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Target Audience">
                <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Parents of middle-schoolers"
                  className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              </Field>
            </div>

            <div className="space-y-3">
              <button onClick={() => handleGenerate(false)} disabled={loading || !keyword.trim()}
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-3 ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : "grad-primary text-white cursor-pointer shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95"}`}>
                {loading && !bundleResult ? <><Loader2 className="w-5 h-5 animate-spin" /> Intelligence Processing...</> : <><Sparkles className="w-5 h-5" /> Generate Executive Script</>}
              </button>

              {researchContext?.research && (
                <button onClick={() => handleGenerate(true)} disabled={loading || !keyword.trim()}
                  className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 border-2 ${loading && bundleResult ? "bg-accent/20 text-accent-hover cursor-wait border-accent/30" : "bg-bg-card border-accent/20 text-accent-hover hover:bg-accent/5 hover:border-accent/40 shadow-lg shadow-accent/5"}`}>
                  {loading && bundleResult ? <><Loader2 className="w-4 h-4 animate-spin" /> Bundling Intelligence...</> : <><Wand2 className="w-4 h-4" /> Generate Full Strategy Bundle</>}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-txt uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-success" /> Performance Memory
              </h4>
              <span className="text-[9px] font-black text-success uppercase tracking-widest">
                {learningSignals.publishedPosts || 0} tracked posts
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Clicks", value: learningSignals.totalClicks || 0, icon: MousePointerClick },
                { label: "Views", value: learningSignals.totalViews || 0, icon: Eye },
                { label: "CTR", value: `${learningSignals.averageCtr || 0}%`, icon: Flame },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-bg-elevated/50 border border-border">
                  <item.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-black text-txt">{item.value}</p>
                  <p className="text-[9px] font-black text-txt-muted uppercase tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {learningSignals.topTags?.length > 0 ? (
              <>
                <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-3">Winning Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {learningSignals.topTags.slice(0, 6).map((item) => (
                      <span key={item.tag} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-success/5 text-success border border-success/15">
                        {item.tag} • {item.totalClicks} clicks
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">Learning Loop</p>
                  <p className="text-xs text-txt-secondary font-medium leading-relaxed">
                    {learningSignals.lessons?.[0]}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-txt-muted font-medium leading-relaxed">
                Publish a few tracked posts with URLs, clicks, and views. The next generations will then lean on real winning tags and formats.
              </p>
            )}
          </div>

          {researchContext?.research && (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-primary-hover uppercase tracking-widest flex items-center gap-2">
                  <Beaker className="w-3.5 h-3.5" /> Context Source
                </h4>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <p className="text-xs font-bold text-txt leading-relaxed">{researchContext.keyword}</p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-primary/10">
                {researchContext.topKeywords?.slice(0, 5).map((kw, i) => (
                  <span key={i} className="text-[9px] font-bold text-primary px-2.5 py-1 rounded-lg bg-white/50 border border-primary/10 shadow-sm">#{kw.keyword || kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8">
          {error && (
            <div className="p-4 mb-6 rounded-xl bg-danger/5 border border-danger/10 text-danger text-sm font-bold flex items-center gap-3">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          {!result && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[2.5rem] bg-bg-elevated/10">
              <div className="w-24 h-24 rounded-3xl bg-bg-card border border-border flex items-center justify-center text-txt-muted mx-auto mb-8 shadow-sm ring-8 ring-bg-elevated/30"><PenTool className="w-12 h-12" /></div>
              <h3 className="text-2xl font-bold text-txt mb-3 tracking-tight">Studio Workspace</h3>
              <p className="text-sm text-txt-muted max-w-sm mx-auto font-medium leading-relaxed">Select your strategy on the left to synthesize intelligence into a polished executive script.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border border-border border-dashed rounded-[2.5rem] bg-bg-elevated/10 animate-pulse">
              <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mx-auto mb-8 ring-8 ring-primary/5"><Bot className="w-12 h-12" /></div>
              <h3 className="text-2xl font-bold text-txt mb-6 tracking-tight">Authoring Intelligence...</h3>
              <div className="space-y-4 w-72 mx-auto">
                <div className="h-3 rounded-full bg-bg-elevated overflow-hidden"><div className="h-full bg-primary w-1/3 animate-progress" /></div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-black text-primary-hover uppercase tracking-widest">Writing</p>
                   <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">•</p>
                   <p className="text-[10px] font-black text-primary-hover uppercase tracking-widest">Optimizing</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex p-1.5 rounded-2xl bg-bg-card border border-border shadow-sm overflow-x-auto custom-scroll no-scrollbar">
                    {[
                      { id: "script", l: "Script", icon: FileText }, 
                      { id: "preview", l: "Visual Mockup", icon: Eye },
                      { id: "seo", l: "Metadata", icon: Tag }, 
                      { id: "editing", l: "Audit", icon: Edit3 }
                    ].map((t) => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2.5 whitespace-nowrap ${tab === t.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-txt-muted hover:text-txt"}`}>
                        <t.icon className="w-4 h-4" /> {t.l}
                      </button>
                    ))}
                  </div>
                  
                  {bundleResult && (
                    <div className="flex gap-2 items-center px-2">
                       <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest mr-2">Switch Format:</span>
                       {Object.keys(bundleResult).map((f) => (
                         <button key={f} onClick={() => { setFormat(f); setResult(prev => ({ ...prev, script: bundleResult[f] })); }}
                           className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${format === f ? "bg-accent/10 border-accent/20 text-accent-hover" : "bg-bg-card border-border text-txt-muted hover:text-txt"}`}>
                           {FORMATS.find(x => x.id === f)?.label || f}
                         </button>
                       ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-start pt-1">
                  <button onClick={() => navigator.clipboard.writeText(result.script || "")}
                    className="p-3 rounded-xl bg-bg-card border border-border text-txt-muted hover:text-txt transition-all cursor-pointer shadow-sm hover:border-primary/20"><Copy className="w-4.5 h-4.5" /></button>
                  <button onClick={handleSave} disabled={isSaved}
                    className={`px-8 py-3 rounded-2xl text-[11px] font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${isSaved ? "bg-success/10 text-success border border-success/20" : "bg-bg-card border border-border text-txt hover:bg-bg-elevated hover:border-primary/30"}`}>
                    {isSaved ? <><CheckCircle2 className="w-4.5 h-4.5" /> Pipeline Updated</> : <><Save className="w-4.5 h-4.5" /> Move to Approval</>}
                  </button>
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-bg-card border border-border shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {tab === "script" && (
                  <div className="p-10 flex-1 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><PenTool className="w-32 h-32" /></div>
                    <pre className="text-[15px] text-txt-secondary leading-loose whitespace-pre-wrap font-sans custom-scroll max-h-[700px] overflow-y-auto pr-6 selection:bg-primary/10">
                      {result.script}
                    </pre>
                  </div>
                )}

                {tab === "preview" && (
                  <div className="p-10 flex-1 bg-bg-elevated/10">
                    <SocialPreview format={format} script={result.script} persona={activePersona} />
                  </div>
                )}

                {tab === "seo" && (
                  <div className="p-10 space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-txt uppercase tracking-[0.2em] border-b border-border pb-3 flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-primary" /> High-CTR Hooks
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {result.seo?.titles?.map((t, i) => (
                          <div key={i} className="p-6 rounded-[1.5rem] bg-bg-elevated/50 border border-border flex items-center justify-between group hover:border-primary/20 hover:bg-bg-card transition-all">
                            <div className="max-w-[80%]"><p className="text-[15px] font-bold text-txt">{t.title}</p><p className="text-[11px] text-txt-muted mt-2 font-medium">{t.strategy}</p></div>
                            <div className="text-right">
                              <span className="text-lg font-black text-primary block group-hover:scale-110 transition-transform">{t.ctrScore}%</span>
                              <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">Est. CTR</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <h4 className="text-[11px] font-black text-txt uppercase tracking-[0.2em] flex items-center gap-2">
                          <Hash className="w-4 h-4 text-accent" /> Intelligence Tags
                        </h4>
                        <button 
                          onClick={() => {
                            const tags = [...(result.seo?.tags?.primary || []), ...(result.seo?.tags?.secondary || [])].map(t => t.tag || t).join(' ');
                            navigator.clipboard.writeText(tags);
                          }}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer"
                        >
                          Copy All Tags
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {result.seo?.tags?.primary?.map((tag, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/5 text-primary-hover border border-primary/20 flex items-center gap-2 hover:bg-primary/10 transition-colors shadow-sm">{tag.tag || tag} <Flame className="w-3.5 h-3.5 text-orange-500" /></span>
                        ))}
                        {result.seo?.tags?.secondary?.map((tag, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl text-xs font-bold bg-bg-elevated border border-border text-txt-secondary hover:bg-bg-card transition-colors">{tag.tag || tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "editing" && (
                  <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[[ "Hook", result.editing?.hookScore ], [ "CTA", result.editing?.ctaStrength ], [ "Readability", result.editing?.readabilityScore ], [ "Overall", result.editing?.overallScore ]].map(([l, v]) => (
                        <div key={l} className="p-6 rounded-[2rem] bg-bg-elevated/50 border border-border text-center group hover:bg-bg-card transition-all">
                          <p className={`text-4xl font-black transition-transform group-hover:scale-110 ${v >= 80 ? "text-success" : v >= 60 ? "text-warning" : "text-danger"}`}>{v || "—"}</p>
                          <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] mt-3">{l}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-txt uppercase tracking-[0.2em] border-b border-border pb-3">AI Editorial Audit</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.editing?.changes?.map((c, i) => (
                          <div key={i} className="flex gap-5 p-6 rounded-2xl bg-bg-elevated/30 border border-border/50 items-start hover:border-primary/10 hover:bg-bg-card transition-all">
                            <span className="px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary-hover uppercase tracking-tighter shrink-0">{c.type}</span>
                            <p className="text-sm text-txt-secondary leading-relaxed font-medium">{c.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="block text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] mb-3 ml-1">{label}</label>{children}</div>);
}
