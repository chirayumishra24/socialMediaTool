"use client";

import { useState, useCallback } from "react";
import { MonitorPlay, Smartphone, Clapperboard, Layers, Hash, Briefcase, BookOpen, PenTool, Sparkles, Bot, Tag, Edit3, Loader2, Copy, FileText, Globe, Flame, Clock, Wand2 } from "lucide-react";

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
const LOCS = [{ c: "IN", l: "India", icon: Globe }, { c: "US", l: "US", icon: Globe }, { c: "GB", l: "UK", icon: Globe }, { c: "GLOBAL", l: "Global", icon: Globe }];

export default function ContentStudio() {
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("youtube_long");
  const [style, setStyle] = useState("professional");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("script");

  const handleGenerate = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { getSettings } = require("@/lib/storage");
      const s = getSettings();
      const brandVoice = {
        tone: s.brandTone,
        audience: s.brandTargetAudience,
        values: s.brandCoreValues,
        avoidWords: s.brandAvoidWords,
      };

      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, format, style, audience, location, brandVoice }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [keyword, format, style, audience, location]);

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-txt flex items-center gap-2"><Clapperboard className="w-4 h-4 text-primary" /> Content Studio</h3>
          <div className="rounded-xl bg-bg-card border border-border p-4 space-y-4">
            <Field label="Topic *">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="What's the content about?"
                className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted" />
            </Field>
            <Field label="Audience">
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Parents, Students, Teachers"
                className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted" />
            </Field>
            <Field label="Format">
              <div className="grid grid-cols-2 gap-1.5">
                {FORMATS.map((f) => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${format === f.id ? "bg-primary-muted border-primary/30" : "bg-bg-elevated border-border hover:border-border"}`}>
                    <f.icon className={`w-4 h-4 mb-1.5 ${format === f.id ? "text-primary-hover" : "text-txt-muted"}`} />
                    <p className="text-[10px] font-bold text-txt mt-0.5">{f.label}</p>
                    <p className="text-[9px] text-txt-muted">{f.desc}</p>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Style">
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold capitalize border cursor-pointer transition-all ${style === s ? "bg-accent/15 border-accent/30 text-accent-hover" : "bg-bg-elevated border-border text-txt-muted"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Location">
              <div className="flex gap-1.5">
                {LOCS.map((l) => (
                  <button key={l.c} onClick={() => setLocation(l.c)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${location === l.c ? "bg-primary-muted border-primary/30 text-primary-hover" : "bg-bg-elevated border-border text-txt-muted hover:text-txt-secondary"}`}>
                    <l.icon className="w-3 h-3" /> {l.l}
                  </button>
                ))}
              </div>
            </Field>
            <button onClick={handleGenerate} disabled={loading || !keyword.trim()}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : keyword.trim() ? "grad-primary text-white cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90" : "bg-bg-elevated text-txt-muted cursor-not-allowed"}`}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Content</>}
            </button>
            {error && <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">{error}</div>}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 animate-float"><Wand2 className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-txt mb-1">Ready to Create</h3>
              <p className="text-sm text-txt-muted max-w-md">Set topic, format, and style — let the AI pipeline generate platform-optimized content.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary-hover mx-auto mb-4 animate-float"><Bot className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-txt mb-2">AI Pipeline Running</h3>
              <div className="space-y-1.5 text-xs text-txt-secondary">
                <p className="flex items-center justify-center gap-2"><PenTool className="w-3.5 h-3.5 text-primary" /> Writer Agent drafting...</p>
                <p className="flex items-center justify-center gap-2 text-txt-muted"><Edit3 className="w-3.5 h-3.5 text-orange-400" /> Editor Agent polishing...</p>
                <p className="flex items-center justify-center gap-2 text-txt-muted"><Tag className="w-3.5 h-3.5 text-success" /> SEO Agent tagging...</p>
              </div>
              <p className="text-[10px] text-txt-muted mt-4">~60-90 seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-1 p-1 rounded-lg bg-bg-card border border-border inline-flex">
                {[{ id: "script", l: "Script", icon: FileText }, { id: "seo", l: "SEO & Tags", icon: Tag }, { id: "editing", l: "Report", icon: Edit3 }].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "bg-primary-muted text-primary-hover" : "text-txt-muted hover:text-txt-secondary"}`}>
                    <t.icon className="w-3.5 h-3.5" /> {t.l}
                  </button>
                ))}
              </div>

              {tab === "script" && (
                <div className="rounded-xl bg-bg-card border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-txt flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Generated Script</h4>
                    <button onClick={() => navigator.clipboard.writeText(result.script || "")}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-bg-elevated border border-border text-txt-secondary hover:text-txt cursor-pointer flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
                  </div>
                  <pre className="text-xs text-txt-secondary leading-relaxed whitespace-pre-wrap custom-scroll max-h-[500px] overflow-y-auto">{result.script}</pre>
                </div>
              )}

              {tab === "seo" && result.seo && (
                <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
                  <h4 className="text-sm font-bold text-txt flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Precision Tags</h4>
                  {result.seo.titles?.map((t, i) => (
                    <div key={i} className="p-2 rounded-lg bg-bg-elevated border border-border">
                      <div className="flex justify-between"><p className="text-xs font-semibold text-txt">{t.title}</p><span className="text-[10px] font-bold text-primary-hover">CTR:{t.ctrScore}</span></div>
                      <p className="text-[10px] text-txt-muted">{t.strategy}</p>
                    </div>
                  ))}
                  {result.seo.tags && ["primary", "secondary", "longTail"].map((tier) => (
                    result.seo.tags[tier]?.length > 0 && (
                      <div key={tier}>
                        <p className="text-[9px] text-txt-muted uppercase mb-1">{tier}</p>
                        <div className="flex flex-wrap gap-1">
                          {result.seo.tags[tier].map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-bg-elevated border border-border text-txt-secondary flex items-center gap-1">{tag.tag || tag} {tag.trending && <Flame className="w-2.5 h-2.5 text-orange-500" />}</span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {result.seo.postingTime && (
                    <div className="p-3 rounded-lg bg-primary-muted border border-primary/20">
                      <p className="text-[10px] font-bold text-primary-hover flex items-center gap-1.5 mb-1"><Clock className="w-3.5 h-3.5" /> Best Time: {result.seo.postingTime.bestDay} {result.seo.postingTime.bestTime}</p>
                      <p className="text-[10px] text-txt-muted">{result.seo.postingTime.reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === "editing" && result.editing && (
                <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
                  <h4 className="text-sm font-bold text-txt flex items-center gap-2"><Edit3 className="w-4 h-4 text-primary" /> Edit Report</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[["Hook", result.editing.hookScore], ["CTA", result.editing.ctaStrength], ["Read", result.editing.readabilityScore], ["Overall", result.editing.overallScore]].map(([l, v]) => (
                      <div key={l} className="p-2.5 rounded-lg bg-bg-elevated border border-border text-center">
                        <p className={`text-xl font-bold ${(v || 0) >= 80 ? "text-success" : (v || 0) >= 50 ? "text-warning" : "text-danger"}`}>{v || "—"}</p>
                        <p className="text-[9px] text-txt-muted">{l}</p>
                      </div>
                    ))}
                  </div>
                  {result.editing.changes?.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-accent/15 text-accent-hover shrink-0">{c.type}</span>
                      <p className="text-[11px] text-txt-secondary">{c.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="block text-[11px] font-semibold text-txt-secondary mb-1">{label}</label>{children}</div>);
}
