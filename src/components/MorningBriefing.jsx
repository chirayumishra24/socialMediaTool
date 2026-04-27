"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Zap, Bot, Microscope, Wand2, Star } from "lucide-react";

export default function MorningBriefing({ onStartResearch, onGoToStudio }) {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate pre-analyzed insights (Autopilot)
    setTimeout(() => {
      setBriefings([
        {
          id: 1,
          topic: "NEP 2024: Foundational Stage",
          summary: "Karnataka government just released new guidelines for pre-primary schools. Parents are searching for 'age criteria 2024' and 'play-way vs formal'.",
          recommendedFormat: "instagram_reel",
          impact: "HIGH",
          keyword: "NEP Karnataka Pre-Primary 2024",
          angle: "The 'Direct' School's approach to the new 3-8 age bracket."
        },
        {
          id: 2,
          topic: "AI in Classroom: Ethics",
          summary: "Viral debate on X regarding AI tools in homework. 65% of parents in urban India are concerned about critical thinking loss.",
          recommendedFormat: "x_thread",
          impact: "CRITICAL",
          keyword: "AI Ethics for School Children",
          angle: "Why our school teaches AI as a tool, not a crutch."
        },
        {
          id: 3,
          topic: "Student Wellness First",
          summary: "Rising trend in 'low-stress' schooling. Data shows 40% increase in interest for schools with mandatory sports/arts.",
          recommendedFormat: "linkedin_post",
          impact: "MEDIUM",
          keyword: "Holistic Education Growth India",
          angle: "Moving beyond grades: Our institutional vision for 2025."
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="h-full p-10 rounded-[3.5rem] bg-white border border-border shadow-premium space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-bg-elevated rounded-full" />
        <div className="space-y-4">
          <div className="h-40 bg-bg-elevated rounded-3xl" />
          <div className="h-40 bg-bg-elevated rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-8 lg:p-10 rounded-[3.5rem] bg-white border border-border shadow-premium relative overflow-hidden group flex flex-col">
      <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
        <Star className="w-48 h-48" />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/50 pb-8 min-h-[5.5rem]">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-[1.25rem] bg-accent/10 text-accent shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[15px] font-black text-txt uppercase tracking-wider">Director's Morning Briefing</h4>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.2em]">Autopilot Intelligence Scan</p>
              <span className="text-[10px] text-primary/40">•</span>
              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Last Scanned: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 shadow-sm self-start sm:self-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">3 NEW SIGNALS</span>
        </div>
      </div>

      <div className="mt-8 flex-1 space-y-5">
        {briefings.map((b) => (
          <div key={b.id} className="p-7 rounded-[2.5rem] bg-bg-elevated/20 border border-border/40 hover:border-primary/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group/card relative overflow-hidden min-h-[20rem] flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full grad-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
            
            <div className="flex flex-col gap-6 flex-1">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg border shadow-sm shrink-0 ${
                    b.impact === "CRITICAL" ? "bg-danger/5 border-danger/20 text-danger" : 
                    b.impact === "HIGH" ? "bg-warning/10 border-warning/20 text-warning" : 
                    "bg-success/5 border-success/20 text-success"
                  }`}>
                    {b.impact} IMPACT
                  </span>
                  <h5 className="text-[15px] font-black text-txt tracking-tight leading-tight">{b.topic}</h5>
                </div>
                
                <p className="text-xs text-txt-secondary leading-relaxed font-medium line-clamp-4">
                  {b.summary}
                </p>
                
                <div className="flex items-start gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-border shadow-sm max-w-full overflow-hidden">
                    <Wand2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest truncate">
                      Strategy: {b.angle}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                <button 
                  onClick={() => onStartResearch(b.keyword)}
                  className="px-4 py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <Microscope className="w-3.5 h-3.5" /> Analyze
                </button>
                <button 
                  onClick={() => onGoToStudio({ 
                    keyword: b.keyword, 
                    research: { executiveSummary: b.summary, suggestedAngles: [{ angle: b.angle }] },
                    format: b.recommendedFormat
                  })}
                  className="px-4 py-3.5 rounded-xl bg-white border border-border text-txt text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-bg-elevated active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                   Draft <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 rounded-2xl bg-bg-card border border-border text-[10px] font-black text-txt-muted uppercase tracking-widest hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
        <Zap className="w-4 h-4" /> Refresh Global Intelligence Scan
      </button>
    </div>
  );
}
