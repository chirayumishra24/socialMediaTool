"use client";

export default function Sidebar({ activeTab, onTabChange }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "generate", label: "Generate", icon: "✨" },
    { id: "trends", label: "Trends", icon: "📈" },
    { id: "news", label: "News Feed", icon: "📰" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "history", label: "History", icon: "📁" },
  ];

  return (
    <aside className="w-[72px] lg:w-[220px] bg-surface border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 lg:p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            ET
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-text-primary leading-tight">EduTrend</h1>
            <p className="text-[10px] text-text-muted">AI Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary/15 text-primary-light border border-primary/20"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <span className="text-lg shrink-0">{tab.icon}</span>
            <span className="hidden lg:inline font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Status indicator */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="hidden lg:inline text-xs text-text-muted">System Active</span>
        </div>
      </div>
    </aside>
  );
}
