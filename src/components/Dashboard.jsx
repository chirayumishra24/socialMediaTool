"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Compass,
  Eye,
  Flame,
  Layers3,
  Microscope,
  MoveRight,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import MorningBriefing from "./MorningBriefing";
import { useContentHistory, usePerformanceInsights, useResearchHistory, useSettingsSnapshot, useStats } from "@/lib/storage";

const FALLBACK_SIGNALS = [
  "Parent trust content is outperforming generic school promotion.",
  "Short-form explainers keep winning when tied to a local policy or pain point.",
  "Approval-stage bottlenecks are more visible than creation bottlenecks.",
  "Topics with clearer hooks convert into scripts faster than broad institution posts.",
];

const STATUS_STYLES = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  published: "bg-primary/10 text-primary border-primary/20",
};

export default function Dashboard({ onNavigate, onStartResearch, onGoToStudio }) {
  const stats = useStats();
  const settings = useSettingsSnapshot();
  const researchHistory = useResearchHistory();
  const contentHistory = useContentHistory();
  const performance = usePerformanceInsights();
  const [activeSignal, setActiveSignal] = useState(0);

  const latestContent = useMemo(() => contentHistory.slice(0, 3), [contentHistory]);

  const signalFeed = useMemo(() => {
    const dynamicSignals = researchHistory
      .slice(0, 6)
      .map((item) => item.research?.recommendedStrategy?.bestAngle || item.research?.executiveSummary || item.keyword)
      .filter(Boolean);

    return dynamicSignals.length ? dynamicSignals : FALLBACK_SIGNALS;
  }, [researchHistory]);

  const priorityQueue = useMemo(() => {
    return researchHistory
      .filter((item) => (item.status || "pending") !== "published")
      .slice(0, 4);
  }, [researchHistory]);

  const topContent = performance.topContent.slice(0, 3);
  const platformPerformance = [...performance.platformPerformance]
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 3);

  useEffect(() => {
    if (signalFeed.length <= 1) return undefined;
    const interval = setInterval(() => {
      setActiveSignal((current) => (current + 1) % signalFeed.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [signalFeed]);

  return (
    <div className="p-6 lg:p-10 xl:p-12 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 rounded-[3rem] grad-primary p-8 lg:p-10 xl:p-12 overflow-hidden relative shadow-[0_30px_90px_-40px_rgba(10,37,64,0.75)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.24),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_24%),linear-gradient(180deg,transparent,rgba(255,255,255,0.03))]" />
          <div className="absolute -top-20 right-[-4rem] h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="absolute bottom-[-6rem] left-[35%] h-56 w-56 rounded-full border border-white/10 bg-amber-300/10 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-5 max-w-3xl">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Executive Hub
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-[-0.05em] leading-[0.96] text-white">
                    {settings.schoolName}
                    <span className="block text-white/72">Institutional intelligence, staged for action.</span>
                  </h1>
                  <p className="max-w-2xl text-sm md:text-base text-white/72 leading-relaxed font-medium">
                    {settings.schoolVision}. The hub is showing live research momentum, production pressure, and performance signals so leadership can decide what to publish next.
                  </p>
                </div>
              </div>

              <div className="min-w-[240px] max-w-[280px] rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Signal Radar</p>
                    <p className="mt-2 text-sm font-bold text-white">Attention is shifting toward clarity and trust.</p>
                  </div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
                    <Radar className="h-6 w-6 text-amber-300" />
                    <span className="absolute inset-1 rounded-[1rem] border border-white/10" />
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <MiniData label="Open cycles" value={stats.totalResearch} />
                  <MiniData label="Awaiting review" value={stats.pendingApproval} />
                  <MiniData label="Live outputs" value={stats.totalContent} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="rounded-[2.25rem] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Live Command Signal</p>
                    <p className="mt-3 text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                      {signalFeed[activeSignal]}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    {signalFeed.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === activeSignal ? "w-8 bg-amber-300" : "w-1.5 bg-white/30"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ActionTile
                  icon={Microscope}
                  eyebrow="Research"
                  label="Run R&D"
                  description="Open the lab and investigate a new topic."
                  onClick={() => onNavigate("research")}
                  tone="light"
                />
                <ActionTile
                  icon={Video}
                  eyebrow="Production"
                  label="Open Studio"
                  description="Turn a signal into a script immediately."
                  onClick={() => onNavigate("studio")}
                  tone="accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-[3rem] bg-white border border-border p-6 shadow-premium relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,134,11,0.08),transparent)]" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-txt-muted">Leadership Pulse</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-txt">Operational Snapshot</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CommandMetric icon={Compass} label="R&D Cycles" value={stats.totalResearch} detail="Signals explored" />
                <CommandMetric icon={Clock3} label="Pending Board" value={stats.pendingApproval} detail="Needs admin review" />
                <CommandMetric icon={CheckCircle2} label="Approved" value={stats.approved} detail="Ready for execution" />
                <CommandMetric icon={TrendingUp} label="Tracked Views" value={formatNumber(stats.totalViews)} detail="Observed performance" />
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] bg-[#111F2D] text-white p-6 shadow-[0_24px_60px_-32px_rgba(10,37,64,0.75)] relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">Production Pressure</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">Move the next best topic into script.</p>
                </div>
                <CircleDashed className="h-5 w-5 text-amber-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DarkStat label="Studio Outputs" value={stats.totalContent} />
                <DarkStat label="Tracked Clicks" value={stats.totalClicks} />
              </div>
              <button
                onClick={() => onNavigate("approval")}
                className="w-full rounded-[1.4rem] border border-white/10 bg-white/8 px-5 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white flex items-center justify-center gap-2 hover:bg-white/12 cursor-pointer"
              >
                Open Approval Board
                <MoveRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:items-stretch">
        <div className="xl:col-span-4 h-full">
          <MorningBriefing onStartResearch={onStartResearch} onGoToStudio={onGoToStudio} />
        </div>

        <div className="xl:col-span-4 h-full rounded-[3rem] bg-white border border-border p-6 shadow-premium flex flex-col">
          <div className="flex items-center justify-between gap-4 min-h-[5.5rem]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-txt-muted">Priority Queue</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-txt">What leadership should move next</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4">
            {priorityQueue.length > 0 ? (
              priorityQueue.map((item) => {
                const stage = item.status || "pending";
                return (
                  <button
                    key={item.id}
                    onClick={() => onStartResearch(item.keyword)}
                    className="w-full text-left rounded-[2rem] border border-border bg-bg-card p-5 hover:border-primary/20 hover:shadow-premium transition-all cursor-pointer min-h-[12rem] flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-4 flex-1">
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${STATUS_STYLES[stage] || STATUS_STYLES.pending}`}>
                            {stage}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">
                            {item.depth || "deep"} cycle
                          </span>
                        </div>
                        <p className="text-base font-black tracking-tight text-txt leading-snug">{item.keyword}</p>
                        <p className="text-sm text-txt-secondary leading-relaxed line-clamp-3">
                          {item.research?.executiveSummary || item.research?.marketLandscape?.summary || "Open this topic to continue the analysis and sharpen the angle."}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-txt-muted shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyPanel
                icon={Microscope}
                title="No live queue yet"
                description="Run the first R&D cycle to populate the executive queue."
                actionLabel="Start Research"
                onClick={() => onNavigate("research")}
              />
            )}
          </div>
        </div>

        <div className="xl:col-span-4 h-full rounded-[3rem] bg-white border border-border p-6 shadow-premium flex flex-col">
          <div className="flex items-center justify-between gap-4 min-h-[5.5rem]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-txt-muted">Performance Pulse</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-txt">Where traction is already showing</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex-1 flex flex-col gap-6">
          <div className="rounded-[2rem] grad-primary p-5 text-white space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Average CTR</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{performance.totals.avgCtr}%</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-amber-300" />
              </div>
            </div>
            <p className="text-sm text-white/72 leading-relaxed">
              Use this panel to spot which formats and live posts are already proving audience fit.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">Top Performing Content</p>
            {topContent.length > 0 ? (
              topContent.map((item) => (
                <PerformanceRow
                  key={item.id}
                  title={item.keyword}
                  meta={item.format.replaceAll("_", " ")}
                  value={`${formatNumber(item.clicks)} clicks`}
                  subvalue={`${formatNumber(item.views)} views`}
                />
              ))
            ) : (
              <EmptyInline text="Tracked content will appear here after publishing starts." />
            )}
          </div>

          <div className="space-y-3 mt-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">Platform Click Share</p>
            {platformPerformance.length > 0 ? (
              platformPerformance.map((item, index) => (
                <PerformanceRow
                  key={`${item.platform}-${index}`}
                  title={capitalize(item.platform)}
                  meta="Platform performance"
                  value={`${formatNumber(item.totalClicks)} clicks`}
                />
              ))
            ) : (
              <EmptyInline text="Platform ranking activates once live posts accumulate metrics." />
            )}
          </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 rounded-[3rem] bg-white border border-border p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-txt-muted">Studio Momentum</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-txt">Most recent production outputs</h3>
            </div>
            <button
              onClick={() => onNavigate("studio")}
              className="rounded-full border border-border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-txt hover:border-primary/20 hover:text-primary cursor-pointer"
            >
              Open Studio
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestContent.length > 0 ? (
              latestContent.map((item) => (
                <div key={item.id} className="rounded-[2rem] border border-border bg-bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-primary/6 text-primary flex items-center justify-center">
                      <Video className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">
                      {item.format.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-black tracking-tight text-txt leading-snug">{item.keyword}</p>
                    <p className="text-sm text-txt-secondary leading-relaxed line-clamp-3">
                      {item.script || "Script draft saved in the studio."}
                    </p>
                  </div>
                  <button
                    onClick={() => onGoToStudio({ keyword: item.keyword, research: item.research || null, format: item.format })}
                    className="w-full rounded-[1.3rem] bg-primary text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-primary-hover cursor-pointer"
                  >
                    Continue Draft
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="md:col-span-3">
                <EmptyPanel
                  icon={Video}
                  title="No studio drafts yet"
                  description="Generated scripts will surface here for faster executive review."
                  actionLabel="Create First Draft"
                  onClick={() => onNavigate("studio")}
                />
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-5 rounded-[3rem] bg-white border border-border p-6 shadow-premium space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-txt-muted">Decision Shortcuts</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-txt">Move from signal to action faster</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            <ShortcutCard
              icon={Microscope}
              title="Launch a fresh research cycle"
              description="Use the R&D Lab when leadership wants a topic-specific angle, not a generic content idea."
              actionLabel="Open R&D Lab"
              onClick={() => onNavigate("research")}
            />
            <ShortcutCard
              icon={CalendarClock}
              title="Review the publishing pipeline"
              description="Check which topics are stuck in approval, and which ones are already ready for execution."
              actionLabel="Open Scheduler"
              onClick={() => onNavigate("calendar")}
            />
            <ShortcutCard
              icon={Eye}
              title="Inspect measurable impact"
              description="Jump into analytics to see which formats and tags are building real traction."
              actionLabel="Open Impact Stats"
              onClick={() => onNavigate("analytics")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionTile({ icon: Icon, eyebrow, label, description, onClick, tone = "light" }) {
  const toneClass = tone === "accent"
    ? "border-amber-200/40 bg-amber-300/14 text-white"
    : "border-white/10 bg-white/8 text-white";

  return (
    <button
      onClick={onClick}
      className={`rounded-[2rem] border p-5 text-left backdrop-blur-md hover:bg-white/12 cursor-pointer ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-white/55" />
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">{eyebrow}</p>
      <p className="mt-2 text-base font-black tracking-tight">{label}</p>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{description}</p>
    </button>
  );
}

function CommandMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-[2rem] border border-border bg-bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-black tracking-tight text-txt">{value}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">{label}</p>
        <p className="mt-1 text-sm text-txt-secondary font-medium">{detail}</p>
      </div>
    </div>
  );
}

function MiniData({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function DarkStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function PerformanceRow({ title, meta, value, subvalue }) {
  return (
    <div className="rounded-[1.7rem] border border-border bg-bg-card p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-black tracking-tight text-txt truncate">{title}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-txt-muted">{meta}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-txt">{value}</p>
        {subvalue ? <p className="mt-1 text-[10px] font-bold text-txt-muted">{subvalue}</p> : null}
      </div>
    </div>
  );
}

function ShortcutCard({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[2rem] border border-border bg-bg-card p-5 text-left hover:border-primary/20 hover:shadow-premium transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0">
          <div className="h-11 w-11 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-black tracking-tight text-txt">{title}</p>
            <p className="mt-2 text-sm text-txt-secondary leading-relaxed">{description}</p>
          </div>
        </div>
        <MoveRight className="h-4 w-4 text-txt-muted shrink-0 mt-1" />
      </div>
      <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
        {actionLabel}
      </div>
    </button>
  );
}

function EmptyPanel({ icon: Icon, title, description, actionLabel, onClick }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-bg-card p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-lg font-black tracking-tight text-txt">{title}</p>
      <p className="mt-2 text-sm text-txt-secondary leading-relaxed max-w-md mx-auto">{description}</p>
      <button
        onClick={onClick}
        className="mt-5 rounded-[1.2rem] bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-primary-hover cursor-pointer"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyInline({ text }) {
  return (
    <div className="rounded-[1.7rem] border border-dashed border-border bg-bg-card px-4 py-5 text-sm text-txt-muted font-medium">
      {text}
    </div>
  );
}

function formatNumber(value) {
  const numeric = Number(value || 0);
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1)}K`;
  return String(numeric);
}

function capitalize(value) {
  return String(value || "unknown").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
