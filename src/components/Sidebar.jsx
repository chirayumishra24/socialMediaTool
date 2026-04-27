"use client";

import { Home, Search, BarChart2, Microscope, Video, ListChecks, BrainCircuit, Activity, Calendar } from "lucide-react";

const NAV_GROUPS = [
  {
    title: "INTELLIGENCE",
    items: [
      { id: "dashboard", label: "Executive Hub", icon: Home },
      { id: "discover", label: "News & Signals", icon: Search },
      { id: "analytics", label: "Impact Stats", icon: BarChart2 },
    ]
  },
  {
    title: "PRODUCTION",
    items: [
      { id: "research", label: "R&D Lab", icon: Microscope },
      { id: "studio", label: "Content Studio", icon: Video },
      { id: "calendar", label: "Scheduler", icon: Calendar },
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "approval", label: "Approval Board", icon: ListChecks },
    ]
  }
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-[80px] lg:w-[280px] bg-white border-r border-slate-100 flex flex-col shrink-0 h-screen sticky top-0 z-50">
      {/* Branding */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#0F2942] flex items-center justify-center text-white shadow-xl shadow-slate-200 transition-transform hover:scale-105">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-[18px] font-black text-[#0F2942] tracking-tighter leading-none">Skilizee<span className="text-slate-400">.ai</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-2">DIRECTOR SUITE</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scroll">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="hidden lg:block px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">
              {group.title}
            </h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-[14px] transition-all duration-300 cursor-pointer group relative ${
                    isActive
                      ? "bg-[#0F2942] text-white shadow-xl shadow-slate-200 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#0F2942]"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-all ${isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`} />
                  <span className="hidden lg:block truncate tracking-tight font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status - ENGINE HEALTHY */}
      <div className="p-8 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 animate-pulse" />
          <div className="hidden lg:block">
            <p className="text-[11px] font-black text-[#0F2942] uppercase tracking-wider">ENGINE HEALTHY</p>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Gemini 3.1 Pro • Vercel Edge</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
