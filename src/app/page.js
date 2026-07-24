"use client";

import { useEffect, useState } from "react";
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
  Sliders
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
import MetaConnect from "@/components/MetaConnect";
import Login from "@/components/Login";
import AccessDenied from "@/components/AccessDenied";
import LandingPage from "@/components/LandingPage";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function AppContent({ defaultTab = "dashboard" }) {
  const { user, loading, hasAccess, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [researchContext, setResearchContext] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [composerInitialContent, setComposerInitialContent] = useState("");
  const [scheduledPrefillDate, setScheduledPrefillDate] = useState("");
  const [selectedPostToEdit, setSelectedPostToEdit] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true") {
        setShowLogin(true);
      }
    }
  }, []);

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
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2942] flex items-center justify-center text-white animate-pulse">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-semibold animate-pulse">Loading Skilizee.ai...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <div className="relative">
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-6 left-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all z-50 cursor-pointer"
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

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden flex flex-col lg:flex-row font-sans">
      {/* Decorative Floating 3D/Glass Objects in Background */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-purple-300/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-pink-300/5 blur-xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-28 h-28 rounded-full bg-indigo-300/10 blur-2xl pointer-events-none" />

      {/* Global Sidebar (Left) */}
      <aside className="w-full lg:w-[100px] bg-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-row lg:flex-col items-center justify-between lg:justify-start p-4 lg:py-6 shrink-0 gap-4 z-30">
        {/* Logo Brand Icon */}
        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-[2px] shadow-lg flex items-center justify-center transition-transform hover:scale-105 shrink-0">
          <div className="w-full h-full bg-white rounded-[1.15rem] flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
              S
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-row lg:flex-col items-center gap-1 sm:gap-2 lg:gap-3.5 max-h-[75vh] overflow-y-auto custom-scroll pr-1">
          <SidebarBtn icon={Home} label="Home" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarBtn icon={TrendingUp} label="Trends" active={activeTab === "discover"} onClick={() => setActiveTab("discover")} />
          <SidebarBtn icon={FlaskConical} label="R&D Lab" active={activeTab === "research"} onClick={() => setActiveTab("research")} />
          <SidebarBtn icon={Video} label="Content" active={activeTab === "studio"} onClick={() => setActiveTab("studio")} />
          <SidebarBtn icon={Calendar} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
          <SidebarBtn icon={CheckSquare} label="Approval" active={activeTab === "approval"} onClick={() => setActiveTab("approval")} />
          <SidebarBtn icon={PlusCircle} label="Compose" active={activeTab === "composer"} onClick={() => { setComposerInitialContent(""); setScheduledPrefillDate(""); setSelectedPostToEdit(null); setActiveTab("composer"); }} />
          <SidebarBtn icon={BarChart3} label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <SidebarBtn icon={Sparkles} label="IG Audit" active={activeTab === "instagram-analyzer"} onClick={() => setActiveTab("instagram-analyzer")} />
          <SidebarBtn icon={Sliders} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
          {user.isAdmin && (
            <SidebarBtn icon={Settings} label="Admin" active={activeTab === "admin"} onClick={() => setActiveTab("admin")} />
          )}
        </nav>

        {/* Sleek Log Out Action */}
        <button
          onClick={logout}
          title="Log Out"
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer mt-auto hidden lg:flex"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </aside>

      {/* Right Floating Social Pill */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-3.5 bg-white/80 backdrop-blur-md border border-slate-200/55 p-3 rounded-l-2xl shadow-xl">
        <SocialIcon color="bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600" icon={Instagram} label="Instagram" onClick={() => setActiveTab("analytics")} />
        <SocialIcon color="bg-black" icon={Music} label="TikTok" onClick={() => setActiveTab("analytics")} />
        <SocialIcon color="bg-[#0077b5]" icon={Linkedin} label="LinkedIn" onClick={() => {
          const url = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin-tool-one.vercel.app";
          const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
          window.location.href = sso ? `${url}?sso=${sso}` : url;
        }} />
        <SocialIcon color="bg-[#ff0000]" icon={Youtube} label="YouTube" onClick={() => setActiveTab("analytics")} />
        <SocialIcon color="bg-indigo-600" icon={Mic} label="Podcast Studio" onClick={() => {
          const url = process.env.NEXT_PUBLIC_PODCAST_URL || "https://skillizee-products.web.app/";
          const sso = typeof window !== "undefined" ? localStorage.getItem("skilizee_sso") : null;
          window.location.href = sso ? `${url}?sso=${sso}` : url;
        }} />
      </div>

      {/* Content wrapper with integrated header */}
      <div className="flex-1 p-6 md:p-8 xl:p-10 flex flex-col gap-8 min-w-0 z-10 overflow-y-auto h-screen custom-scroll pb-20">
        
        {/* Global Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0B192C]">
              {activeTab === "dashboard" && "Social Media AI Agent Dashboard"}
              {activeTab === "discover" && "News & Signals Discovery"}
              {activeTab === "analytics" && "Campaign Analytics Hub"}
              {activeTab === "research" && "R&D Lab Cycles"}
              {activeTab === "studio" && "Production Content Studio"}
              {activeTab === "instagram-analyzer" && "Instagram Profile Analyzer"}
              {activeTab === "calendar" && "Content Calendar & Scheduling"}
              {activeTab === "approval" && "Content Approval Queue"}
              {activeTab === "composer" && "Social Media Composer"}
              {activeTab === "settings" && "Connected Social Channels & Settings"}
              {activeTab === "admin" && "Administrative Portal"}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              Hello, {user?.name || "Social Media Manager"}! Overview
            </p>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:scale-105 transition-all shadow-sm cursor-pointer">
              <Mail className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:scale-105 transition-all shadow-sm relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            
            <div className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 pl-2.5 pr-4 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || "SM"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-[#0B192C] leading-none">{user?.name || "Social Media Manager"}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {user?.isAdmin ? "Administrator" : "Director"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Rendered inside the global layout frame */}
        <div className="w-full flex-1">
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
            />
          )}
          {activeTab === "studio" && (
            <ContentStudio
              researchContext={researchContext}
              onSchedulePost={(content) => {
                setComposerInitialContent(content);
                setActiveTab("composer");
              }}
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
          {activeTab === "discover" && (
            <DiscoverHub onStartResearch={handleStartResearch} />
          )}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "instagram-analyzer" && <InstagramAnalyzer />}
          {activeTab === "settings" && <MetaConnect />}
          {activeTab === "admin" && user.isAdmin && <AdminPanel />}
        </div>

      </div>
    </div>
  );
}

/* Sidebar button helper component */
function SidebarBtn({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
          : "text-slate-400 hover:bg-white/80 hover:text-indigo-600"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-wide scale-90">{label}</span>
    </button>
  );
}

/* Floating social icon helper component */
function SocialIcon({ color, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 rounded-xl ${color} text-white flex items-center justify-center shadow-md hover:scale-115 hover:rotate-3 transition-all cursor-pointer border-0`}
    >
      <Icon className="w-4.5 h-4.5 shrink-0" />
    </button>
  );
}

export default function App({ defaultTab = "dashboard" }) {
  return (
    <AuthProvider>
      <AppContent defaultTab={defaultTab} />
    </AuthProvider>
  );
}
