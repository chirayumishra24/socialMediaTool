"use client";

import { useState, useEffect } from "react";
import { Microscope, Clock, CheckCircle2, Video, FileText, Send, Search, Settings, ArrowRight, BarChart } from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalResearch: 0, pendingApproval: 0, approved: 0, totalContent: 0, drafts: 0, published: 0 });

  useEffect(() => {
    try {
      const { getStats } = require("@/lib/storage");
      setStats(getStats());
    } catch {}
  }, []);

  const cards = [
    { icon: Microscope, label: "R&D Completed", value: stats.totalResearch, color: "text-primary" },
    { icon: Clock, label: "Pending Approval", value: stats.pendingApproval, color: "text-warning" },
    { icon: CheckCircle2, label: "Approved", value: stats.approved, color: "text-success" },
    { icon: Video, label: "Content Created", value: stats.totalContent, color: "text-accent" },
    { icon: FileText, label: "Drafts", value: stats.drafts, color: "text-txt-muted" },
    { icon: Send, label: "Published", value: stats.published, color: "text-success" },
  ];

  const quickActions = [
    { icon: Microscope, label: "New Research", desc: "Start a deep R&D pipeline", action: "research" },
    { icon: Search, label: "Quick Discover", desc: "Cross-platform content search", action: "discover" },
    { icon: Video, label: "Generate Content", desc: "Create scripts & posts", action: "studio" },
    { icon: Settings, label: "Settings", desc: "Configure API keys & location", action: "settings" },
  ];

  const pipeline = [
    { label: "Research", icon: Microscope },
    { label: "Analyze", icon: BarChart }, // We'll just use simple text + icons for the pipeline
    { label: "Approve", icon: CheckCircle2 },
    { label: "Write", icon: FileText },
    { label: "Publish", icon: Send }
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-5xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div className="relative rounded-xl overflow-hidden p-8 lg:p-10 border border-border bg-bg-card">
        <div className="absolute inset-0 grad-primary opacity-5" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-txt tracking-tight">Welcome back, Director</h2>
          <p className="text-sm text-txt-secondary mt-1 font-medium">Here's your educational content overview for today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={i}
              onClick={() => onNavigate(c.action)}
              className="p-5 rounded-xl bg-bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer text-left"
            >
              <Icon className={`w-6 h-6 mb-3 ${c.color} group-hover:scale-110 transition-transform`} strokeWidth={2} />
              <p className="text-3xl font-bold text-txt tracking-tight">{c.value}</p>
              <p className="text-[12px] font-medium text-txt-muted mt-1">{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[13px] font-bold text-txt-secondary uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(qa.action)}
                className="p-5 rounded-xl bg-bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer text-left group flex items-start gap-4"
              >
                <div className="p-2.5 rounded-lg bg-bg-elevated border border-border group-hover:bg-primary-muted group-hover:text-primary transition-colors">
                  <Icon className="w-5 h-5 text-txt-secondary group-hover:text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-txt">{qa.label}</h4>
                  <p className="text-[12px] text-txt-muted mt-0.5">{qa.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="p-6 rounded-xl bg-bg-card border border-border">
        <h3 className="text-[13px] font-bold text-txt-secondary uppercase tracking-wider mb-5">Pipeline Flow</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {["Research", "Analyze", "Approve", "Write", "Edit", "SEO/Tags", "Publish"].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-md text-[12px] font-semibold bg-bg-elevated border border-border text-txt-secondary">
                {step}
              </span>
              {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-txt-muted opacity-50" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
