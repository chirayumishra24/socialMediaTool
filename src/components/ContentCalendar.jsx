"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCw, Clock, Check } from "lucide-react";
import { useContentHistory } from "@/lib/storage";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar({ onSelectPost }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [metaScheduled, setMetaScheduled] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchMetaScheduled();
  }, [fetchMetaScheduled]);

  // Combine local draft/approved items and Meta scheduled posts
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

    return [...local, ...meta];
  }, [items, metaScheduled]);

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

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[2rem] bg-white border border-border p-5 shadow-sm">
        <div>
          <h3 className="text-xl font-black tracking-tight text-txt flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" /> Content Scheduler &amp; Calendar
          </h3>
          <p className="mt-1 text-sm text-txt-muted font-medium">Track your scheduled posts, queue updates, and drafts.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchMetaScheduled}
            disabled={loading}
            className="p-2 rounded-xl bg-bg-elevated border border-border cursor-pointer hover:bg-bg-card transition-all"
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

      <div className="rounded-[2rem] border border-border bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-bg-elevated/30">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-txt-muted border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[130px]">
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

                <div className="mt-2 space-y-1.5 max-h-[84px] overflow-y-auto custom-scroll pr-1">
                  {itemsToday.map((item) => {
                    const isMeta = item.type === "meta";
                    const isPublished = item.status === "published";
                    const isFailed = item.status === "failed";

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
                        className={`p-2 rounded-lg border text-[9px] font-bold ${badgeColor} cursor-pointer hover:shadow-sm transition-all`}
                        title={`${item.title} (${item.status})`}
                      >
                        <div className="truncate flex items-center gap-1">
                          {isMeta && (isPublished ? <Check className="w-2 h-2 shrink-0" /> : <Clock className="w-2 h-2 shrink-0" />)}
                          {item.title}
                        </div>
                        <div className="mt-1 uppercase opacity-80 flex items-center justify-between">
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
    </div>
  );
}
