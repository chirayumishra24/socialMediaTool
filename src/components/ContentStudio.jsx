"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MonitorPlay,
  Smartphone,
  Clapperboard,
  Layers,
  Hash,
  Briefcase,
  BookOpen,
  PenTool,
  Sparkles,
  Bot,
  Tag,
  Edit3,
  Loader2,
  Copy,
  FileText,
  Globe,
  Flame,
  Wand2,
  X,
  Save,
  CheckCircle2,
  Send,
  Sliders,
  Eye,
  Check,
  RefreshCw,
  Share2,
} from "lucide-react";
import { saveContent } from "@/lib/storage";
import { useAccount } from "@/lib/AccountContext";
import { useToast } from "@/components/ui/Toast";
import SocialPreview from "./SocialPreview";

const FORMATS = [
  { id: "youtube_long", label: "YT Long", icon: MonitorPlay, desc: "8-20min" },
  { id: "youtube_short", label: "YT Shorts", icon: Smartphone, desc: "15-60s" },
  { id: "instagram_reel", label: "IG Reel", icon: Clapperboard, desc: "15-90s" },
  { id: "instagram_carousel", label: "IG Carousel", icon: Layers, desc: "8-12 slides" },
  { id: "x_thread", label: "X Thread", icon: Hash, desc: "5-15 tweets" },
  { id: "linkedin_post", label: "LinkedIn", icon: Briefcase, desc: "800-1500ch" },
  { id: "blog_article", label: "Blog", icon: BookOpen, desc: "1000-3000w" },
];

const STYLES = ["professional", "casual", "hinglish", "story", "data", "provocative", "educational"];

