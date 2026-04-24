"use client";

import { useState, useEffect } from "react";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalResearch: 0, pendingApproval: 0, approved: 0, totalContent: 0, drafts: 0, published: 0 });

  useEffect(() => {
    try {
      const { getStats } = require("@/lib/storage");
      setStats(getStats());
    } catch {}
  }, []);

  const cards = [
    { icon: "🔬", label: "R&D Completed", value: stats.totalResearch, color: "primary", action: "research" },
    { icon: "⏳", label: "Pending Approval", value: stats.pendingApproval, color: "warning", action: "approval" },
    { icon: "✅", label: "Approved", value: stats.approved, color: "success", action: "approval" },
    { icon: "🎬", label: "Content Created", value: stats.totalContent, color: "accent", action: "studio" },
    { icon: "📝", label: "Drafts", value: stats.drafts, color: "txt-muted", action: "studio" },
    { icon: "🚀", label: "Published", value: stats.published, color: "success", action: "analytics" },
  ];

  const quickActions = [
    { icon: "🔬", label: "New Research", desc: "Start a deep R&D pipeline", action: "research" },
    { icon: "🔍", label: "Quick Discover", desc: "Cross-platform content search", action: "discover" },
    { icon: "🎬", label: "Generate Content", desc: "Create scripts & posts", action: "studio" },
    { icon: "⚙️", label: "Settings", desc: "Configure API keys & location", action: "settings" },
  ];

  return (
    <div className="p-5 space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="relative rounded-2xl overflow-hidden p-6 lg:p-8 border border-border">
        <div className="absolute inset-0 grad-primary opacity-[0.04]" />
        <div className="relative">
          <h2 className="text-xl lg:text-2xl font-bold text-txt mb-1">Welcome to SkilizeeAI 🚀</h2>
          <p className="text-sm text-txt-secondary max-w-xl">
            Your AI-powered social media & marketing intelligence platform. Research trends, generate content, and dominate every platform.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onNavigate(c.action)}
            className="p-4 rounded-xl bg-bg-card border border-border hover:border-primary/30 transition-all group cursor-pointer text-left"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">{c.icon}</span>
            <p className="text-2xl font-bold text-txt mt-1">{c.value}</p>
            <p className="text-[11px] text-txt-muted">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-txt mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => onNavigate(qa.action)}
              className="p-4 rounded-xl bg-bg-card border border-border hover:border-primary/30 hover:bg-bg-card-hover transition-all cursor-pointer text-left group"
            >
              <span className="text-3xl group-hover:animate-float inline-block">{qa.icon}</span>
              <h4 className="text-sm font-bold text-txt mt-2">{qa.label}</h4>
              <p className="text-[11px] text-txt-muted mt-0.5">{qa.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="p-5 rounded-xl bg-bg-card border border-border">
        <h3 className="text-sm font-bold text-txt mb-4">Pipeline Flow</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {["🔬 Research", "→", "📊 Analyze", "→", "✅ Approve", "→", "✍️ Write", "→", "✏️ Edit", "→", "🏷️ SEO/Tags", "→", "🚀 Publish"].map((step, i) => (
            <span key={i} className={step === "→" ? "text-txt-muted text-xs" : "px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-bg-elevated border border-border text-txt-secondary"}>
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
