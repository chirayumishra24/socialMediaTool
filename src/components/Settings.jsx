"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, BrainCircuit, Globe, Zap, CheckCircle2, Save } from "lucide-react";

const LOCATIONS = [
  { code: "IN", label: "India", icon: Globe }, { code: "US", label: "United States", icon: Globe },
  { code: "GB", label: "United Kingdom", icon: Globe }, { code: "GLOBAL", label: "Global", icon: Globe },
];

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" },
  { code: "hinglish", label: "Hinglish" },
];

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultLocation: "IN", defaultLanguage: "en",
    defaultFormat: "youtube_long", defaultStyle: "professional",
    aiModel: "pro", geminiKey: "", youtubeKey: "",
    brandTone: "Authoritative, nurturing, informative, and professional.",
    brandAvoidWords: "viral, smash the like button, clickbait, buy now",
    brandTargetAudience: "Parents of K-12 students, prospective families, and the local community.",
    brandCoreValues: "Holistic education, child safety, academic excellence, transparency.",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const { getSettings } = require("@/lib/storage");
      const s = getSettings();
      if (Object.keys(s).length > 0) setSettings((prev) => ({ ...prev, ...s }));
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      const { saveSettings } = require("@/lib/storage");
      saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const update = (key, value) => setSettings((p) => ({ ...p, [key]: value }));

  return (
    <div className="p-5 max-w-3xl mx-auto space-y-5">
      <h3 className="text-sm font-bold text-txt flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-primary" /> Settings</h3>

      {/* API Keys */}
      <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
        <h4 className="text-xs font-bold text-txt-secondary uppercase tracking-wider">API Keys</h4>
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Gemini API Key</label>
          <input type="password" value={settings.geminiKey} onChange={(e) => update("geminiKey", e.target.value)}
            placeholder="Set in .env.local — GEMINI_API_KEY"
            className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all" />
          <p className="text-[10px] text-txt-muted mt-1">Primary key is set via .env.local file. This overrides it for the browser session only.</p>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1">YouTube API Key</label>
          <input type="password" value={settings.youtubeKey} onChange={(e) => update("youtubeKey", e.target.value)}
            placeholder="Set in .env.local — YOUTUBE_API_KEY"
            className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all" />
        </div>
      </div>

      {/* Brand Voice Memory */}
      <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
        <h4 className="text-xs font-bold text-txt-secondary uppercase tracking-wider flex items-center gap-2"><BrainCircuit className="w-3.5 h-3.5 text-accent-hover" /> Brand Voice Memory</h4>
        <p className="text-[11px] text-txt-muted mb-2">The AI Writer Agent uses this to ensure all generated content matches your unique brand.</p>
        
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Brand Tone</label>
          <input type="text" value={settings.brandTone || ""} onChange={(e) => update("brandTone", e.target.value)}
            placeholder="e.g. Nurturing, professional, and informative."
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Target Audience</label>
            <input type="text" value={settings.brandTargetAudience || ""} onChange={(e) => update("brandTargetAudience", e.target.value)}
              placeholder="e.g. Parents of K-12 students."
              className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-txt transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Core Values</label>
            <input type="text" value={settings.brandCoreValues || ""} onChange={(e) => update("brandCoreValues", e.target.value)}
              placeholder="e.g. Holistic education, safety, excellence."
              className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-txt transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1">Words/Phrases to Avoid</label>
          <input type="text" value={settings.brandAvoidWords || ""} onChange={(e) => update("brandAvoidWords", e.target.value)}
            placeholder="e.g. viral, clickbait, buy now (comma separated)"
            className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted transition-all" />
        </div>
      </div>

      {/* Location & Language */}
      <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
        <h4 className="text-xs font-bold text-txt-secondary uppercase tracking-wider">Content Defaults</h4>
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Default Location</label>
          <div className="flex gap-2 flex-wrap">
            {LOCATIONS.map((l) => (
              <button key={l.code} onClick={() => update("defaultLocation", l.code)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${settings.defaultLocation === l.code ? "bg-primary-muted text-primary-hover border-primary/30" : "bg-bg-elevated border-border text-txt-muted hover:text-txt-secondary"}`}>
                <l.icon className="w-3 h-3" /> {l.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-txt-secondary mb-1.5">Default Language</label>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => update("defaultLanguage", l.code)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${settings.defaultLanguage === l.code ? "bg-accent/15 text-accent-hover border-accent/30" : "bg-bg-elevated border-border text-txt-muted hover:text-txt-secondary"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Model */}
      <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
        <h4 className="text-xs font-bold text-txt-secondary uppercase tracking-wider">AI Model</h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => update("aiModel", "pro")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${settings.aiModel === "pro" ? "bg-primary-muted border-primary/30" : "bg-bg-elevated border-border"}`}>
            <p className="text-sm font-bold text-txt flex items-center gap-1.5"><BrainCircuit className={`w-4 h-4 ${settings.aiModel === "pro" ? "text-primary-hover" : "text-txt-muted"}`} /> Gemini 3.1 Pro</p>
            <p className="text-[10px] text-txt-muted mt-1">Best quality — deep research, complex scripts. Slower.</p>
          </button>
          <button onClick={() => update("aiModel", "flash")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${settings.aiModel === "flash" ? "bg-accent/15 border-accent/30" : "bg-bg-elevated border-border"}`}>
            <p className="text-sm font-bold text-txt flex items-center gap-1.5"><Zap className={`w-4 h-4 ${settings.aiModel === "flash" ? "text-accent-hover" : "text-txt-muted"}`} /> Gemini 3 Flash</p>
            <p className="text-[10px] text-txt-muted mt-1">Fast — quick tags, simple scripts. 3x faster.</p>
          </button>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave}
        className="w-full py-3 rounded-xl text-sm font-bold grad-primary text-white cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2">
        {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
      </button>
    </div>
  );
}
