"use client";

const TABS = [
  { id: "dashboard", label: "Command Center", icon: "🏠" },
  { id: "research", label: "R&D Lab", icon: "🔬" },
  { id: "approval", label: "Approval Board", icon: "✅" },
  { id: "studio", label: "Content Studio", icon: "🎬" },
  { id: "discover", label: "Discover", icon: "🔍" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-[68px] lg:w-[220px] bg-bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 lg:p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl grad-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-primary/20">
            S
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-txt leading-tight">SkilizeeAI</h1>
            <p className="text-[10px] text-txt-muted">Marketing Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto custom-scroll">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer group ${
              activeTab === tab.id
                ? "bg-primary-muted text-primary-hover border border-primary/20"
                : "text-txt-secondary hover:bg-bg-card-hover hover:text-txt"
            }`}
          >
            <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{tab.icon}</span>
            <span className="hidden lg:inline font-medium truncate">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="hidden lg:inline text-[10px] text-txt-muted">Gemini 3.1 Pro</span>
        </div>
      </div>
    </aside>
  );
}
