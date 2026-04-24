"use client";

import { useState, useCallback } from "react";

const FORMATS = [
  { id: "youtube_long", label: "YT Long", icon: "🎬", desc: "8-20min" },
  { id: "youtube_short", label: "YT Short", icon: "📱", desc: "15-60s" },
  { id: "instagram_reel", label: "IG Reel", icon: "🎞️", desc: "15-90s" },
  { id: "instagram_carousel", label: "IG Carousel", icon: "📸", desc: "8-12 slides" },
  { id: "x_thread", label: "X Thread", icon: "𝕏", desc: "5-15 tweets" },
  { id: "linkedin_post", label: "LinkedIn", icon: "💼", desc: "800-1500ch" },
  { id: "blog_article", label: "Blog", icon: "📝", desc: "1000-3000w" },
];

const STYLES = ["professional", "casual", "hinglish", "story", "data", "provocative", "educational"];
const LOCS = [{ c: "IN", l: "🇮🇳 India" }, { c: "US", l: "🇺🇸 US" }, { c: "GB", l: "🇬🇧 UK" }, { c: "GLOBAL", l: "🌍 Global" }];

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
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, format, style, audience, location }),
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
          <h3 className="text-sm font-bold text-txt flex items-center gap-2">🎬 Content Studio</h3>
          <div className="rounded-xl bg-bg-card border border-border p-4 space-y-4">
            <Field label="Topic *">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="What's the content about?"
                className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted" />
            </Field>
            <Field label="Audience">
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. College students"
                className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted" />
            </Field>
            <Field label="Format">
              <div className="grid grid-cols-2 gap-1.5">
                {FORMATS.map((f) => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${format === f.id ? "bg-primary-muted border-primary/30" : "bg-bg-elevated border-border"}`}>
                    <span className="text-sm">{f.icon}</span>
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${location === l.c ? "bg-primary-muted border-primary/30 text-primary-hover" : "bg-bg-elevated border-border text-txt-muted"}`}>
                    {l.l}
                  </button>
                ))}
              </div>
            </Field>
            <button onClick={handleGenerate} disabled={loading || !keyword.trim()}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${loading ? "bg-primary/20 text-primary-hover cursor-wait" : keyword.trim() ? "grad-primary text-white cursor-pointer shadow-lg shadow-primary/20" : "bg-bg-elevated text-txt-muted cursor-not-allowed"}`}>
              {loading ? "⏳ Generating..." : "✨ Generate Content"}
            </button>
            {error && <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">{error}</div>}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4 animate-float">✨</div>
              <h3 className="text-lg font-bold text-txt mb-1">Ready to Create</h3>
              <p className="text-sm text-txt-muted max-w-md">Set topic, format, and style — let the AI pipeline generate platform-optimized content.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="text-5xl mb-4 animate-float">🤖</div>
              <h3 className="text-lg font-bold text-txt mb-2">AI Pipeline Running</h3>
              <div className="space-y-1.5 text-xs text-txt-secondary">
                <p>✍️ Writer Agent drafting...</p>
                <p className="text-txt-muted">✏️ Editor Agent polishing...</p>
                <p className="text-txt-muted">🏷️ SEO Agent tagging...</p>
              </div>
              <p className="text-[10px] text-txt-muted mt-4">~60-90 seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-1 p-1 rounded-lg bg-bg-card border border-border inline-flex">
                {[{ id: "script", l: "📝 Script" }, { id: "seo", l: "🏷️ SEO & Tags" }, { id: "editing", l: "✏️ Report" }].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${tab === t.id ? "bg-primary-muted text-primary-hover" : "text-txt-muted"}`}>
                    {t.l}
                  </button>
                ))}
              </div>

              {tab === "script" && (
                <div className="rounded-xl bg-bg-card border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-txt">Generated Script</h4>
                    <button onClick={() => navigator.clipboard.writeText(result.script || "")}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-bg-elevated border border-border text-txt-secondary hover:text-txt cursor-pointer">📋 Copy</button>
                  </div>
                  <pre className="text-xs text-txt-secondary leading-relaxed whitespace-pre-wrap custom-scroll max-h-[500px] overflow-y-auto">{result.script}</pre>
                </div>
              )}

              {tab === "seo" && result.seo && (
                <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
                  <h4 className="text-sm font-bold text-txt">🏷️ Precision Tags</h4>
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
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-bg-elevated border border-border text-txt-secondary">{tag.tag || tag} {tag.trending && "🔥"}</span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {result.seo.postingTime && (
                    <div className="p-3 rounded-lg bg-primary-muted border border-primary/20">
                      <p className="text-[10px] font-bold text-primary-hover">⏰ Best Time: {result.seo.postingTime.bestDay} {result.seo.postingTime.bestTime}</p>
                      <p className="text-[10px] text-txt-muted">{result.seo.postingTime.reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === "editing" && result.editing && (
                <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
                  <h4 className="text-sm font-bold text-txt">✏️ Edit Report</h4>
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
