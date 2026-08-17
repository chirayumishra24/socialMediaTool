"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Home,
  TrendingUp,
  BarChart3,
  Video,
  Users,
  Settings,
  Mail,
  Bell,
  LogOut,
  Music,
  Mic,
  Sparkles,
  FlaskConical,
  Calendar,
  CheckSquare,
  PlusCircle,
  Sliders,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Search,
  Command,
  Plus,
  Compass,
  Camera,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function Instagram(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Linkedin(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Youtube(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

import Dashboard from "@/components/Dashboard";
import ResearchLab from "@/components/ResearchLab";
import ContentStudio from "@/components/ContentStudio";
import ContentCalendar from "@/components/ContentCalendar";
import ApprovalBoard from "@/components/ApprovalBoard";
import DiscoverHub from "@/components/DiscoverHub";
import Analytics from "@/components/Analytics";
import AdminPanel from "@/components/AdminPanel";
import InstagramAnalyzer from "@/components/InstagramAnalyzer";
import MetaDashboard from "@/components/MetaDashboard";
import PostComposer from "@/components/PostComposer";
import CampaignHub from "@/components/CampaignHub";
import MetaConnect from "@/components/MetaConnect";
import Login from "@/components/Login";
import AccessDenied from "@/components/AccessDenied";
import LandingPage from "@/components/LandingPage";
import CommandPalette from "@/components/CommandPalette";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ToastProvider, useToast } from "@/components/ui/Toast";

const TAB_BREADCRUMBS = {
  dashboard: { group: "Home", page: "Executive Dashboard", desc: "Real-time signals, performance metrics & AI recommendations" },
  discover: { group: "Home", page: "News & Signals Discovery", desc: "Real-time educational headlines and trending conversation topics" },
  studio: { group: "Studio", page: "Content Studio", desc: "Generate high-converting multi-platform scripts and strategy bundles" },
  research: { group: "Studio", page: "R&D Lab Cycles", desc: "Cross-platform competitive research across YouTube, IG, Reddit & News" },
  composer: { group: "Studio", page: "Post Composer", desc: "Compose, optimize, preview and schedule posts for Meta channels" },
  approval: { group: "Studio", page: "Approval Queue", desc: "Review, edit, and approve AI-generated content before publishing" },
  calendar: { group: "Schedule", page: "Content Calendar", desc: "Visual timeline, best-time-to-post indicators & scheduling grid" },
  "instagram-analyzer": { group: "Analytics", page: "Instagram Profile Audit", desc: "Analyze profile engagement, top formats, and hashtag intelligence" },
  "campaign-hub": { group: "Analytics", page: "Campaign & Audience Hub", desc: "Review multi-channel campaigns, student outreach, and export data" },
  analytics: { group: "Analytics", page: "Channel Analytics", desc: "Executive pipeline velocity and deep engagement metrics" },
  settings: { group: "System", page: "Meta Channel Setup", desc: "Configure connected accounts, API credentials & preferences" },
  admin: { group: "System", page: "Administrator Portal", desc: "User management and system configuration" },
};

function AppContent({ defaultTab = "dashboard" }) {
  const { user, loading, hasAccess, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [researchContext, setResearchContext] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [composerInitialContent, setComposerInitialContent] = useState("");
  const [scheduledPrefillDate, setScheduledPrefillDate] = useState("");
  const [selectedPostToEdit, setSelectedPostToEdit] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true") {
        setShowLogin(true);
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // dark mode preference detected
      }
    }
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return next;
    });
  };

  const handleResearchComplete = (ctx) => setResearchContext(ctx);

  const handleGoToStudio = (ctx) => {
    setResearchContext(ctx);
    setActiveTab("studio");
  };

  const handleStartResearch = (keyword) => {
    handleResearchComplete({ keyword });
    setActiveTab("research");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F6FA] dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-glow-indigo animate-pulse">
            <Sparkles className="w-7 h-7 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 font-bold tracking-tight">Initializing Skilizee Studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <div className="relative min-h-screen bg-[#F3F6FA] dark:bg-[#0B0F19]">
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-6 left-6 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all z-50 cursor-pointer shadow-sm"
          >
            ← Back to Home
          </button>
          <Login />
        </div>
      );
    }
    return <LandingPage onSignInClick={() => setShowLogin(true)} />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  const currentMeta = TAB_BREADCRUMBS[activeTab] || { group: "App", page: "Dashboard", desc: "" };

  return (
    <div className="h-screen bg-[#F3F6FA] dark:bg-[#0B0F19] relative overflow-hidden flex flex-col lg:flex-row font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Decorative Floating ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tabId) => {
          if (tabId === "composer") {
            setComposerInitialContent("");
            setScheduledPrefillDate("");
            setSelectedPostToEdit(null);
          }
          setActiveTab(tabId);
        }}
      />

      {/* Mobile Top Navbar with Hamburger Toggle (< lg) */}
      <aside className="w-full lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1.5px] shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[0.55rem] flex items-center justify-center">
              <span className="bg-gradient-to-tr from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xs font-black">
                S
              </span>
            </div>
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
            Skilizee<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex flex-col justify-start animate-fade-in p-4">
          <div className="w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-5 overflow-y-auto flex flex-col gap-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                  S
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Skilizee<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social AI Suite</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-2">
              <SidebarGroupNav
                icon={Home}
                label="Home"
                active={["dashboard", "discover"].includes(activeTab)}
                activeTab={activeTab}
                onSelectTab={(id) => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                items={[
                  { id: "dashboard", label: "📊 Executive Dashboard" },
                  { id: "discover", label: "📈 News & Signals" },
                ]}
              />
              <SidebarGroupNav
                icon={Video}
                label="Studio"
                active={["studio", "research", "composer", "approval"].includes(activeTab)}
                activeTab={activeTab}
                onSelectTab={(id) => {
                  if (id === "composer") {
                    setComposerInitialContent("");
                    setScheduledPrefillDate("");
                    setSelectedPostToEdit(null);
                  }
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                items={[
                  { id: "studio", label: "🎬 Content Studio" },
                  { id: "research", label: "🧪 R&D Lab Cycles" },
                  { id: "composer", label: "✍️ Post Composer" },
                  { id: "approval", label: "✅ Approval Queue" },
                ]}
              />
              <SidebarGroupNav
                icon={Calendar}
                label="Schedule"
                active={activeTab === "calendar"}
                activeTab={activeTab}
                onSelectTab={(id) => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                items={[{ id: "calendar", label: "🗓️ Content Calendar" }]}
              />
              <SidebarGroupNav
                icon={BarChart3}
                label="Analytics"
                active={["instagram-analyzer", "campaign-hub", "analytics"].includes(activeTab)}
                activeTab={activeTab}
                onSelectTab={(id) => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                items={[
                  { id: "instagram-analyzer", label: "✨ IG Profile Audit" },
                  { id: "campaign-hub", label: "📑 Campaign Export Hub" },
                  { id: "analytics", label: "📊 Channel Analytics" },
                ]}
              />
              <SidebarGroupNav
                icon={Sliders}
                label="Settings"
                active={["settings", "admin"].includes(activeTab)}
                activeTab={activeTab}
                onSelectTab={(id) => {
                  setActiveTab(id);
                  setIsMobileMenuOpen(false);
                }}
                items={[
                  { id: "settings", label: "🎛️ Meta Channels" },
                  ...(user.isAdmin ? [{ id: "admin", label: "🔐 Admin Portal" }] : []),
                ]}
              />
            </nav>

            {/* Mobile User Profile & Theme Toggle */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.name?.slice(0, 2).toUpperCase() || "SM"}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">{user?.name || "User"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{user?.isAdmin ? "Admin" : "Director"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile, visible lg:) */}
      <aside
        className={`hidden lg:flex ${
          isSidebarCollapsed ? "lg:w-[76px] px-2.5 py-4" : "lg:w-[260px] p-4"
        } transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex-col items-stretch justify-between shrink-0 gap-3 z-30 overflow-visible shadow-[1px_0_12px_rgba(0,0,0,0.03)]`}
      >
        {/* Top Section: Brand + Search + Navigation */}
        <div className="flex flex-col items-stretch gap-3 w-full min-h-0 flex-1">
          {/* Brand Logo & Collapse Toggle */}
          <div className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-2.5 pb-2" : "justify-between pb-2"} w-full border-b border-slate-100 dark:border-slate-800/80`}>
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
              <button
                onClick={() => setActiveTab("dashboard")}
                title="Go to Executive Dashboard"
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[2px] shadow-md shadow-indigo-500/15 flex items-center justify-center transition-transform hover:scale-105 shrink-0 cursor-pointer"
              >
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[0.9rem] flex items-center justify-center">
                  <span className="bg-gradient-to-tr from-indigo-600 to-purple-600 bg-clip-text text-transparent text-sm font-black">
                    S
                  </span>
                </div>
              </button>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Skilizee<span className="text-indigo-600 dark:text-indigo-400">.ai</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Social Suite
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`${
                isSidebarCollapsed
                  ? "w-8 h-8 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-400 dark:text-slate-300"
                  : "w-7 h-7 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              } transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm`}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Shortcut / Search Bar in Sidebar */}
          {!isSidebarCollapsed ? (
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <Search className="w-3.5 h-3.5" />
                Quick search...
              </span>
              <kbd className="text-[10px] font-mono font-bold bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
                ⌘K
              </kbd>
            </button>
          ) : (
            <div className="relative group flex justify-center w-full">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                <span>Quick Search</span>
                <kbd className="text-[9px] font-mono bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800 px-1 py-0.5 rounded">⌘K</kbd>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className={`flex flex-col ${isSidebarCollapsed ? "items-center gap-2" : "items-stretch gap-1.5"} w-full flex-1 overflow-y-auto custom-scroll pr-0.5 pt-1`}>
            <SidebarGroupNav
              icon={Home}
              label="Home"
              collapsed={isSidebarCollapsed}
              active={["dashboard", "discover"].includes(activeTab)}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              items={[
                { id: "dashboard", label: "📊 Executive Dashboard" },
                { id: "discover", label: "📈 News & Signals" },
              ]}
            />
            <SidebarGroupNav
              icon={Video}
              label="Studio"
              collapsed={isSidebarCollapsed}
              active={["studio", "research", "composer", "approval"].includes(activeTab)}
              activeTab={activeTab}
              onSelectTab={(id) => {
                if (id === "composer") {
                  setComposerInitialContent("");
                  setScheduledPrefillDate("");
                  setSelectedPostToEdit(null);
                }
                setActiveTab(id);
              }}
              items={[
                { id: "studio", label: "🎬 Content Studio" },
                { id: "research", label: "🧪 R&D Lab Cycles" },
                { id: "composer", label: "✍️ Post Composer" },
                { id: "approval", label: "✅ Approval Queue" },
              ]}
            />
            <SidebarGroupNav
              icon={Calendar}
              label="Schedule"
              collapsed={isSidebarCollapsed}
              active={activeTab === "calendar"}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              items={[{ id: "calendar", label: "🗓️ Content Calendar" }]}
            />
            <SidebarGroupNav
              icon={BarChart3}
              label="Analytics"
              collapsed={isSidebarCollapsed}
              active={["instagram-analyzer", "campaign-hub", "analytics"].includes(activeTab)}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              items={[
                { id: "instagram-analyzer", label: "✨ IG Profile Audit" },
                { id: "campaign-hub", label: "📑 Campaign Export Hub" },
                { id: "analytics", label: "📊 Channel Analytics" },
              ]}
            />
            <SidebarGroupNav
              icon={Sliders}
              label="Settings"
              collapsed={isSidebarCollapsed}
              active={["settings", "admin"].includes(activeTab)}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              items={[
                { id: "settings", label: "🎛️ Meta Channels" },
                ...(user.isAdmin ? [{ id: "admin", label: "🔐 Admin Portal" }] : []),
              ]}
            />
          </nav>
        </div>

        {/* Bottom Section: Connected Apps & User Footer */}
        <div className="flex flex-col gap-2.5 w-full shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Connected Social Suite Apps */}
          {!isSidebarCollapsed ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Connected Apps
              </span>
              <div className="flex items-center justify-between gap-1.5 px-0.5">
                <SocialIcon
                  color="bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600"
                  icon={Instagram}
                  label="Instagram Analytics"
                  onClick={() => setActiveTab("instagram-analyzer")}
                />
                <SocialIcon
                  color="bg-[#0077b5]"
                  icon={Linkedin}
                  label="LinkedIn Tool"
                  onClick={() => {
                    const url = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin-tool-one.vercel.app";
                    const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
                    window.location.href = sso ? `${url}?sso=${sso}` : url;
                  }}
                />
                <SocialIcon
                  color="bg-[#ff0000]"
                  icon={Youtube}
                  label="YouTube Analytics"
                  onClick={() => setActiveTab("analytics")}
                />
                <SocialIcon
                  color="bg-indigo-600"
                  icon={Mic}
                  label="Podcast Studio"
                  onClick={() => {
                    const url = process.env.NEXT_PUBLIC_PODCAST_URL || "https://skillizee-products.web.app/";
                    const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
                    window.location.href = sso ? `${url}?sso=${sso}` : url;
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl justify-items-center w-full max-w-[62px] mx-auto shadow-inner">
              <SocialIcon
                size="sm"
                color="bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600"
                icon={Instagram}
                label="Instagram Analytics"
                onClick={() => setActiveTab("instagram-analyzer")}
              />
              <SocialIcon
                size="sm"
                color="bg-[#0077b5]"
                icon={Linkedin}
                label="LinkedIn Tool"
                onClick={() => {
                  const url = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin-tool-one.vercel.app";
                  const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
                  window.location.href = sso ? `${url}?sso=${sso}` : url;
                }}
              />
              <SocialIcon
                size="sm"
                color="bg-[#ff0000]"
                icon={Youtube}
                label="YouTube Analytics"
                onClick={() => setActiveTab("analytics")}
              />
              <SocialIcon
                size="sm"
                color="bg-indigo-600"
                icon={Mic}
                label="Podcast Studio"
                onClick={() => {
                  const url = process.env.NEXT_PUBLIC_PODCAST_URL || "https://skillizee-products.web.app/";
                  const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
                  window.location.href = sso ? `${url}?sso=${sso}` : url;
                }}
              />
            </div>
          )}

          {/* User Profile & Log Out Footer in Sidebar */}
          <div className={`pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center ${isSidebarCollapsed ? "flex-col gap-2 justify-center" : "justify-between"} w-full`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                  {user?.name?.slice(0, 2).toUpperCase() || "SM"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{user?.name || "User"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {user?.isAdmin ? "Admin" : "Director"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md cursor-pointer">
                  {user?.name?.slice(0, 2).toUpperCase() || "SM"}
                </div>
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                  <span className="font-black">{user?.name || "User"}</span>
                  <span className="text-[9px] opacity-70 uppercase tracking-wider">{user?.isAdmin ? "Admin" : "Director"}</span>
                </div>
              </div>
            )}

            <div className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-1.5 w-full" : "gap-1"}`}>
              <button
                onClick={toggleDarkMode}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="w-7 h-7 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={logout}
                title="Log Out"
                className="w-7 h-7 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-hidden">
        {/* Top Global Header Bar */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 shadow-sm">
          {/* Breadcrumbs & Active Title */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{currentMeta.group}</span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentMeta.page}</span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {currentMeta.page}
            </h1>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Quick Action "+ Create" Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isCreateMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-2xl animate-scale-in"
                  onClick={() => setIsCreateMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setComposerInitialContent("");
                      setScheduledPrefillDate("");
                      setSelectedPostToEdit(null);
                      setActiveTab("composer");
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all text-left cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-600" />
                    <span>Compose Post</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("studio")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all text-left cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Generate AI Script</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("research")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all text-left cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    <span>Run R&D Lab Cycle</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("instagram-analyzer")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all text-left cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span>Audit Instagram Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Search & Quick Actions (Cmd+K)"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 bg-slate-100/70 dark:bg-slate-800/70 py-1 pl-1 pr-3 rounded-full border border-slate-200/60 dark:border-slate-700/60">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || "SM"}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden md:inline">
                {user?.name || "Director"}
              </span>
            </div>
          </div>
        </header>

        {/* Context Ribbon (When Research or Active Project Context is Active) */}
        {researchContext?.keyword && (
          <div className="bg-indigo-50/90 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 px-6 py-2 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span className="font-bold text-slate-600 dark:text-slate-300">Active Workflow:</span>
              <span className="font-extrabold text-indigo-700 dark:text-indigo-300 truncate">
                &ldquo;{researchContext.keyword}&rdquo;
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("research")}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                R&D Insights
              </button>
              <button
                onClick={() => setActiveTab("studio")}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all cursor-pointer"
              >
                Content Studio →
              </button>
              <button
                onClick={() => setResearchContext(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Clear Workflow Context"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 p-6 md:p-8 xl:p-10 overflow-y-auto custom-scroll min-w-0">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === "dashboard" && (
              <Dashboard
                onNavigate={setActiveTab}
                onStartResearch={handleStartResearch}
                onGoToStudio={handleGoToStudio}
              />
            )}
            {activeTab === "research" && (
              <ResearchLab
                onResearchComplete={handleResearchComplete}
                onGoToStudio={handleGoToStudio}
                initialKeyword={researchContext?.keyword}
              />
            )}
            {activeTab === "studio" && (
              <ContentStudio
                researchContext={researchContext}
                onSchedulePost={(content) => {
                  setComposerInitialContent(content);
                  setActiveTab("composer");
                }}
                onSendToApproval={() => setActiveTab("approval")}
              />
            )}
            {activeTab === "calendar" && (
              <ContentCalendar
                onSelectPost={(post) => {
                  if (post.type === "meta") {
                    setSelectedPostToEdit(post.fullPost);
                    setComposerInitialContent(post.fullPost.caption);
                    setActiveTab("composer");
                  } else if (post.scheduledDate) {
                    setScheduledPrefillDate(post.scheduledDate);
                    setActiveTab("composer");
                  }
                }}
                onSendToResearch={(topic) => {
                  handleResearchComplete({ keyword: topic });
                  setActiveTab("research");
                }}
                onSendToStudio={(topic, format) => {
                  const formatMap = {
                    Reel: "instagram_reel",
                    Carousel: "instagram_carousel",
                    Static: "instagram_post",
                    Story: "instagram_reel",
                  };
                  setResearchContext({ keyword: topic, format: formatMap[format] || "instagram_reel" });
                  setActiveTab("studio");
                }}
              />
            )}
            {activeTab === "approval" && (
              <ApprovalBoard
                onPublishPost={(post) => {
                  setComposerInitialContent(post.caption || post.content || "");
                  setActiveTab("composer");
                }}
              />
            )}
            {activeTab === "composer" && (
              <PostComposer
                initialContent={composerInitialContent}
                prefillDate={scheduledPrefillDate}
                postToEdit={selectedPostToEdit}
                onPublished={() => {
                  setComposerInitialContent("");
                  setScheduledPrefillDate("");
                  setSelectedPostToEdit(null);
                  setActiveTab("calendar");
                }}
              />
            )}
            {activeTab === "discover" && <DiscoverHub onStartResearch={handleStartResearch} />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "campaign-hub" && <CampaignHub />}
            {activeTab === "instagram-analyzer" && <InstagramAnalyzer />}
            {activeTab === "settings" && <MetaConnect />}
            {activeTab === "admin" && user.isAdmin && <AdminPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* Sidebar Group Navigation with Accordion & Popovers */
function SidebarGroupNav({ icon: Icon, label, active = false, items = [], activeTab, onSelectTab, collapsed = false }) {
  const [expanded, setExpanded] = useState(active);

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  if (collapsed) {
    return (
      <div className="relative group/sidebar flex justify-center w-full">
        <button
          onClick={() => onSelectTab(items[0]?.id)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 relative ${
            active
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30 scale-105"
              : "text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105"
          }`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {active && (
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-l-full shadow-sm" />
          )}
        </button>

        {/* Rich Hover Popover in Collapsed mode */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 pointer-events-none group-hover/sidebar:opacity-100 group-hover/sidebar:pointer-events-auto translate-x-1 group-hover/sidebar:translate-x-0 transition-all duration-200 min-w-[210px] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-2.5 rounded-2xl shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {label}
            </span>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
              {items.length} {items.length === 1 ? "tool" : "tools"}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {items.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => onSelectTab(subItem.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === subItem.id
                    ? "bg-indigo-600 text-white font-black shadow-sm"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                }`}
              >
                <span>{subItem.label}</span>
                {activeTab === subItem.id && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-0.5">
      {/* Category Accordion Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
          active
            ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-bold"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-xl ${
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold">{label}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Inline Sub-items Dropdown */}
      {expanded && (
        <div className="flex flex-col gap-0.5 pl-8 pr-1 py-1">
          {items.map((subItem) => (
            <button
              key={subItem.id}
              onClick={() => onSelectTab(subItem.id)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                activeTab === subItem.id
                  ? "bg-indigo-600 text-white font-extrabold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
              }`}
            >
              <span>{subItem.label}</span>
              {activeTab === subItem.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Floating / mini social icon helper with rich tooltips */
function SocialIcon({ color, icon: Icon, label, onClick, size = "md" }) {
  const isSm = size === "sm";
  return (
    <div className="relative group/social">
      <button
        onClick={onClick}
        className={`${isSm ? "w-6 h-6 rounded-lg" : "w-8 h-8 rounded-xl"} ${color} text-white flex items-center justify-center shadow-sm hover:scale-110 hover:-translate-y-0.5 transition-all cursor-pointer border-0`}
      >
        <Icon className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} shrink-0`} />
      </button>
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover/social:opacity-100 group-hover/social:pointer-events-auto transition-all duration-150 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  );
}

export default function App({ defaultTab = "dashboard" }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent defaultTab={defaultTab} />
      </ToastProvider>
    </AuthProvider>
  );
}
