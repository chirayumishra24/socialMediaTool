"use client";

import { Home, Microscope, CheckSquare, Calendar, Video, Search, BarChart2, Settings, Zap, ShieldCheck, BrainCircuit, LayoutGrid, Terminal } from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Intelligence",
    items: [
      { id: "dashboard", label: "Executive Hub", icon: Home },
      { id: "discover", label: "News & Signals", icon: Search },
      { id: "analytics", label: "Impact Stats", icon: BarChart2 },
    ]
  },
  {
    label: "Production",
    items: [
      { id: "research", label: "R&D Lab", icon: Microscope },
      { id: "studio", label: "Content Studio", icon: Video },
    ]
  },
  {
    label: "Management",
    items: [
      { id: "approval", label: "Approval Board", icon: CheckSquare },
      { id: "calendar", label: "Scheduler", icon: Calendar },
    ]
  }
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-[80px] lg:w-[260px] bg-bg border-r border-border flex flex-col shrink-0 h-screen sticky top-0 animate-fade-in z-50">
      {/* Branding */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl grad-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-[15px] font-black text-txt tracking-tighter leading-none">Skilizee<span className="text-primary">.ai</span></h1>
            <p className="text-[10px] text-txt-muted uppercase tracking-[0.2em] font-black mt-1.5 opacity-60">Director Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 py-8 space-y-9 overflow-y-auto custom-scroll">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="hidden lg:block px-4 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] opacity-50">
              {group.label}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] transition-all duration-300 cursor-pointer group relative ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/15 font-bold"
                        : "text-txt-secondary hover:bg-bg-elevated/80 hover:text-txt"
                    }`}
                  >
                    <Icon className={`w-[1.2rem] h-[1.2rem] shrink-0 transition-all ${isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`} />
                    <span className="hidden lg:inline truncate tracking-tight">{tab.label}</span>
                    
                    {/* Active Indicator for Mobile */}
                    {isActive && <div className="absolute right-0 lg:hidden w-1.5 h-6 bg-white rounded-l-full mr-[-16px]" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Integrity Info */}
      <div className="p-6 border-t border-border/50 bg-bg-elevated/20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success ring-4 ring-success/15 animate-pulse" />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-[10px] font-black text-txt uppercase tracking-wider">Engine Healthy</p>
              <p className="text-[9px] text-txt-muted font-medium truncate mt-0.5">Gemini 3.1 Pro • Vercel Edge</p>
            </div>
          </div>
          
          {/* Usage Meter (Mock) */}
          <div className="hidden lg:block space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-txt-muted">
              <span>AI Credits</span>
              <span className="text-primary">84% Left</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden border border-border/10">
              <div className="h-full bg-primary w-[84%] transition-all duration-1000 ease-out" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
