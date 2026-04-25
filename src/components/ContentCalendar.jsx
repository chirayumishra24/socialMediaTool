"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledItems, setScheduledItems] = useState([]);

  useEffect(() => {
    try {
      const { getResearchHistory } = require("@/lib/storage");
      const items = getResearchHistory().filter(item => item.scheduledDate && (item.status === "approved" || item.status === "in_production" || item.status === "published"));
      setScheduledItems(items);
    } catch {}
  }, []);

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
    <div className="p-5 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between bg-bg-card border border-border p-4 rounded-xl">
        <h3 className="text-lg font-bold text-txt flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" /> Content Calendar</h3>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-bg-elevated border border-border hover:bg-primary-muted transition-all cursor-pointer"><ChevronLeft className="w-4 h-4 text-txt-muted" /></button>
          <span className="text-sm font-bold text-txt w-32 text-center">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-bg-elevated border border-border hover:bg-primary-muted transition-all cursor-pointer"><ChevronRight className="w-4 h-4 text-txt-muted" /></button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-bg-elevated">
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center text-[11px] font-bold text-txt-secondary uppercase tracking-wider border-r border-border last:border-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {blanks.map(i => (
            <div key={`blank-${i}`} className="border-r border-b border-border bg-bg-card/50" />
          ))}
          {days.map(day => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            const itemsToday = scheduledItems.filter(item => item.scheduledDate === dateStr);

            return (
              <div key={day} className={`p-2 border-r border-b border-border relative group transition-all hover:bg-bg-elevated ${isToday ? "bg-primary/5" : ""}`}>
                <span className={`text-xs font-bold ${isToday ? "flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white" : "text-txt-muted"}`}>
                  {day}
                </span>
                
                <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[70px] custom-scroll pr-1">
                  {itemsToday.map(item => (
                    <div key={item.id} className={`p-1.5 rounded-md text-[9px] border cursor-pointer hover:opacity-80 transition-opacity ${item.status === "published" ? "bg-primary-muted border-primary/20 text-primary-hover" : item.status === "in_production" ? "bg-accent/15 border-accent/20 text-accent-hover" : "bg-success/15 border-success/20 text-success"}`} title={item.keyword}>
                      <div className="font-semibold truncate">{item.keyword}</div>
                      <div className="flex justify-between items-center mt-0.5 opacity-80">
                        <span className="uppercase">{item.status === 'in_production' ? 'PROD' : item.status}</span>
                        <span>{item.research?.recommendedStrategy?.bestFormat || 'Content'}</span>
                      </div>
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
