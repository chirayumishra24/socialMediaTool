"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ResearchLab from "@/components/ResearchLab";
import ContentStudio from "@/components/ContentStudio";
import ContentCalendar from "@/components/ContentCalendar";
import ApprovalBoard from "@/components/ApprovalBoard";
import DiscoverHub from "@/components/DiscoverHub";
import Analytics from "@/components/Analytics";

export default function App() {
  const [activeTab, setActiveTab] = useState("research");
  const [researchContext, setResearchContext] = useState(null);

  const handleResearchComplete = (ctx) => setResearchContext(ctx);

  const handleGoToStudio = (ctx) => {
    setResearchContext(ctx);
    setActiveTab("studio");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />

        <div className="grad-glow absolute top-0 left-0 right-0 h-[300px] pointer-events-none" />

        <main className="flex-1 overflow-y-auto relative custom-scroll">
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
          {activeTab === "discover" && <DiscoverHub onStartResearch={(kw) => { handleResearchComplete({keyword: kw}); setActiveTab("research"); }} />}
          {activeTab === "analytics" && <Analytics />}
        </main>
      </div>
    </div>
  );
}
