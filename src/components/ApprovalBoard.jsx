"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Clapperboard, Rocket, ListChecks, FileText, Lightbulb, XCircle, Eye, ChevronRight, X, Calendar, Share2 } from "lucide-react";

const STAGES = [
  { id: "pending", label: "Pending Review", icon: Clock, color: "text-warning", bg: "bg-warning/5" },
  { id: "approved", label: "Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/5" },
  { id: "in_production", label: "In Production", icon: Clapperboard, color: "text-accent", bg: "bg-accent/5" },
  { id: "published", label: "Published", icon: Rocket, color: "text-primary", bg: "bg-primary/5" },
];

export default function ApprovalBoard() {
  const [items, setItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [scripts, setScripts] = useState([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    try {
      const { getResearchHistory, getContentHistory } = require("@/lib/storage");
      setItems(getResearchHistory());
      setScripts(getContentHistory());
    } catch {}
  };

  const updateStatus = (id, status) => {
    try {
      const { updateResearchStatus } = require("@/lib/storage");
      updateResearchStatus(id, status);
      refreshData();
    } catch {}
  };

  const updateDate = (id, date) => {
    try {
      const { updateResearchDate } = require("@/lib/storage");
      updateResearchDate(id, date);
      refreshData();
    } catch {}
  };

  const getItemsByStage = (stage) => items.filter((i) => (i.status || "pending") === stage);

  const findScript = (keyword) => scripts.find(s => s.keyword === keyword || s.metadata?.keyword === keyword);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h3 className="text-2xl font-bold text-txt tracking-tight flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" strokeWidth={2.5} /> Content Pipeline
          </h3>
          <p className="text-sm text-txt-muted font-medium">Review, approve, and track your educational content flow.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-bg-elevated border border-border text-[10px] font-bold text-txt-secondary uppercase tracking-widest">
            {items.length} Active Items
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-bg-card border border-border rounded-3xl">
          <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mx-auto mb-6"><FileText className="w-10 h-10" /></div>
          <h3 className="text-xl font-bold text-txt mb-2">The pipeline is empty</h3>
          <p className="text-sm text-txt-muted max-w-xs mx-auto">Once you complete a research cycle or generate a script, it will appear here for your review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col gap-4">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border border-border ${stage.bg} shadow-sm`}>
                <stage.icon className={`w-4 h-4 ${stage.color}`} strokeWidth={3} />
                <h4 className="text-xs font-bold text-txt uppercase tracking-wider">{stage.label}</h4>
                <span className="ml-auto text-[10px] font-bold text-txt-muted bg-bg-card px-2 py-0.5 rounded-lg border border-border">
                  {getItemsByStage(stage.id).length}
                </span>
              </div>

              <div className="space-y-4">
                {getItemsByStage(stage.id).map((item) => {
                  const script = findScript(item.keyword);
                  return (
                    <div key={item.id} className="group p-5 rounded-2xl bg-bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                      
                      <p className="text-sm font-bold text-txt mb-2 line-clamp-2 leading-snug">{item.keyword}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-2 py-0.5 rounded-lg bg-bg-elevated border border-border text-[9px] font-bold text-txt-secondary uppercase tracking-tighter">
                          {item.location || "IN"}
                        </div>
                        <div className="text-[10px] font-medium text-txt-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(item.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {item.research?.recommendedStrategy && (
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                          <p className="text-[10px] font-bold text-primary-hover mb-1 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> Recommended Strategy
                          </p>
                          <p className="text-[10px] text-txt-secondary leading-relaxed line-clamp-2">
                            {item.research.recommendedStrategy.bestAngle}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        {script && (
                          <button onClick={() => setPreviewItem({ ...item, script: script.script })}
                            className="w-full py-2 rounded-xl text-[10px] font-bold bg-bg-elevated border border-border text-txt hover:bg-primary-muted hover:text-primary transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Eye className="w-3 h-3" /> Preview Script
                          </button>
                        )}
                        
                        <div className="flex gap-2">
                          {stage.id !== "approved" && stage.id !== "published" && (
                            <button onClick={() => updateStatus(item.id, "approved")}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-success/10 text-success border border-success/20 cursor-pointer hover:bg-success/20 transition-all flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {stage.id === "approved" && (
                            <button onClick={() => updateStatus(item.id, "in_production")}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-accent/10 text-accent-hover border border-accent/20 cursor-pointer hover:bg-accent/20 transition-all flex items-center justify-center gap-1.5">
                              <Clapperboard className="w-3 h-3" /> Produce
                            </button>
                          )}
                          {stage.id === "in_production" && (
                            <button onClick={() => updateStatus(item.id, "published")}
                              className="flex-1 py-2 rounded-xl text-[10px] font-bold grad-primary text-white cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                              <Rocket className="w-3 h-3" /> Publish
                            </button>
                          )}
                          {stage.id === "pending" && (
                            <button onClick={() => updateStatus(item.id, "rejected")}
                              className="p-2 rounded-xl bg-danger/10 text-danger border border-danger/20 cursor-pointer hover:bg-danger/20 transition-all">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-txt/40 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          <div className="relative w-full max-w-4xl bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-full">
            <div className="p-6 border-b border-border flex items-center justify-between bg-bg-elevated/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-txt">Executive Preview</h4>
                  <p className="text-[10px] text-txt-muted font-bold uppercase tracking-widest">{previewItem.keyword}</p>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 rounded-xl hover:bg-bg-elevated transition-colors cursor-pointer text-txt-muted hover:text-txt">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scroll">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Executive Summary */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Rocket className="w-3 h-3" /> Strategic Objective
                  </h5>
                  <p className="text-lg font-bold text-txt leading-snug">
                    {previewItem.research?.executiveSummary || "Educational content focused on student engagement and regulatory compliance."}
                  </p>
                </div>

                {/* Script Body */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-txt-muted uppercase tracking-widest border-b border-border pb-2">Full Script Content</h5>
                  <div className="prose prose-sm max-w-none">
                    <pre className="text-xs text-txt-secondary leading-relaxed whitespace-pre-wrap font-sans">
                      {previewItem.script}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-bg-elevated/50 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl text-[11px] font-bold bg-bg-card border border-border text-txt-secondary hover:text-txt flex items-center gap-2 transition-all cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" /> Share with Team
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { updateStatus(previewItem.id, "approved"); setPreviewItem(null); }}
                  className="px-6 py-2.5 rounded-xl text-[11px] font-bold grad-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Script
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