export default function ContentStudio({ researchContext, onSchedulePost, onSendToApproval }) {
  const toast = useToast();
  const { activeAccount } = useAccount();
  const [keyword, setKeyword] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("instagram_reel");
  const [style, setStyle] = useState("professional");
  const [location, setLocation] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [result, setResult] = useState(null);
  const [bundleResult, setBundleResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("script");
  const [isSaved, setIsSaved] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [editableScript, setEditableScript] = useState("");

  useEffect(() => {
    fetch("/api/meta/insights")
      .then((res) => res.json())
      .then((data) => {
        if (data.platforms) {
          const top = data.platforms.flatMap((p) => p.topContent || []);
          setPerformanceData(top);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (researchContext?.keyword) {
      setKeyword(researchContext.keyword);
      if (researchContext.location) setLocation(researchContext.location);
      if (researchContext.format) setFormat(researchContext.format);
    }
  }, [researchContext]);

  useEffect(() => {
    if (result?.script) {
      setEditableScript(result.script);
    }
  }, [result]);

  const handleGenerate = useCallback(
    async (isBundle = false) => {
      if (!keyword.trim()) {
        toast.warning("Topic Required", "Please enter a topic or select a research angle.");
        return;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      setBundleResult(null);
      setIsSaved(false);

      try {
        const researchSummary = researchContext?.research
          ? {
              summary:
                researchContext.research.executiveSummary ||
                researchContext.research.marketLandscape?.summary ||
                researchContext.research.strategyBlueprint?.concept ||
                "",
              angles: researchContext.research.suggestedAngles?.length
                ? researchContext.research.suggestedAngles
                : researchContext.research.trendingAngles || [],
              hooks: researchContext.research.suggestedHooks?.length
                ? researchContext.research.suggestedHooks
                : (researchContext.research.trendingAngles || []).map((angle) => angle.hookIdea).filter(Boolean),
              recommendedStrategy: researchContext.research.recommendedStrategy || null,
              viralCheck: researchContext.research.viralCheck || null,
              winningPatterns: researchContext.research.winningPatterns || [],
              trendSignals: researchContext.research.trendSignals || [],
              evidence: (researchContext.research.sourceEvidence || []).slice(0, 4),
              topKeywords: (researchContext.topKeywords || []).slice(0, 10).map((k) => k.keyword || k),
            }
          : null;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword,
            format,
            style,
            audience,
            location,
            research: researchSummary,
            bundle: isBundle,
            performanceData,
          }),
        });
        if (!res.ok) {
          const failure = await res.json().catch(() => ({}));
          throw new Error(failure.error || "Generation failed");
        }
        const data = await res.json();
        if (data.bundle) {
          setBundleResult(data.scripts);
          const firstFormat = Object.keys(data.scripts)[0];
          setFormat(firstFormat);
          setResult({ script: data.scripts[firstFormat], metadata: data.metadata });
          toast.success("Strategy Bundle Created", "Multi-format content generated simultaneously.");
        } else {
          setResult(data);
          toast.success("Script Generated", `Successfully formatted for ${format.replace("_", " ")}.`);
        }
      } catch (e) {
        setError(e.message);
        toast.error("Generation Error", e.message);
      } finally {
        setLoading(false);
      }
    },
    [keyword, format, style, audience, location, researchContext, performanceData, toast]
  );

  const handleRefineScript = async (modifier) => {
    if (!editableScript.trim()) return;
    setRefining(true);
    try {
      const prompt = `Refine this content for ${format}. Instruction: ${modifier}.\n\nOriginal Content:\n${editableScript}`;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: prompt.substring(0, 250),
          format,
          style,
          audience,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setEditableScript(data.script);
        setResult((prev) => ({ ...prev, script: data.script }));
        toast.ai("Script Refined", `Applied: "${modifier}"`);
      }
    } catch (e) {
      toast.error("Refine Failed", e.message);
    } finally {
      setRefining(false);
    }
  };

  const handleSave = () => {
    if (!result && !editableScript) return;
    try {
      saveContent({
        keyword,
        format,
        script: editableScript || result?.script,
        originalScript: result?.originalScript || editableScript,
        seo: result?.seo || {},
        editing: result?.editing || {},
        research: researchContext?.research || null,
        metadata: { keyword, format, style, audience, location, researchId: researchContext?.id },
      }, activeAccount.storagePrefix);
      setIsSaved(true);
      toast.success("Saved to Library", "Script is now recorded in your pipeline history.");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error(e);
      toast.error("Save Failed", "Could not persist to storage.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            AI Content &amp; Script Studio
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Formulate high-converting scripts, multi-platform carousels, and complete strategy bundles.
          </p>
        </div>

        {researchContext?.keyword && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 px-3.5 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-xs">
              R&amp;D Context: {researchContext.keyword}
            </span>
          </div>
        )}
      </div>

      {/* Generator Control Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          {/* Main Topic Input */}
          <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Topic or Headline
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. NEP 2020 High School Reforms..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
              {researchContext?.keyword && (
                <Sparkles className="absolute right-3.5 top-3.5 w-4 h-4 text-indigo-500 opacity-60" />
              )}
            </div>
          </div>

          {/* Format Selector */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Content Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Tone of Voice
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer outline-none capitalize"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Parents of 9th-12th Graders"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Generate Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-medium">
            AI generates calibrated hooks, engagement triggers, and hashtags.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || !keyword.trim()}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading
                  ? "bg-indigo-400 text-white cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:scale-[1.02]"
              }`}
            >
              {loading && !bundleResult ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Formulating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Script
                </>
              )}
            </button>

            {researchContext?.research && (
              <button
                onClick={() => handleGenerate(true)}
                disabled={loading || !keyword.trim()}
                className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading && bundleResult ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Bundling...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" /> Full Strategy Bundle
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-3">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Output Workspace */}
      {!result && !loading && (
        <div className="min-h-[380px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <PenTool className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
            Script Studio Workspace
          </h3>
          <p className="text-xs text-slate-400 max-w-sm font-medium mt-1">
            Choose a topic or import from R&amp;D Lab to begin generating high-performing content.
          </p>
        </div>
      )}

      {loading && (
        <div className="min-h-[380px] flex flex-col items-center justify-center text-center p-12 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
            <Bot className="w-7 h-7" />
          </div>
          <h4 className="text-base font-black text-slate-800 dark:text-slate-200">
            Writing &amp; Calibrating Content...
          </h4>
          <p className="text-xs text-slate-400 font-semibold">
            Analyzing platform algorithms, formatting hooks, and structuring CTAs...
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Workspace Tabs & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
              {[
                { id: "script", label: "Script Editor", icon: FileText },
                { id: "preview", label: "Visual Mockup", icon: Eye },
                { id: "seo", label: "SEO & Hooks", icon: Tag },
                { id: "audit", label: "AI Quality Audit", icon: Edit3 },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    tab === t.id
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Bundle formats tabs if bundle was generated */}
            {bundleResult && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {Object.keys(bundleResult).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormat(f);
                      setEditableScript(bundleResult[f]);
                      setResult((prev) => ({ ...prev, script: bundleResult[f] }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                      format === f
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {FORMATS.find((x) => x.id === f)?.label || f}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(editableScript || result.script || "");
                  toast.success("Copied to Clipboard", "Script text copied successfully.");
                }}
                title="Copy Script"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={isSaved}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>

              {onSchedulePost && (
                <button
                  onClick={() => onSchedulePost(editableScript || result.script)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Post Composer</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Script Editor + Quick AI Prompt Modifiers */}
          {tab === "script" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              {/* Quick AI Modifiers */}
              <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> AI Refinements:
                </span>
                {[
                  { label: "🔥 Viral Hook", prompt: "Rewrite the opening hook to be 10x more captivating and emotionally urgent" },
                  { label: "⚡ Make Punchier (30s)", prompt: "Condense and trim fluff, make it fast-paced for a 30-second reel" },
                  { label: "💡 Stronger CTA", prompt: "Add a clear, high-converting call to action for students and parents" },
                  { label: "🗣️ Hinglish Tone", prompt: "Adapt the language into natural urban Hinglish popular among youth in India" },
                  { label: "📊 Add Data & Proof", prompt: "Integrate educational facts and statistics into the talking points" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleRefineScript(chip.prompt)}
                    disabled={refining}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {chip.label}
                  </button>
                ))}
                {refining && <Loader2 className="w-4 h-4 animate-spin text-indigo-600 ml-2" />}
              </div>

              {/* Editable Script Textarea */}
              <div className="relative">
                <textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  rows={14}
                  className="w-full p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 custom-scroll selection:bg-indigo-100"
                />
              </div>

              {/* Footer status */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-2">
                <span>Characters: {editableScript.length} | Words: {editableScript.split(/\s+/).filter(Boolean).length}</span>
                <span>Estimated reading/speaking time: ~{Math.ceil(editableScript.split(/\s+/).filter(Boolean).length / 2.5)}s</span>
              </div>
            </div>
          )}

          {/* Tab 2: Visual Mockup Preview */}
          {tab === "preview" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <SocialPreview
                scriptText={editableScript || result.script}
                format={format}
                authorName="Skillizee"
                authorHandle="@skillizee.io"
              />
            </div>
          )}

          {/* Tab 3: SEO & Hashtag Breakdown */}
          {tab === "seo" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8">
              {/* High-CTR Alternative Hooks */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" /> High-CTR Hooks &amp; Headlines
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.seo?.titles?.map((t, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.strategy}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-lg shrink-0">
                        {t.ctrScore}% CTR
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tag Cloud */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-500" /> Trending Hashtags
                  </h4>
                  <button
                    onClick={() => {
                      const allTags = [
                        ...(result.seo?.tags?.primary || []),
                        ...(result.seo?.tags?.secondary || []),
                      ]
                        .map((t) => t.tag || t)
                        .join(" ");
                      navigator.clipboard.writeText(allTags);
                      toast.success("Tags Copied", "Hashtag list copied to clipboard.");
                    }}
                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    Copy All Hashtags
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.seo?.tags?.primary?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
                    >
                      <Flame className="w-3 h-3 text-amber-500" />
                      {tag.tag || tag}
                    </span>
                  ))}
                  {result.seo?.tags?.secondary?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {tag.tag || tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI Quality Audit */}
          {tab === "audit" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["Hook Quality", result.editing?.hookScore || 92],
                  ["Platform Fit", result.editing?.platformFit || 94],
                  ["Content Match", result.editing?.contentTypeMatch || 88],
                  ["Overall Score", result.editing?.overallScore || 91],
                ].map(([label, score]) => (
                  <div
                    key={label}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-center"
                  >
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{score}%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {result.editing?.optimizationSummary?.length && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Optimization Breakdown
                  </h4>
                  <div className="space-y-2">
                    {result.editing.optimizationSummary.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
