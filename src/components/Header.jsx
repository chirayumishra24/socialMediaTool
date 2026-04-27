"use client";

import { Globe, BrainCircuit } from "lucide-react";

export default function Header({ activeTab }) {
  const titles = {
    discover: { title: "Discover Hub", sub: "Trending news and viral topics" },
    research: { title: "R&D Lab", sub: "Discover 2026 trends, news, and viral content angles" },
    studio: { title: "Script Studio", sub: "Generate platform-optimized scripts from verified research" },
    approval: { title: "Approval Board", sub: "Review, edit, and publish your content" },
    calendar: { title: "Scheduler", sub: "Plan and track your content calendar" },
    analytics: { title: "Analytics", sub: "Track overall content performance" },
  };

  const current = titles[activeTab] || titles.research;

  return (
    <header className="h-14 border-b border-border bg-bg-card/80 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-40">
      <div>
        <h2 className="text-sm font-semibold text-txt">{current.title}</h2>
        <p className="text-[11px] text-txt-muted">{current.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-[11px] text-txt-secondary">
          <BrainCircuit className="w-3 h-3 text-success" />
          Gemini 3.1 Pro
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-[11px] text-txt-secondary">
          <Globe className="w-3 h-3" />
          India
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-[11px] text-success font-bold">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>
    </header>
  );
}
