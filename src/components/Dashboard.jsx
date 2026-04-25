"use client";

import { useState, useEffect } from "react";
import { Microscope, Clock, CheckCircle2, Video, FileText, Send, Search, Settings, ArrowRight, BarChart, Zap, Globe, TrendingUp, Sparkles } from "lucide-react";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ totalResearch: 0, pendingApproval: 0, approved: 0, totalContent: 0, drafts: 0, published: 0 });
  const [activeSignal, setActiveSignal] = useState(0);

  const signals = [
    "NEP 2020: Focus on vocational training trending in Karnataka",
    "Digital Literacy: High engagement on 'AI for Teachers' reels",
    "School Safety: New regulations headline news in Delhi",
    "Student Mental Health: Rising discussions on Reddit /r/education"
  ];

  useEffect(() => {
    try {
      const { getStats } = require("@/lib/storage");
      setStats(getStats());
    } catch {}
    
    const interval = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % signals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { icon: Microscope, label: "R&D Completed", value: stats.totalResearch, color: "text-primary", action: "research" },
    { icon: Clock, label: "Pending Approval", value: stats.pendingApproval, color: "text-warning", action: "approval" },
    { icon: CheckCircle2, label: "Approved", value: stats.approved, color: "text-success", action: "approval" },
    { icon: Video, label: "Content Created", value: stats.totalContent, color: "text-accent", action: "studio" },
    { icon: FileText, label: "Drafts", value: stats.drafts, color: "text-txt-muted", action: "history" },
    { icon: Send, label: "Published", value: stats.published, color: "text-success", action: "calendar" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header & Live Signal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-success">Intelligence Live</span>
          </div>
          <h2 className="text-3xl font-bold text-txt tracking-tight">Welcome, Director</h2>
          <p className="text-sm text-txt-secondary font-medium">Your educational intelligence pipeline is optimized and active.</p>
        </div>

        <div className="bg-bg-card border border-border px-4 py-3 rounded-xl flex items-center gap-4 max-w-sm w-full shadow-sm">
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-wider mb-0.5">Live Signal</p>
            <p className="text-[11px] font-semibold text-txt truncate animate-slide-right" key={activeSignal}>
              {signals[activeSignal]}
            </p>
          </div>
        </div>
      </div>

      {/* Main Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary CTA */}
        <div className="lg:col-span-8 group relative rounded-2xl overflow-hidden border border-border bg-bg-card p-8 flex flex-col justify-between min-h-[280px] shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe className="w-48 h-48 text-primary rotate-12" />
          </div>
          <div className="relative space-y-4 max-w-md">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> System Modernized
            </div>
            <h3 className="text-2xl font-bold text-txt leading-tight">From Real-Time Trends to Production-Ready Scripts.</h3>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Our pipeline now uses live Instagram, X/Twitter, and YouTube data to validate every content idea. 
              Built for precision school communication.
            </p>
            <button 
              onClick={() => onNavigate("discover")}
              className="mt-4 px-6 py-2.5 rounded-xl grad-primary text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Start Discovery <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative mt-8 pt-6 border-t border-border/50 flex gap-8">
            <div>
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-wider mb-1">Eng. Model</p>
              <p className="text-xs font-bold text-txt">Gemini 3.1 Pro</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-wider mb-1">Latency</p>
              <p className="text-xs font-bold text-txt">~1.2s avg</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-wider mb-1">Status</p>
              <p className="text-xs font-bold text-success flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Vercel Active</p>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(c.action)}
                className="p-5 rounded-2xl bg-bg-card border border-border hover:border-primary/40 transition-all group cursor-pointer text-left relative overflow-hidden"
              >
                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Icon className="w-16 h-16 text-primary" />
                </div>
                <Icon className={`w-5 h-5 mb-3 ${c.color} group-hover:scale-110 transition-transform`} strokeWidth={2.5} />
                <p className="text-2xl font-bold text-txt tracking-tight">{c.value}</p>
                <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mt-1">{c.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold text-txt uppercase tracking-wider">Top Performing Channel</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><Video className="w-4 h-4" /></div>
              <div><p className="text-sm font-bold text-txt">YouTube</p><p className="text-[10px] text-txt-muted">Educational Long-form</p></div>
            </div>
            <span className="text-xs font-bold text-success">+12.4%</span>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl bg-bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-txt uppercase tracking-wider">Intelligence Pipeline Workflow</h4>
            </div>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Gated Operations</span>
          </div>
          <div className="flex items-center justify-between gap-2 max-w-lg">
            {["R&D", "Validate", "Draft", "Approve", "Live"].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${i < 3 ? "bg-primary" : "bg-bg-elevated border border-border"}`} />
                  <span className="text-[10px] font-bold text-txt-secondary">{step}</span>
                </div>
                {i < arr.length - 1 && <div className="w-8 h-[1px] bg-border mb-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
