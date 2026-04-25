"use client";

import { useState, useEffect } from "react";
import { Microscope, Clock, CheckCircle2, Video, FileText, Send, Search, Settings, ArrowRight, BarChart, Zap, Globe, TrendingUp, Sparkles, BrainCircuit, ShieldCheck, Newspaper, ExternalLink, Activity, Trophy, Users, Star } from "lucide-react";
import MorningBriefing from "./MorningBriefing";
import { useResearchHistory, useStats } from "@/lib/storage";

export default function Dashboard({ onNavigate, onStartResearch, onGoToStudio }) {
  const stats = useStats();
  const [activeSignal, setActiveSignal] = useState(0);
  const recentResearch = useResearchHistory().slice(0, 3);

  const signals = [
    "NEP 2020: Focus on vocational training trending in Karnataka",
    "Digital Literacy: High engagement on 'AI for Teachers' reels",
    "School Safety: New regulations headline news in Delhi",
    "Student Mental Health: Rising discussions on Reddit /r/education"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % signals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [signals.length]);

  const statsCards = [
    { icon: Microscope, label: "R&D Cycles", value: stats.totalResearch, color: "text-primary", action: "research" },
    { icon: Clock, label: "Pending Board", value: stats.pendingApproval, color: "text-warning", action: "approval" },
    { icon: CheckCircle2, label: "Admin Approved", value: stats.approved, color: "text-success", action: "approval" },
    { icon: Video, label: "Studio Outputs", value: stats.totalContent, color: "text-accent", action: "studio" },
  ];

  return (
    <div className="p-8 lg:p-14 space-y-16 max-w-[1500px] mx-auto animate-fade-in relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/2 translate-y-1/2" />

      {/* Header & Intelligence Pulse */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/5 border border-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-success">Live Intelligence Link</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Global Educational Pulse v2.4</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-txt tracking-tighter leading-tight">
            Executive <span className="text-primary">Hub</span>
          </h2>
          <p className="text-lg text-txt-secondary font-medium max-w-2xl leading-relaxed">
            Welcome, Director. Your content pipeline is at <span className="text-primary font-black underline decoration-accent decoration-4">maximum capacity</span>. 
            We've identified {signals.length} high-impact educational signals for your school today.
          </p>
        </div>

        {/* Dynamic Signal Card */}
        <div className="glass p-8 rounded-[3rem] flex items-center gap-8 max-w-lg w-full shadow-premium hover:shadow-premium-hover transition-all group border-primary/5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            <Zap className="w-8 h-8 fill-primary/20" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Signal Alert</p>
              <div className="flex gap-1.5">
                {signals.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeSignal ? "bg-primary w-4" : "bg-border"} transition-all duration-500`} />
                ))}
              </div>
            </div>
            <p className="text-base font-black text-txt leading-snug animate-slide-up" key={activeSignal}>
              {signals[activeSignal]}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Core Intelligence Hero */}
        <div className="lg:col-span-8 group relative rounded-[3.5rem] overflow-hidden border border-border bg-white p-12 flex flex-col justify-between min-h-[420px] shadow-premium hover:shadow-premium-hover transition-all hover:border-primary/20">
          <div className="absolute -top-24 -right-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
            <BrainCircuit className="w-[600px] h-[600px] text-primary rotate-12" />
          </div>
          
          <div className="relative space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[12px] font-black uppercase tracking-widest shadow-sm">
              <Sparkles className="w-4 h-4" /> Intelligence Engine Pro
            </div>
            <h3 className="text-4xl lg:text-5xl font-black text-txt leading-[1.05] tracking-tight">
              Synthesize Global Trends into <span className="text-primary italic underline decoration-accent/30 decoration-4">Institutional Truth</span>.
            </h3>
            <p className="text-lg text-txt-secondary leading-relaxed font-medium">
              Our agents are currently scanning Indian educational regulations (NEP 2020) and parent sentiment to ensure your school remains the voice of authority.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button onClick={() => onNavigate("research")} className="px-10 py-5 rounded-[2rem] grad-primary text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[0.98] active:scale-95 transition-all shadow-2xl shadow-primary/30 cursor-pointer">
                Execute R&D Cycle <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate("studio")} className="px-10 py-5 rounded-[2rem] bg-white border-2 border-border text-txt text-[14px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer">
                Enter Studio <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative mt-16 pt-10 border-t border-border flex flex-wrap gap-12 items-center">
            {[
              { label: "Core Model", value: "Gemini 3.1 Pro", icon: ShieldCheck },
              { label: "Data Quality", value: "Verified Educational", icon: Trophy },
              { label: "Impact", value: "12k+ Potential Reach", icon: Users }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-primary shadow-sm"><item.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="text-[13px] font-black text-txt tracking-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-8">
          {statsCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <button key={i} onClick={() => onNavigate(c.action)}
                className="p-10 rounded-[3rem] bg-white border border-border hover:border-accent/40 transition-all group cursor-pointer text-left relative overflow-hidden shadow-premium hover:shadow-premium-hover">
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none">
                  <Icon className="w-32 h-32 text-primary" />
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8 bg-primary/5 border border-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-sm">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <p className="text-4xl font-black text-txt tracking-tighter mb-2">{c.value}</p>
                <p className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{c.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Intelligence Tier */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 pb-20">
        
        {/* The Briefing */}
        <div className="xl:col-span-1">
          <MorningBriefing 
            onStartResearch={onStartResearch} 
            onGoToStudio={onGoToStudio} 
          />
        </div>

        {/* Live Performance Pulse */}
        <div className="xl:col-span-2 p-10 rounded-[3.5rem] bg-white border border-border shadow-premium space-y-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <TrendingUp className="w-40 h-40 text-success" />
           </div>
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-success/10 text-success"><Activity className="w-6 h-6" /></div>
                <h4 className="text-[14px] font-black text-txt uppercase tracking-widest">Institutional Impact Pulse</h4>
              </div>
              <div className="flex gap-3">
                <span className="text-[10px] font-black text-success uppercase tracking-widest bg-success/5 border border-success/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping" /> Live Metrics
                </span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {stats.published > 0 ? (
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest">Top Performing Recently</p>
                    {recentResearch.filter(r => r.status === "published").slice(0, 2).map((item, i) => (
                       <div key={i} className="p-6 rounded-[2.5rem] bg-bg-elevated/30 border border-border/50 flex items-center justify-between group hover:border-success/30 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
                             <div>
                                <p className="text-sm font-black text-txt line-clamp-1">{item.keyword}</p>
                                <p className="text-[10px] font-bold text-success uppercase tracking-widest">High Engagement</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-txt tracking-tighter">1.2k</p>
                             <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest">Reach</p>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-elevated/20 rounded-[2.5rem] border border-dashed border-border">
                    <p className="text-xs font-bold text-txt-muted">No live campaigns yet.</p>
                    <p className="text-[10px] text-txt-muted uppercase tracking-widest mt-1">Publish content to see impact</p>
                 </div>
              )}

              <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 opacity-10"><Sparkles className="w-40 h-40" /></div>
                 <h5 className="text-xl font-black tracking-tighter leading-tight relative z-10">Your institutional voice is growing <span className="text-accent underline decoration-2 underline-offset-4">faster</span> than 80% of schools.</h5>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-widest">Trust +12%</div>
                    <div className="px-3 py-1 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-widest">Reach +40%</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
