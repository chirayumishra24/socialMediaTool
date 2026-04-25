"use client";

import { Home, Microscope, CheckSquare, Calendar, Video, Search, BarChart2, Settings } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Command Center", icon: Home },
  { id: "research", label: "R&D Lab", icon: Microscope },
  { id: "approval", label: "Approval Board", icon: CheckSquare },
  { id: "calendar", label: "Content Calendar", icon: Calendar },
  { id: "studio", label: "Content Studio", icon: Video },
  { id: "discover", label: "Discover", icon: Search },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-[68px] lg:w-[220px] bg-bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 lg:p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grad-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-primary/20">
            S
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-txt leading-tight">Skilizee Edu</h1>
            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-semibold">Content Engine</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto custom-scroll">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer group ${
                activeTab === tab.id
                  ? "bg-primary-muted text-primary border border-primary/10 font-semibold"
                  : "text-txt-secondary hover:bg-bg-card-hover hover:text-txt"
              }`}
            >
              <Icon className="w-[1.1rem] h-[1.1rem] shrink-0 group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100" />
              <span className="hidden lg:inline truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success ring-2 ring-success/20 animate-pulse" />
          <span className="hidden lg:inline text-[11px] font-medium text-txt-secondary">Gemini 3.1 Pro</span>
        </div>
      </div>
    </aside>
  );
}
