"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ResearchLab from "@/components/ResearchLab";
import ContentStudio from "@/components/ContentStudio";
import ContentCalendar from "@/components/ContentCalendar";
import ApprovalBoard from "@/components/ApprovalBoard";
import DiscoverHub from "@/components/DiscoverHub";
import Analytics from "@/components/Analytics";
import AdminPanel from "@/components/AdminPanel";
import Login from "@/components/Login";
import AccessDenied from "@/components/AccessDenied";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function AppContent({ defaultTab = "dashboard" }) {
  const { user, loading, hasAccess } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [researchContext, setResearchContext] = useState(null);

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
    return <Login />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeTab={activeTab} />

        {/* Global background glow */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none -z-10" />

        <main className="flex-1 overflow-y-auto relative custom-scroll pb-10">
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
            />
          )}
          {activeTab === "calendar" && <ContentCalendar />}
          {activeTab === "approval" && <ApprovalBoard />}
          {activeTab === "discover" && (
            <DiscoverHub onStartResearch={handleStartResearch} />
          )}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "admin" && user.isAdmin && <AdminPanel />}
        </main>
      </div>
    </div>
  );
}

export default function App({ defaultTab = "dashboard" }) {
  return (
    <AuthProvider>
      <AppContent defaultTab={defaultTab} />
    </AuthProvider>
  );
}
