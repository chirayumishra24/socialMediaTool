"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  Check,
  Sparkles,
  Loader2,
  Film,
  Images,
  Image as ImageIcon,
  BookOpen,
  TrendingUp,
  Target,
  Hash,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
  X,
} from "lucide-react";
import { useContentHistory } from "@/lib/storage";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FORMAT_ICONS = {
  Reel: Film,
  Carousel: Images,
  Static: ImageIcon,
  Story: BookOpen,
};

const FORMAT_COLORS = {
  Reel: "bg-purple-50 border-purple-200 text-purple-700",
  Carousel: "bg-blue-50 border-blue-200 text-blue-700",
  Static: "bg-amber-50 border-amber-200 text-amber-700",
  Story: "bg-pink-50 border-pink-200 text-pink-700",
};

export default function ContentCalendar({ onSelectPost }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [metaScheduled, setMetaScheduled] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiCalendar, setAiCalendar] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(null);
  const items = useContentHistory();

  const fetchMetaScheduled = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meta/schedule");
      const data = await res.json();
      if (data.posts) {
        setMetaScheduled(data.posts);
      }
    } catch (err) {
      console.warn("Failed to fetch scheduled posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cached AI calendar on mount
  useEffect(() => {
    fetchMetaScheduled();
    fetch("/api/meta/calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.calendar) setAiCalendar(data.calendar);
      })
      .catch(() => {});
  }, [fetchMetaScheduled]);

  const handleGenerateCalendar = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/meta/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: "Education / EdTech",
          goals: ["Grow followers", "Increase engagement", "Drive traffic"],
        }),
      });
      const data = await res.json();
      if (data.success && data.calendar) {
        setAiCalendar(data.calendar);
        setShowInsights(true);
      }
    } catch (err) {
      console.error("Calendar generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyToScheduler = async (entry) => {
    if (!entry) return;
    setScheduleLoading(entry.date);
    try {
      const scheduledAt = new Date(`${entry.date}T${entry.slot || "12:00"}:00`);
      await fetch("/api/meta/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: entry.caption || `${entry.topic}\n\n${(entry.hashtags || []).join(" ")}`,
          platforms: ["instagram"],
          scheduledAt: scheduledAt.toISOString(),
        }),
      });
      await fetchMetaScheduled();
      setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to schedule:", err);
    } finally {
      setScheduleLoading(null);
    }
  };

  // Combine all items: local drafts + meta scheduled + AI calendar entries
  const allScheduledItems = useMemo(() => {
    const local = items.map((item) => ({
      id: item.id,
      title: item.keyword || "Untitled draft",
      format: item.format,
      type: "local",
      scheduledDate: item.metadata?.scheduledDate || item.savedAt?.slice(0, 10),
      status: item.status || "draft",
      platforms: item.metadata?.platforms || [],
    }));

    const meta = metaScheduled.map((post) => ({
      id: post.id,
      title: post.caption.substring(0, 40) + (post.caption.length > 40 ? "..." : ""),
      format: post.platforms.join(" + "),
      type: "meta",
      scheduledDate: post.scheduledAt?.slice(0, 10),
      status: post.status,
      platforms: post.platforms,
      fullPost: post,
    }));

    const ai = (aiCalendar?.calendar || []).map((entry, i) => ({
      id: `ai_${entry.date}_${i}`,
      title: entry.topic || "AI Suggestion",
      format: entry.format,
      type: "ai",
      scheduledDate: entry.date,
      status: "suggestion",
      slot: entry.slot,
      aiEntry: entry,
    }));

    return [...local, ...meta, ...ai];
  }, [items, metaScheduled, aiCalendar]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayIndex };
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = new Date();

  const { daysInMonth, firstDayIndex } = getDaysInMonth(currentDate);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const insights = aiCalendar?.insights;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[2rem] bg-white border border-border p-5 shadow-sm">
        <div>
          <h3 className="text-xl font-black tracking-tight text-txt flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> AI Content Planner
          </h3>
          <p className="mt-1 text-sm text-txt-muted font-medium">
            Data-driven calendar powered by your Meta insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateCalendar}
            disabled={generating}
            className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Analyzing..." : "Generate AI Calendar"}
          </button>
          <button
            onClick={fetchMetaScheduled}
            disabled={loading}
            className="p-2.5 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 text-txt-muted ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all">
              <ChevronLeft className="w-4 h-4 text-txt-muted" />
            </button>
            <span className="text-sm font-black text-txt w-36 text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all">
              <ChevronRight className="w-4 h-4 text-txt-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      {insights && (
        <div className="rounded-[2rem] bg-white border border-border shadow-sm overflow-hidden">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-txt">AI Insights Summary</h4>
                <p className="text-[11px] text-txt-muted font-medium mt-0.5">
                  {insights.formatInsight || `Best format: ${insights.bestFormat}`}
                </p>
              </div>
            </div>
            {showInsights ? <ChevronUp className="w-4 h-4 text-txt-muted" /> : <ChevronDown className="w-4 h-4 text-txt-muted" />}
          </button>

          {showInsights && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border pt-5">
              {/* Best Format */}
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-violet-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-violet-600">Best Format</span>
                </div>
                <p className="text-lg font-black text-violet-800">{insights.bestFormat}</p>
                <p className="text-[10px] text-violet-500 mt-1">Highest avg reach in your data</p>
              </div>

              {/* Best Times */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Best Times</span>
                </div>
                <p className="text-sm font-bold text-blue-800">
                  {(insights.bestPostingHours || []).map((h) => `${h}:00`).join(", ")}
                </p>
                <p className="text-[10px] text-blue-500 mt-1">{insights.audiencePeak || "Peak activity hours"}</p>
              </div>

              {/* Trending Topics */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Topics</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(insights.trendingTopics || []).slice(0, 3).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700">{t}</span>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-orange-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-600">Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(insights.hashtagsToUse || []).slice(0, 5).map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded-lg bg-orange-100 text-[10px] font-bold text-orange-700">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Distribution */}
      {aiCalendar?.formatDistribution && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(aiCalendar.formatDistribution).map(([format, data]) => {
            const FormatIcon = FORMAT_ICONS[format.charAt(0).toUpperCase() + format.slice(1)] || Film;
            return (
              <div key={format} className="rounded-2xl bg-white border border-border p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FormatIcon className="w-4 h-4 text-txt-muted" />
                  <span className="text-xs font-black capitalize text-txt">{format}</span>
                  <span className="ml-auto text-lg font-black text-primary">{data.count}x</span>
                </div>
                <p className="text-[10px] text-txt-muted leading-relaxed">{data.reasoning}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="rounded-[2rem] border border-border bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-bg-elevated/30">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-txt-muted border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[140px]">
          {blanks.map((i) => (
            <div key={`blank-${i}`} className="border-r border-b border-border bg-bg-card/20" />
          ))}

          {days.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            const itemsToday = allScheduledItems.filter((item) => item.scheduledDate === dateStr);

            return (
              <div key={day} className={`p-2 border-r border-b border-border relative group ${isToday ? "bg-primary/5" : "bg-white"}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-black ${isToday ? "w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center animate-pulse" : "text-txt-muted"}`}>
                    {day}
                  </span>
                  {onSelectPost && (
                    <button
                      onClick={() => onSelectPost({ scheduledDate: dateStr })}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 hover:bg-slate-200 transition-opacity cursor-pointer"
                      title="Schedule post on this day"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                    </button>
                  )}
                </div>

                <div className="mt-1.5 space-y-1 max-h-[96px] overflow-y-auto custom-scroll pr-1">
                  {itemsToday.map((item) => {
                    const isAi = item.type === "ai";
                    const isMeta = item.type === "meta";
                    const isPublished = item.status === "published";
                    const isFailed = item.status === "failed";

                    // AI calendar entries get format-specific colors
                    if (isAi) {
                      const FormatIcon = FORMAT_ICONS[item.format] || Film;
                      const colorClass = FORMAT_COLORS[item.format] || FORMAT_COLORS.Reel;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEntry(item.aiEntry)}
                          className={`p-1.5 rounded-lg border text-[9px] font-bold ${colorClass} cursor-pointer hover:shadow-md transition-all group/ai relative`}
                          title={`${item.format}: ${item.title}`}
                        >
                          <div className="truncate flex items-center gap-1">
                            <FormatIcon className="w-2.5 h-2.5 shrink-0" />
                            {item.title}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between opacity-80">
                            <span>{item.slot || ""}</span>
                            <span className="text-[7px] font-black bg-white/50 px-1 rounded">AI</span>
                          </div>
                        </div>
                      );
                    }

                    // Meta and local items
                    let badgeColor = "bg-primary/10 border-primary/20 text-primary";
                    if (isMeta) {
                      if (isPublished) badgeColor = "bg-emerald-50 border-emerald-200 text-emerald-700";
                      else if (isFailed) badgeColor = "bg-rose-50 border-rose-200 text-rose-700";
                      else badgeColor = "bg-indigo-50 border-indigo-200 text-indigo-700";
                    } else if (item.status === "approved") {
                      badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectPost && onSelectPost(item)}
                        className={`p-1.5 rounded-lg border text-[9px] font-bold ${badgeColor} cursor-pointer hover:shadow-sm transition-all`}
                        title={`${item.title} (${item.status})`}
                      >
                        <div className="truncate flex items-center gap-1">
                          {isMeta && (isPublished ? <Check className="w-2 h-2 shrink-0" /> : <Clock className="w-2 h-2 shrink-0" />)}
                          {item.title}
                        </div>
                        <div className="mt-0.5 uppercase opacity-80 flex items-center justify-between">
                          <span>{item.format?.replace(/_/g, " ")}</span>
                          <span className="text-[7px] font-black">{isMeta ? "Queued" : "Draft"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedEntry(null)}>
          <div
            className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl p-6 space-y-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const FormatIcon = FORMAT_ICONS[selectedEntry.format] || Film;
                  return (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${FORMAT_COLORS[selectedEntry.format] || "bg-violet-50 text-violet-700"}`}>
                      <FormatIcon className="w-5 h-5" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-base font-black text-txt">{selectedEntry.topic}</h3>
                  <p className="text-[11px] text-txt-muted font-semibold">
                    {selectedEntry.day} {selectedEntry.date} at {selectedEntry.slot}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-txt-muted" />
              </button>
            </div>

            {/* Hook */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 mb-1.5">Hook</p>
              <p className="text-sm font-bold text-violet-800">{selectedEntry.hook}</p>
            </div>

            {/* Caption */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1.5">Caption</p>
              <p className="text-xs text-txt leading-relaxed whitespace-pre-line">{selectedEntry.caption}</p>
            </div>

            {/* Hashtags */}
            {selectedEntry.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedEntry.hashtags.map((h) => (
                  <span key={h} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-txt-muted">{h}</span>
                ))}
              </div>
            )}

            {/* Reasoning */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1.5">Why This Post</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">{selectedEntry.reasoning}</p>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-txt-muted font-bold">Est. Reach</p>
                  <p className="text-sm font-black text-txt">{(selectedEntry.estimatedReach || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-txt-muted font-bold">Pillar</p>
                  <p className="text-xs font-bold text-txt">{selectedEntry.pillar}</p>
                </div>
              </div>
              <button
                onClick={() => handleApplyToScheduler(selectedEntry)}
                disabled={scheduleLoading === selectedEntry.date}
                className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {scheduleLoading === selectedEntry.date ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Apply to Scheduler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
