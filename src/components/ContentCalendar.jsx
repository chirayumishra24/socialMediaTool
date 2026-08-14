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
  Bookmark,
  Edit3,
  FlaskConical,
  FileText,
  Save,
  LayoutGrid,
  List,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useContentHistory, saveStrategy, setClientActiveCalendar, getClientActiveStrategy, checkStrategyCalendarAlignment } from "@/lib/storage";

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
  Story: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const FORMAT_BADGE_COLORS = {
  Reel: "from-purple-500 to-indigo-600",
  Carousel: "from-blue-500 to-cyan-600",
  Static: "from-amber-500 to-orange-600",
  Story: "from-emerald-500 to-teal-600",
};

// ─── Helper: format date for display ───────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ContentCalendar({ onSelectPost, onStartResearch }) {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAiModal, setShowAiModal] = useState(false);
  const [metaScheduled, setMetaScheduled] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiCalendar, setAiCalendar] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedMetaPost, setSelectedMetaPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [viewMode, setViewMode] = useState("monthly"); // "weekly" | "monthly"
  const [niche, setNiche] = useState("Education / EdTech");
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const items = useContentHistory();

  const activeStrategy = useMemo(() => getClientActiveStrategy(), [aiCalendar]);
  const alignment = useMemo(() => checkStrategyCalendarAlignment(activeStrategy, aiCalendar), [activeStrategy, aiCalendar]);

  // ─── Save Strategy ─────────────────────────────────────────────
  const handleSaveCalendarStrategy = () => {
    if (!aiCalendar) return;
    try {
      saveStrategy({
        id: `strategy_${Date.now()}`,
        niche: niche || "General",
        savedAt: new Date().toISOString(),
        type: "AI Calendar Strategy",
        insights: aiCalendar.insights,
        calendarCount: (aiCalendar.calendar || []).length,
        calendar: aiCalendar.calendar || [],
        formatDistribution: aiCalendar.formatDistribution || {},
        rangeStart: aiCalendar.rangeStart || "",
        rangeEnd: aiCalendar.rangeEnd || "",
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (e) {
      console.error("Failed to save calendar strategy:", e);
    }
  };

  // ─── Fetch meta-scheduled posts ────────────────────────────────
  const fetchMetaScheduled = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meta/schedule");
      const data = await res.json();
      if (data.posts) setMetaScheduled(data.posts);
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
        if (data.calendar) {
          setAiCalendar(data.calendar);
          setClientActiveCalendar(data.calendar);
        }
      })
      .catch(() => {});

    // Load edits from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("skilizee_calendar_edits") || "{}");
      if (saved && Object.keys(saved).length > 0) {
        setCalendarEdits(saved);
      }
    } catch {}
  }, [fetchMetaScheduled]);

  const [calendarEdits, setCalendarEdits] = useState({});

  // ─── Compute date range for generation ─────────────────────────
  const getGenerationRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "monthly") {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: toDateStr(start), endDate: toDateStr(end) };
    } else {
      // Weekly: find the Monday of the week containing currentDate
      const day = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (day === 0 ? 6 : day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { startDate: toDateStr(monday), endDate: toDateStr(sunday) };
    }
  };

  // ─── Generate AI Calendar ──────────────────────────────────────
  const handleGenerateCalendar = async () => {
    setGenerating(true);
    try {
      const range = getGenerationRange();
      const res = await fetch("/api/meta/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          goals: ["Grow followers", "Increase engagement", "Drive traffic"],
          startDate: range.startDate,
          endDate: range.endDate,
          postsPerWeek,
        }),
      });
      const data = await res.json();
      if (data.success && data.calendar) {
        setAiCalendar(data.calendar);
        setClientActiveCalendar(data.calendar);
        setShowInsights(true);
        setCalendarEdits({});
        localStorage.removeItem("skilizee_calendar_edits");
      }
    } catch (err) {
      console.error("Calendar generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  // ─── Apply to Scheduler ────────────────────────────────────────
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

  // ─── Delete Meta Scheduled Post ────────────────────────────────
  const handleDeleteScheduledPost = async (postId) => {
    if (!postId) return;
    setDeleteLoading(postId);
    try {
      const res = await fetch(`/api/meta/schedule?id=${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMetaScheduled((prev) => prev.filter((p) => p.id !== postId));
        setSelectedMetaPost(null);
        setConfirmDeleteId(null);
        toast.success("Broadcast Cancelled", "Scheduled post removed from Meta queue.");
      } else {
        toast.error("Delete Failed", "Could not delete scheduled post from server.");
      }
    } catch (err) {
      console.error("Failed to delete scheduled post:", err);
      toast.error("Network Error", err.message || "Failed to cancel scheduled post.");
    } finally {
      setDeleteLoading(null);
    }
  };

  // ─── Delete AI Entry from Calendar ─────────────────────────────
  const handleDeleteAiEntry = (entry) => {
    if (!entry || !aiCalendar?.calendar) return;
    const key = `${entry.date}_${entry.topic?.slice(0, 20)}`;
    const filtered = aiCalendar.calendar.filter((e) => {
      const eKey = `${e.date}_${e.topic?.slice(0, 20)}`;
      return eKey !== key;
    });
    const updatedCal = { ...aiCalendar, calendar: filtered };
    setAiCalendar(updatedCal);
    setClientActiveCalendar(updatedCal);
    setSelectedEntry(null);
    toast.info("Idea Discarded", "Calendar entry was removed.");
  };

  // ─── Save edited entry ─────────────────────────────────────────
  const handleSaveEdit = (edited) => {
    if (!edited?.date) return;
    const key = `${edited.date}_${edited.topic?.slice(0, 20)}`;
    const newEdits = { ...calendarEdits, [key]: edited };
    setCalendarEdits(newEdits);
    localStorage.setItem("skilizee_calendar_edits", JSON.stringify(newEdits));

    // Update in aiCalendar state too
    if (aiCalendar?.calendar) {
      const updatedCal = aiCalendar.calendar.map((e) => {
        const eKey = `${e.date}_${e.topic?.slice(0, 20)}`;
        return eKey === key ? { ...e, ...edited } : e;
      });
      setAiCalendar({ ...aiCalendar, calendar: updatedCal });
    }

    setEditingEntry(null);
    setSelectedEntry(edited);
  };

  // ─── Get entry with edits applied ──────────────────────────────
  const getEditedEntry = (entry) => {
    const key = `${entry.date}_${entry.topic?.slice(0, 20)}`;
    return calendarEdits[key] ? { ...entry, ...calendarEdits[key] } : entry;
  };

  // ─── Combine all calendar items ────────────────────────────────
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

    const ai = (aiCalendar?.calendar || []).map((entry, i) => {
      const edited = getEditedEntry(entry);
      return {
        id: `ai_${edited.date}_${i}`,
        title: edited.topic || "AI Suggestion",
        format: edited.format,
        type: "ai",
        scheduledDate: edited.date,
        status: "suggestion",
        slot: edited.slot,
        description: edited.description || "",
        aiEntry: edited,
      };
    });

    return [...local, ...meta, ...ai];
  }, [items, metaScheduled, aiCalendar, calendarEdits]);

  // ─── Month grid helpers ────────────────────────────────────────
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayIndex };
  };

  const prevPeriod = () => {
    if (viewMode === "monthly") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === "monthly") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const today = new Date();
  const todayStr = toDateStr(today);

  // ─── Week view helpers ─────────────────────────────────────────
  const getWeekDays = () => {
    const day = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const { daysInMonth, firstDayIndex } = getDaysInMonth(currentDate);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const insights = aiCalendar?.insights;
  const range = getGenerationRange();

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[2rem] bg-white border border-border p-5 shadow-sm">
        <div>
          <h3 className="text-xl font-black tracking-tight text-txt flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> AI Content Planner
          </h3>
          <p className="mt-1 text-sm text-txt-muted font-medium">
            Data-driven calendar powered by your Meta insights
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-bg-elevated rounded-xl border border-border p-0.5">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-txt-muted hover:text-txt"
              }`}
            >
              <List className="w-3 h-3 inline mr-1" />Weekly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-txt-muted hover:text-txt"
              }`}
            >
              <LayoutGrid className="w-3 h-3 inline mr-1" />Monthly
            </button>
          </div>

          {/* Niche Input */}
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt w-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Niche..."
          />

          {/* Posts per week */}
          <select
            value={postsPerWeek}
            onChange={(e) => setPostsPerWeek(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {[3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n} posts/week</option>
            ))}
          </select>

          {/* Generate Button */}
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
            {generating ? "Analyzing..." : `Generate ${viewMode === "monthly" ? "Monthly" : "Weekly"} Calendar`}
          </button>

          <button
            onClick={fetchMetaScheduled}
            disabled={loading}
            className="p-2.5 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-4 h-4 text-txt-muted ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Period Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={prevPeriod} className="p-2 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all">
              <ChevronLeft className="w-4 h-4 text-txt-muted" />
            </button>
            <span className="text-sm font-black text-txt w-36 text-center">
              {viewMode === "monthly"
                ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : `${fmtDate(range.startDate)} — ${fmtDate(range.endDate)}`}
            </span>
            <button onClick={nextPeriod} className="p-2 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all">
              <ChevronRight className="w-4 h-4 text-txt-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Insights Panel ═══ */}
      {insights && (
        <div className="rounded-[2rem] bg-white border border-border shadow-sm overflow-hidden">
          <div
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-txt">AI Insights Summary</h4>
                  {activeStrategy && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${
                      alignment.aligned 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>
                      {alignment.aligned ? "✓ Strategy Aligned" : "⚠️ Strategy Mismatch"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-txt-muted font-medium mt-0.5">
                  {insights.formatInsight || `Best format: ${insights.bestFormat}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveCalendarStrategy();
                }}
                className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {savedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                {savedToast ? "Strategy Saved!" : "Save Strategy"}
              </button>
              {showInsights ? <ChevronUp className="w-4 h-4 text-txt-muted" /> : <ChevronDown className="w-4 h-4 text-txt-muted" />}
            </div>
          </div>

          {showInsights && (
            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border pt-5">
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-violet-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-violet-600">Best Format</span>
                </div>
                <p className="text-lg font-black text-violet-800">{insights.bestFormat}</p>
                <p className="text-[10px] text-violet-500 mt-1">Highest avg reach in your data</p>
              </div>

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

      {/* ═══ Format Distribution ═══ */}
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

      {/* ═══ Calendar Grid ═══ */}
      {viewMode === "monthly" ? (
        /* ── Monthly Grid ── */
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
              const isToday = dateStr === todayStr;
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
                    {itemsToday.map((item) => (
                      <CalendarEntryChip
                        key={item.id}
                        item={item}
                        onClickAi={() => setSelectedEntry(item.aiEntry)}
                        onClickMeta={() => setSelectedMetaPost(item.fullPost)}
                        onClickOther={() => onSelectPost && onSelectPost(item)}
                        onDeleteMeta={(e) => {
                          e.stopPropagation();
                          handleDeleteScheduledPost(item.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Weekly View ── */
        <div className="rounded-[2rem] border border-border bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border bg-bg-elevated/30">
            {getWeekDays().map((d) => (
              <div key={d.toISOString()} className="p-3 text-center border-r border-border last:border-r-0">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-txt-muted">
                  {DAYS[d.getDay()]}
                </div>
                <div className={`text-sm font-black mt-1 ${toDateStr(d) === todayStr ? "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center mx-auto animate-pulse" : "text-txt"}`}>
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-[300px]">
            {getWeekDays().map((d) => {
              const dateStr = toDateStr(d);
              const itemsToday = allScheduledItems.filter((item) => item.scheduledDate === dateStr);

              return (
                <div key={dateStr} className={`p-3 border-r border-border last:border-r-0 ${dateStr === todayStr ? "bg-primary/5" : ""}`}>
                  <div className="space-y-2">
                    {itemsToday.map((item) => (
                      <WeeklyEntryCard
                        key={item.id}
                        item={item}
                        onClickAi={() => setSelectedEntry(item.aiEntry)}
                        onClickMeta={() => setSelectedMetaPost(item.fullPost)}
                        onClickOther={() => onSelectPost && onSelectPost(item)}
                        onDeleteMeta={(e) => {
                          e.stopPropagation();
                          handleDeleteScheduledPost(item.id);
                        }}
                      />
                    ))}
                    {itemsToday.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-[10px] text-txt-muted font-medium">No posts</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Entry Detail / Edit Modal ═══ */}
      {selectedEntry && !editingEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedEntry(null)}>
          <div
            className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
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
                    {selectedEntry.day} {fmtDate(selectedEntry.date)} at {selectedEntry.slot}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-txt-muted" />
              </button>
            </div>

            {/* Description */}
            {selectedEntry.description && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Content Breakdown</p>
                <p className="text-xs text-txt leading-relaxed whitespace-pre-line">{selectedEntry.description}</p>
              </div>
            )}

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
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-txt-muted font-bold">Est. Reach</p>
                  <p className="text-sm font-black text-txt">{(selectedEntry.estimatedReach || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-txt-muted font-bold">Pillar</p>
                  <p className="text-xs font-bold text-txt">{selectedEntry.pillar}</p>
                </div>
                <div>
                  <p className="text-[10px] text-txt-muted font-bold">Format</p>
                  <p className="text-xs font-bold text-txt">{selectedEntry.format}</p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setEditingEntry({ ...selectedEntry })}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDeleteAiEntry(selectedEntry)}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[11px] transition-all cursor-pointer"
                  title="Remove this suggestion from calendar"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Discard
                </button>

                {onSendToResearch && (
                  <button
                    onClick={() => {
                      onSendToResearch(selectedEntry.topic);
                      setSelectedEntry(null);
                    }}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" /> R&D Lab
                  </button>
                )}

                {onSendToStudio && (
                  <button
                    onClick={() => {
                      onSendToStudio(selectedEntry.topic, selectedEntry.format);
                      setSelectedEntry(null);
                    }}
                    className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Script
                  </button>
                )}

                <button
                  onClick={() => handleApplyToScheduler(selectedEntry)}
                  disabled={scheduleLoading === selectedEntry.date}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] shadow-lg shadow-emerald-200 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 ml-auto"
                >
                  {scheduleLoading === selectedEntry.date ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Scheduled Meta Post Detail & Delete Modal ═══ */}
      {selectedMetaPost && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedMetaPost(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-lg w-full shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Scheduled Meta Post</h3>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedMetaPost.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedMetaPost.status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {selectedMetaPost.status || "queued"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {selectedMetaPost.scheduledAt
                      ? new Date(selectedMetaPost.scheduledAt).toLocaleString()
                      : "Scheduled Broadcast"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMetaPost(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Target Channels */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Channels:</span>
              <div className="flex gap-1.5">
                {(selectedMetaPost.platforms || ["instagram"]).map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 capitalize">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Media Preview if attached */}
            {selectedMetaPost.mediaUrl && (
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                <img
                  src={selectedMetaPost.mediaUrl}
                  alt="Scheduled media attachment"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
              </div>
            )}

            {/* Caption */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Post Caption</p>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedMetaPost.caption}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {confirmDeleteId === selectedMetaPost.id ? (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">Cancel and delete this scheduled broadcast?</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      Keep Post
                    </button>
                    <button
                      onClick={() => handleDeleteScheduledPost(selectedMetaPost.id)}
                      disabled={deleteLoading === selectedMetaPost.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {deleteLoading === selectedMetaPost.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Confirm Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {/* Delete Scheduled Post trigger */}
                  <button
                    onClick={() => setConfirmDeleteId(selectedMetaPost.id)}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Scheduled Post</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onSelectPost && (
                      <button
                        onClick={() => {
                          onSelectPost({
                            caption: selectedMetaPost.caption,
                            scheduledDate: selectedMetaPost.scheduledAt?.slice(0, 10),
                            mediaUrl: selectedMetaPost.mediaUrl,
                          });
                          setSelectedMetaPost(null);
                        }}
                        className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit in Composer</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setEditingEntry(null)}>
          <div
            className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-txt flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Calendar Entry
              </h3>
              <button onClick={() => setEditingEntry(null)} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4 text-txt-muted" />
              </button>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Date</label>
                <input
                  type="date"
                  value={editingEntry.date || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Time</label>
                <input
                  type="time"
                  value={editingEntry.slot || "12:00"}
                  onChange={(e) => setEditingEntry({ ...editingEntry, slot: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Content Type</label>
              <div className="flex gap-2">
                {["Reel", "Carousel", "Static", "Story"].map((f) => {
                  const FIcon = FORMAT_ICONS[f];
                  return (
                    <button
                      key={f}
                      onClick={() => setEditingEntry({ ...editingEntry, format: f })}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        editingEntry.format === f
                          ? FORMAT_COLORS[f] + " ring-2 ring-offset-1 ring-indigo-300"
                          : "bg-bg-elevated border-border text-txt-muted hover:bg-slate-50"
                      }`}
                    >
                      <FIcon className="w-3.5 h-3.5" /> {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Topic / Idea</label>
              <input
                type="text"
                value={editingEntry.topic || ""}
                onChange={(e) => setEditingEntry({ ...editingEntry, topic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">
                Description {editingEntry.format === "Carousel" ? "(Slide breakdown)" : editingEntry.format === "Reel" ? "(Topic & talking points)" : "(Concept)"}
              </label>
              <textarea
                value={editingEntry.description || ""}
                onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-medium text-txt leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            {/* Hook */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Hook</label>
              <input
                type="text"
                value={editingEntry.hook || ""}
                onChange={(e) => setEditingEntry({ ...editingEntry, hook: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-bold text-txt focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-txt-muted mb-1 block">Caption</label>
              <textarea
                value={editingEntry.caption || ""}
                onChange={(e) => setEditingEntry({ ...editingEntry, caption: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-xs font-medium text-txt leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingEntry)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-200 hover:shadow-xl transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function CalendarEntryChip({ item, onClickAi, onClickMeta, onClickOther, onDeleteMeta }) {
  const isAi = item.type === "ai";
  const isMeta = item.type === "meta";
  const isPublished = item.status === "published";
  const isFailed = item.status === "failed";

  if (isAi) {
    const FormatIcon = FORMAT_ICONS[item.format] || Film;
    const colorClass = FORMAT_COLORS[item.format] || FORMAT_COLORS.Reel;

    return (
      <div
        onClick={onClickAi}
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
      onClick={isMeta ? onClickMeta : onClickOther}
      className={`p-1.5 rounded-lg border text-[9px] font-bold ${badgeColor} cursor-pointer hover:shadow-sm transition-all group/chip relative`}
      title={`${item.title} (${item.status})`}
    >
      <div className="truncate flex items-center justify-between gap-1">
        <div className="truncate flex items-center gap-1">
          {isMeta && (isPublished ? <Check className="w-2 h-2 shrink-0" /> : <Clock className="w-2 h-2 shrink-0" />)}
          {item.title}
        </div>
        {isMeta && onDeleteMeta && (
          <button
            onClick={onDeleteMeta}
            className="opacity-0 group-hover/chip:opacity-100 p-0.5 rounded hover:bg-rose-100 text-rose-600 transition-opacity cursor-pointer"
            title="Delete scheduled post"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      <div className="mt-0.5 uppercase opacity-80 flex items-center justify-between">
        <span>{item.format?.replace(/_/g, " ")}</span>
        <span className="text-[7px] font-black">{isMeta ? "Queued" : "Draft"}</span>
      </div>
    </div>
  );
}

function WeeklyEntryCard({ item, onClickAi, onClickMeta, onClickOther, onDeleteMeta }) {
  const isAi = item.type === "ai";
  const isMeta = item.type === "meta";

  if (isAi) {
    const FormatIcon = FORMAT_ICONS[item.format] || Film;
    const gradient = FORMAT_BADGE_COLORS[item.format] || FORMAT_BADGE_COLORS.Reel;

    return (
      <div
        onClick={onClickAi}
        className="rounded-2xl border border-border bg-white p-3 cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-sm`}>
            <FormatIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-txt-muted">{item.format}</span>
          <span className="ml-auto text-[8px] font-bold text-txt-muted">{item.slot}</span>
        </div>
        <p className="text-[11px] font-black text-txt leading-snug mb-1.5 line-clamp-2">{item.title}</p>
        {item.description && (
          <p className="text-[9px] text-txt-muted leading-relaxed line-clamp-2">{item.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[7px] font-black bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">AI</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isMeta ? onClickMeta : onClickOther}
      className="rounded-2xl border border-border bg-white p-3 cursor-pointer hover:shadow-sm transition-all group/wcard relative"
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-bold text-txt line-clamp-2">{item.title}</p>
        {isMeta && onDeleteMeta && (
          <button
            onClick={onDeleteMeta}
            className="opacity-0 group-hover/wcard:opacity-100 p-1 rounded-lg hover:bg-rose-50 text-rose-500 transition-opacity cursor-pointer shrink-0"
            title="Delete scheduled post"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[9px] text-txt-muted font-medium">{item.format?.replace(/_/g, " ")}</span>
        <span className="text-[8px] font-black text-indigo-500">{item.type === "meta" ? "Queued" : "Draft"}</span>
      </div>
    </div>
  );
}
