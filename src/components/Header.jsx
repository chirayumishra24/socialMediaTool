"use client";

import { Globe, BrainCircuit } from "lucide-react";

export default function Header({ activeTab }) {
  const titles = {
    dashboard: { title: "Command Center", sub: "Real-time marketing intelligence overview" },
    discover: { title: "News & Signals", sub: "Trending educational news and viral topics" },
    research: { title: "R&D Lab", sub: "Discover 2026 trends, news, and viral content angles" },
    studio: { title: "Content Studio", sub: "Generate platform-optimized scripts from verified research" },
    approval: { title: "Approval Board", sub: "Review, edit, and publish your content" },
    calendar: { title: "Scheduler", sub: "Plan and track your content calendar" },
    analytics: { title: "Impact Stats", sub: "Track overall institutional content performance" },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-20 border-b border-slate-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-40">
      <div>
        <h2 className="text-[18px] font-black text-[#0F2942] tracking-tight">{current.title}</h2>
        <p className="text-[12px] font-bold text-slate-400 mt-0.5">{current.sub}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-black text-[#0F2942] uppercase tracking-wider shadow-sm">
          <BrainCircuit className="w-4 h-4 text-emerald-500" />
          Gemini 3.1 Pro
        </div>
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-black text-[#0F2942] uppercase tracking-wider shadow-sm">
          <Globe className="w-4 h-4 text-slate-400" />
          India
        </div>
      </div>
    </header>
  );
}
