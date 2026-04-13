"use client";

import { useState } from "react";

const PLATFORMS = [
  { id: "youtube", label: "YouTube", icon: "🎬" },
  { id: "instagram", label: "Instagram", icon: "📸" },
];

const FORMATS = {
  youtube: [
    { id: "youtube_longform", label: "Long-form (8-15 min)", desc: "Full chapters, B-roll notes" },
    { id: "youtube_short", label: "YouTube Short (60s)", desc: "Single punchy insight" },
  ],
  instagram: [
    { id: "instagram_reel", label: "Reel (15-30s)", desc: "Text-overlay driven" },
    { id: "instagram_carousel", label: "Carousel (8-12 slides)", desc: "Swipeable education content" },
  ],
};

const STYLES = [
  "Engaging & Conversational",
  "Hinglish & Ancient Wisdom",
  "Myth vs. Fact",
  "Story-based",
  "Explainer / Educational",
  "Funny & Relatable",
  "Listicle (Top 5/7/10)",
];

export default function GenerateForm({ onGenerate, isGenerating, prefill }) {
  const [niche, setNiche] = useState(prefill?.niche || "");
  const [audience, setAudience] = useState(prefill?.audience || "");
  const [platform, setPlatform] = useState(prefill?.platform || "youtube");
  const [format, setFormat] = useState(prefill?.format || "youtube_longform");
  const [style, setStyle] = useState(prefill?.style || STYLES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!niche.trim()) return;
    onGenerate({ niche, audience, platform, format, style });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Niche */}
      <div>
        <label htmlFor="niche" className="block text-xs font-semibold text-text-secondary mb-1.5">
          Subject / Niche *
        </label>
        <input
          id="niche"
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder='e.g. "Quantum Physics", "Study Hacks", "Indian History"'
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          required
        />
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="audience" className="block text-xs font-semibold text-text-secondary mb-1.5">
          Target Audience
        </label>
        <input
          id="audience"
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder='e.g. "Class 10 students", "College freshers", "Competitive exam aspirants"'
          className="w-full px-3.5 py-2.5 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Platform */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Platform</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPlatform(p.id);
                setFormat(FORMATS[p.id][0].id);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                platform === p.id
                  ? "bg-primary/15 border-primary/30 text-primary-light"
                  : "bg-surface-hover border-border text-text-secondary hover:border-primary/20"
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Content Format</label>
        <div className="space-y-1.5">
          {FORMATS[platform]?.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm border transition-all cursor-pointer ${
                format === f.id
                  ? "bg-primary/15 border-primary/30 text-primary-light"
                  : "bg-surface-hover border-border text-text-secondary hover:border-primary/20"
              }`}
            >
              <span className="font-medium">{f.label}</span>
              <span className="text-xs text-text-muted ml-2">— {f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Content Style</label>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                style === s
                  ? "bg-accent/15 border-accent/30 text-accent-light"
                  : "bg-surface-hover border-border text-text-muted hover:text-text-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        id="generate-button"
        type="submit"
        disabled={isGenerating || !niche.trim()}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
          isGenerating
            ? "bg-primary/30 text-primary-light cursor-wait"
            : niche.trim()
            ? "gradient-primary text-white hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/40"
            : "bg-surface-hover text-text-muted cursor-not-allowed"
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running AI Pipeline...
          </span>
        ) : (
          "✨ Generate Content"
        )}
      </button>

      {isGenerating && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="cursor-blink">Agents working: Researcher → Writer → Editor → SEO</span>
          </div>
          <div className="h-1 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary"
              style={{ animation: "progress-flow 90s linear forwards" }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
