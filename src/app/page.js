"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ResearchLab from "@/components/ResearchLab";
import ApprovalBoard from "@/components/ApprovalBoard";
import ContentStudio from "@/components/ContentStudio";
import DiscoverHub from "@/components/DiscoverHub";
import Analytics from "@/components/Analytics";
import Settings from "@/components/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />

        {/* Gradient glow overlay */}
        <div className="grad-glow absolute top-0 left-0 right-0 h-[300px] pointer-events-none" />

        <main className="flex-1 overflow-y-auto relative custom-scroll">
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "research" && <ResearchLab />}
          {activeTab === "approval" && <ApprovalBoard />}
          {activeTab === "studio" && <ContentStudio />}
          {activeTab === "discover" && <DiscoverHub />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
