"use client";

import { useState, useEffect } from "react";
import { Microscope, Clock, CheckCircle2, Video, Sparkles, ArrowRight, BrainCircuit, ShieldCheck, Trophy, Users, Zap, Search } from "lucide-react";
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

  return (
    <div className="p-8 lg:p-14 space-y-12 max-w-[1600px] mx-auto animate-fade-in relative">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hero Content */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shadow-sm shadow-slate-100">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-[#0F2942] text-[12px] font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> INTELLIGENCE ENGINE PRO
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-[#0F2942] tracking-tighter leading-[1.1]">
              Synthesize Global Trends into <span className="italic underline decoration-slate-200 decoration-4 underline-offset-8">Institutional Truth.</span>
            </h1>
            
            <p className="text-lg text-slate-500 font-bold max-w-2xl leading-relaxed">
              Our agents are currently scanning Indian educational regulations (NEP 2020) and parent sentiment to ensure your school remains the voice of authority.
            </p>
            
            <div className="flex flex-wrap gap-5 pt-4">
              <button 
                onClick={() => onNavigate("research")} 
                className="px-10 py-5 rounded-[1.5rem] bg-[#0F2942] text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[0.98] transition-all shadow-xl shadow-slate-200 cursor-pointer"
              >
                EXECUTE R&D CYCLE <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onNavigate("studio")} 
                className="px-10 py-5 rounded-[1.5rem] bg-white border-2 border-slate-100 text-[#0F2942] text-[14px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all cursor-pointer"
              >
                ENTER STUDIO <Video className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-slate-50 flex flex-wrap gap-12 items-center">
            {[
              { label: "CORE MODEL", value: "Gemini 3.1 Pro", icon: BrainCircuit },
              { label: "DATA QUALITY", value: "Verified Educational", icon: ShieldCheck },
              { label: "IMPACT", value: "12k+ Potential Reach", icon: Users }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0F2942] shadow-sm"><item.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="text-[14px] font-black text-[#0F2942] tracking-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Metric Cards (2x2 Grid) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-6">
          <MetricCard icon={Microscope} label="R&D CYCLES" value={stats.totalResearch} action={() => onNavigate("research")} />
          <MetricCard icon={Clock} label="PENDING BOARD" value={stats.pendingApproval} action={() => onNavigate("approval")} />
          <MetricCard icon={CheckCircle2} label="ADMIN APPROVED" value={stats.approved} action={() => onNavigate("approval")} />
          <MetricCard icon={Video} label="STUDIO OUTPUTS" value={stats.totalContent} action={() => onNavigate("studio")} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Morning Briefing / Signals */}
        <div className="lg:col-span-4">
          <MorningBriefing onStartResearch={onStartResearch} onGoToStudio={onGoToStudio} />
        </div>

        {/* Pulse / Signals Bar */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex items-center gap-8 shadow-sm">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                <Zap className="w-8 h-8 fill-amber-500/20" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal Alert</p>
                  <div className="flex gap-2">
                    {signals.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeSignal ? "bg-[#0F2942] w-4" : "bg-slate-100"} transition-all duration-500`} />
                    ))}
                  </div>
                </div>
                <p className="text-base font-black text-[#0F2942] tracking-tight transition-all">
                  {signals[activeSignal]}
                </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500"><Trophy className="w-5 h-5" /></div>
                  <h4 className="text-[12px] font-black text-[#0F2942] uppercase tracking-[0.2em]">Institutional Impact Pulse</h4>
                </div>
                <div className="space-y-4">
                  {recentResearch.length > 0 ? recentResearch.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-[#0F2942] truncate max-w-[200px]">{item.keyword}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status || "Draft"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-[#0F2942]">84%</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 font-bold text-center py-4 italic">No research activity yet.</p>
                  )}
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-[#0F2942] text-white space-y-6 shadow-xl shadow-slate-200 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-10"><Sparkles className="w-40 h-40" /></div>
                <h5 className="text-xl font-black tracking-tighter leading-tight relative z-10">Your institutional voice is growing <span className="text-amber-400 underline decoration-2 underline-offset-4 decoration-amber-400/30">faster</span> than 80% of schools.</h5>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="px-3 py-1.5 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-[0.15em]">Trust +12%</div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/10 text-[10px] font-black uppercase tracking-[0.15em]">Reach +40%</div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, action }) {
  return (
    <button 
      onClick={action}
      className="p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-slate-200 transition-all group cursor-pointer text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-slate-50 text-slate-400 transition-all group-hover:scale-110">
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <p className="text-5xl font-black text-[#0F2942] tracking-tighter mb-2">{value || 0}</p>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </button>
  );
}
