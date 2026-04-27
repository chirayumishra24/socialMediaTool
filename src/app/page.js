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

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
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
              onClearContext={() => setResearchContext(null)}
            />
          )}
          {activeTab === "calendar" && <ContentCalendar />}
          {activeTab === "approval" && <ApprovalBoard />}
          {activeTab === "discover" && (
            <DiscoverHub onStartResearch={handleStartResearch} />
          )}
          {activeTab === "analytics" && <Analytics />}
        </main>
      </div>
    </div>
  );
}
