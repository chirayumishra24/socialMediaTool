"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useContentHistory } from "@/lib/storage";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const items = useContentHistory();
  const scheduledItems = useMemo(
    () => items.filter((item) => item.metadata?.scheduledDate || item.savedAt),
    [items]
  );

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
            <CalendarIcon className="w-5 h-5 text-primary" /> Content Scheduler
          </h3>
          <p className="mt-1 text-sm text-txt-muted font-medium">Track saved scripts and plan your posting schedule.</p>
        </div>
        <div className="flex items-center gap-4">
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
            const itemsToday = scheduledItems.filter((item) => {
              const targetDate = item.metadata?.scheduledDate || item.savedAt?.slice(0, 10);
              return targetDate === dateStr;
            });

            return (
              <div key={day} className={`p-2 border-r border-b border-border ${isToday ? "bg-primary/5" : "bg-white"}`}>
                <span className={`text-xs font-black ${isToday ? "w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center" : "text-txt-muted"}`}>
                  {day}
                </span>
                <div className="mt-2 space-y-1.5 max-h-[84px] overflow-y-auto custom-scroll pr-1">
                  {itemsToday.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg border text-[9px] font-bold bg-primary/10 border-primary/20 text-primary" title={item.keyword}>
                      <div className="truncate">{item.keyword}</div>
                      <div className="mt-1 uppercase opacity-80">{item.format?.replace(/_/g, " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
