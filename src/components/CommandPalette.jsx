"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Video,
  Calendar,
  CheckSquare,
  BarChart3,
  Sliders,
  Camera,
  Layers,
  Compass,
  FileSpreadsheet,
  X,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

export default function CommandPalette({ isOpen, onClose, onSelectTab, onQuickAction }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const ACTIONS = useMemo(
    () => [
      {
        id: "nav-dashboard",
        title: "Go to Dashboard",
        category: "Navigation",
        icon: TrendingUp,
        shortcut: "G D",
        action: () => onSelectTab("dashboard"),
      },
      {
        id: "nav-studio",
        title: "Open Content Studio",
        category: "Navigation",
        icon: Video,
        shortcut: "G S",
        action: () => onSelectTab("studio"),
      },
      {
        id: "nav-research",
        title: "Open R&D Research Lab",
        category: "Navigation",
        icon: FlaskConical,
        shortcut: "G R",
        action: () => onSelectTab("research"),
      },
      {
        id: "nav-calendar",
        title: "Open Content Calendar",
        category: "Navigation",
        icon: Calendar,
        shortcut: "G C",
        action: () => onSelectTab("calendar"),
      },
      {
        id: "nav-approval",
        title: "Open Approval Queue",
        category: "Navigation",
        icon: CheckSquare,
        shortcut: "G A",
        action: () => onSelectTab("approval"),
      },
      {
        id: "nav-composer",
        title: "Compose New Post",
        category: "Actions",
        icon: PlusCircle,
        shortcut: "N P",
        action: () => onSelectTab("composer"),
      },
      {
        id: "nav-instagram",
        title: "Audit Instagram Profile (@skillizee.io)",
        category: "Tools",
        icon: Camera,
        shortcut: "A I",
        action: () => onSelectTab("instagram-analyzer"),
      },
      {
        id: "nav-discover",
        title: "Search Educational Signals & News",
        category: "Tools",
        icon: Compass,
        shortcut: "S N",
        action: () => onSelectTab("discover"),
      },
      {
        id: "nav-campaign-hub",
        title: "Export Campaigns & Audiences (Excel)",
        category: "Tools",
        icon: FileSpreadsheet,
        shortcut: "E C",
        action: () => onSelectTab("campaign-hub"),
      },
      {
        id: "nav-analytics",
        title: "Channel & Executive Analytics",
        category: "Navigation",
        icon: BarChart3,
        action: () => onSelectTab("analytics"),
      },
      {
        id: "nav-settings",
        title: "Connected Meta Channels & Settings",
        category: "System",
        icon: Sliders,
        action: () => onSelectTab("settings"),
      },
    ],
    [onSelectTab]
  );

  const filteredActions = useMemo(() => {
    if (!query.trim()) return ACTIONS;
    const q = query.toLowerCase();
    return ACTIONS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [query, ACTIONS]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool name, or search tab..."
            className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scroll">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              No commands matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? "translate-x-0.5 text-indigo-600" : "opacity-0"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Quick Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>Navigate with ↑ ↓ and Enter</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> Quick Switcher
          </span>
        </div>
      </div>
    </div>
  );
}
