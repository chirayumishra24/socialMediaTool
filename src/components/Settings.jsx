"use client";

import { useState } from "react";
import { Settings as SettingsIcon, BrainCircuit, Globe, Zap, CheckCircle2, Save, UserCheck, ShieldCheck, HeartPulse, GraduationCap, Database, FileText, Info } from "lucide-react";

const PERSONAS = [
  { id: "visionary", label: "Visionary Leader", desc: "Inspiring, forward-thinking, and bold.", icon: BrainCircuit },
  { id: "nurturing", label: "Nurturing Mentor", desc: "Empathetic, supportive, and parent-focused.", icon: HeartPulse },
  { id: "authoritative", label: "Professional Expert", desc: "Direct, factual, and strictly academic.", icon: ShieldCheck },
  { id: "community", label: "Community Pillar", desc: "Inclusive, warm, and locally engaged.", icon: GraduationCap },
];

const LOCATIONS = [
  { code: "IN", label: "India", icon: Globe }, { code: "US", label: "United States", icon: Globe },
  { code: "GB", label: "United Kingdom", icon: Globe }, { code: "GLOBAL", label: "Global", icon: Globe },
];

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const defaults = {
      defaultLocation: "IN", defaultLanguage: "en",
      defaultFormat: "youtube_long", defaultStyle: "professional",
      aiModel: "pro", geminiKey: "", youtubeKey: "",
      directorPersona: "visionary",
      brandTone: "Authoritative, nurturing, informative, and professional.",
      brandAvoidWords: "viral, smash the like button, clickbait, buy now",
      brandTargetAudience: "Parents of K-12 students, prospective families, and the local community.",
      brandCoreValues: "Holistic education, child safety, academic excellence, transparency.",
      schoolContext: "",
    };

    try {
      const { getSettings } = require("@/lib/storage");
      return { ...defaults, ...getSettings() };
    } catch {
      return defaults;
    }
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("persona");

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
    <div className="p-6 lg:p-14 max-w-5xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-txt tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" strokeWidth={2.5} /> System Configuration
          </h3>
          <p className="text-sm text-txt-secondary font-medium">Customize your institutional voice and AI intelligence parameters.</p>
        </div>

        <div className="flex p-1.5 rounded-2xl bg-bg-card border border-border shadow-sm">
          {[{ id: "persona", l: "Identity", icon: UserCheck }, { id: "knowledge", l: "Knowledge Base", icon: Database }, { id: "api", l: "Engine", icon: Zap }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2.5 ${activeTab === t.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-txt-muted hover:text-txt"}`}>
              <t.icon className="w-4 h-4" /> {t.l}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === "persona" && (
          <div className="space-y-10 animate-fade-in">
            <div className="rounded-[2.5rem] bg-bg-card border border-border p-10 space-y-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-txt uppercase tracking-widest flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" /> Director's Leadership Voice
                  </h4>
                  <p className="text-xs text-txt-muted font-medium">This selection influences the emotional tone and vocabulary of all generated scripts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERSONAS.map((p) => (
                  <button key={p.id} onClick={() => update("directorPersona", p.id)}
                    className={`p-6 rounded-[1.8rem] border-2 text-left transition-all cursor-pointer group flex items-start gap-5 ${settings.directorPersona === p.id ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-bg-elevated/50 border-border hover:bg-bg-card hover:border-primary/20"}`}>
                    <div className={`p-4 rounded-2xl transition-all ${settings.directorPersona === p.id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-bg-card text-txt-muted group-hover:text-primary"}`}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-txt mb-1">{p.label}</h5>
                      <p className="text-[12px] text-txt-secondary leading-relaxed font-medium">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Field label="Institutional Tone">
                  <input type="text" value={settings.brandTone || ""} onChange={(e) => update("brandTone", e.target.value)}
                    placeholder="e.g. Nurturing, professional, and informative."
                    className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </Field>
                <Field label="Words/Phrases to Avoid">
                  <input type="text" value={settings.brandAvoidWords || ""} onChange={(e) => update("brandAvoidWords", e.target.value)}
                    placeholder="e.g. viral, clickbait, buy now (comma separated)"
                    className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </Field>
              </div>
              <div className="space-y-4">
                <Field label="Target Audience Profile">
                  <input type="text" value={settings.brandTargetAudience || ""} onChange={(e) => update("brandTargetAudience", e.target.value)}
                    placeholder="e.g. Parents of K-12 students, prospective families"
                    className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </Field>
                <Field label="Core Values">
                  <input type="text" value={settings.brandCoreValues || ""} onChange={(e) => update("brandCoreValues", e.target.value)}
                    placeholder="e.g. Holistic education, child safety, excellence"
                    className="w-full px-5 py-4 rounded-2xl bg-bg-elevated border border-border text-sm text-txt focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-8 animate-fade-in">
            <div className="rounded-[2.5rem] bg-bg-card border border-border p-10 space-y-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Database className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-sm font-black text-txt uppercase tracking-widest">Institutional Knowledge Base</h4>
                  <p className="text-xs text-txt-muted font-medium">Add school policies, mission statements, and unique rules to provide the AI with "Internal Truth."</p>
                </div>
              </div>

              <div className="space-y-6">
                <Field label="School Context & Guidelines">
                  <textarea value={settings.schoolContext || ""} onChange={(e) => update("schoolContext", e.target.value)}
                    placeholder="Paste your school's mission, specific disciplinary policies, or seasonal focus areas here..."
                    className="w-full h-80 px-6 py-5 rounded-3xl bg-bg-elevated border border-border text-[15px] text-txt-secondary leading-relaxed resize-none focus:ring-2 focus:ring-primary/20 transition-all outline-none custom-scroll" />
                </Field>
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                   <Info className="w-4 h-4 text-primary mt-0.5" />
                   <p className="text-[11px] text-primary-hover font-medium leading-relaxed">
                     This information is injected into the Writer Agent's context. The AI will prioritize these school-specific rules over general educational trends to ensure compliance and cultural fit.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-10 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-[2.5rem] bg-bg-card border border-border p-10 space-y-6 shadow-sm">
                  <h4 className="text-sm font-black text-txt uppercase tracking-widest">AI Intelligence Model</h4>
                  <div className="space-y-4">
                    {[
                      { id: "pro", label: "Gemini 3.1 Pro", icon: BrainCircuit, desc: "High reasoning, complex scripts, best quality.", color: "text-primary" },
                      { id: "flash", label: "Gemini 3 Flash", icon: Zap, desc: "Ultra-fast, efficient for simple tags/metadata.", color: "text-accent" },
                    ].map((m) => (
                      <button key={m.id} onClick={() => update("aiModel", m.id)}
                        className={`w-full p-6 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-5 ${settings.aiModel === m.id ? "bg-primary/5 border-primary shadow-sm" : "bg-bg-elevated/50 border-border hover:bg-bg-card"}`}>
                        <m.icon className={`w-8 h-8 ${settings.aiModel === m.id ? m.color : "text-txt-muted"}`} />
                        <div>
                          <p className="text-sm font-bold text-txt">{m.label}</p>
                          <p className="text-[11px] text-txt-muted mt-0.5">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-bg-card border border-border p-10 space-y-8 shadow-sm">
                  <h4 className="text-sm font-black text-txt uppercase tracking-widest">Content Defaults</h4>
                  <div className="space-y-6">
                    <Field label="Default Intelligence Region">
                      <div className="flex gap-2.5 flex-wrap">
                        {LOCATIONS.map((l) => (
                          <button key={l.code} onClick={() => update("defaultLocation", l.code)}
                            className={`px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2.5 ${settings.defaultLocation === l.code ? "bg-primary/10 text-primary border-primary" : "bg-bg-elevated border-border text-txt-muted hover:text-txt"}`}>
                            <l.icon className="w-4 h-4" /> {l.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="p-6 rounded-2xl bg-bg-elevated/50 border border-border">
                      <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">Technical IDs</p>
                      <div className="space-y-3 opacity-60">
                        <div className="h-2 rounded-full bg-border w-full" />
                        <div className="h-2 rounded-full bg-border w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Global Save */}
      <div className="flex items-center justify-end pt-6">
        <button onClick={handleSave}
          className="px-14 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest grad-primary text-white cursor-pointer shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
          {saved ? <><CheckCircle2 className="w-6 h-6" /> Configuration Optimized</> : <><Save className="w-6 h-6" /> Save Executive Profile</>}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="block text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] mb-3 ml-1">{label}</label>{children}</div>);
}
