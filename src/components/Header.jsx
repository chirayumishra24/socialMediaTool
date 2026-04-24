"use client";

export default function Header({ activeTab }) {
  const titles = {
    dashboard: { title: "Command Center", sub: "Real-time marketing intelligence overview" },
    research: { title: "R&D Lab", sub: "Deep research pipeline — Search → Analyze → Discover" },
    approval: { title: "Approval Board", sub: "Review and approve research findings" },
    studio: { title: "Content Studio", sub: "Generate platform-specific scripts & content" },
    discover: { title: "Discover", sub: "Cross-platform trending content search" },
    analytics: { title: "Analytics", sub: "Performance tracking & insights" },
    settings: { title: "Settings", sub: "API keys, location, preferences" },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-14 border-b border-border bg-bg-card/80 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-40">
      <div>
        <h2 className="text-sm font-semibold text-txt">{current.title}</h2>
        <p className="text-[11px] text-txt-muted">{current.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-[11px] text-txt-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Gemini 3.1 Pro
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-[11px] text-txt-secondary">
          🌍 India
        </div>
      </div>
    </header>
  );
}
