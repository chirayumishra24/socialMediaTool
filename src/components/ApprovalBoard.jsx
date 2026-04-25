"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Clapperboard, Rocket, ListChecks, FileText, Lightbulb, XCircle } from "lucide-react";

const STAGES = [
  { id: "pending", label: "Pending Review", icon: Clock, color: "warning" },
  { id: "approved", label: "Approved", icon: CheckCircle2, color: "success" },
  { id: "in_production", label: "In Production", icon: Clapperboard, color: "accent" },
  { id: "published", label: "Published", icon: Rocket, color: "primary" },
];

export default function ApprovalBoard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const { getResearchHistory } = require("@/lib/storage");
      setItems(getResearchHistory());
    } catch {}
  }, []);

  const updateStatus = (id, status) => {
    try {
      const { updateResearchStatus, getResearchHistory } = require("@/lib/storage");
      updateResearchStatus(id, status);
      setItems(getResearchHistory());
    } catch {}
  };

  const updateDate = (id, date) => {
    try {
      const { updateResearchDate, getResearchHistory } = require("@/lib/storage");
      updateResearchDate(id, date);
      setItems(getResearchHistory());
    } catch {}
  };

  const getItemsByStage = (stage) => items.filter((i) => (i.status || "pending") === stage);

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-txt flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary" /> Approval Board</h3>
        <span className="text-[11px] text-txt-muted">{items.length} total items</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 animate-float"><FileText className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-txt mb-1">No research yet</h3>
          <p className="text-sm text-txt-muted">Run your first R&D pipeline to see items here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="kanban-col">
              <div className="flex items-center gap-2 mb-3">
                <stage.icon className={`w-4 h-4 text-${stage.color}`} />
                <h4 className="text-xs font-bold text-txt">{stage.label}</h4>
                <span className="ml-auto text-[10px] text-txt-muted bg-bg-elevated px-2 py-0.5 rounded-full">
                  {getItemsByStage(stage.id).length}
                </span>
              </div>

              <div className="space-y-2">
                {getItemsByStage(stage.id).map((item) => (
                  <div key={item.id} className="kanban-card p-3 rounded-xl bg-bg-card border border-border">
                    <p className="text-xs font-semibold text-txt mb-1 line-clamp-2">{item.keyword}</p>
                    <p className="text-[10px] text-txt-muted mb-2 flex items-center justify-between">
                      <span>{item.location || "IN"} • {item.depth || "deep"} • {new Date(item.savedAt).toLocaleDateString()}</span>
                      {(stage.id === "approved" || stage.id === "in_production") && (
                        <input type="date" value={item.scheduledDate || ""} onChange={(e) => updateDate(item.id, e.target.value)}
                          className="bg-bg-elevated border border-border rounded px-1.5 py-0.5 text-[9px] text-txt-secondary cursor-pointer" title="Schedule Date" />
                      )}
                    </p>

                    {item.research?.recommendedStrategy && (
                      <p className="text-[10px] text-primary-hover mb-2 italic line-clamp-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 shrink-0" /> <span className="truncate">{item.research.recommendedStrategy.bestAngle}</span>
                      </p>
                    )}

                    <div className="flex gap-1 flex-wrap">
                      {stage.id !== "approved" && (
                        <button onClick={() => updateStatus(item.id, "approved")}
                          className="px-2 py-1 rounded text-[9px] font-bold bg-success/15 text-success border border-success/20 cursor-pointer hover:bg-success/25 transition-all flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Approve
                        </button>
                      )}
                      {stage.id === "approved" && (
                        <button onClick={() => updateStatus(item.id, "in_production")}
                          className="px-2 py-1 rounded text-[9px] font-bold bg-accent/15 text-accent-hover border border-accent/20 cursor-pointer hover:bg-accent/25 transition-all flex items-center gap-1">
                          <Clapperboard className="w-2.5 h-2.5" /> To Production
                        </button>
                      )}
                      {stage.id === "in_production" && (
                        <button onClick={() => updateStatus(item.id, "published")}
                          className="px-2 py-1 rounded text-[9px] font-bold bg-primary-muted text-primary-hover border border-primary/20 cursor-pointer hover:bg-primary/25 transition-all flex items-center gap-1">
                          <Rocket className="w-2.5 h-2.5" /> Publish
                        </button>
                      )}
                      {stage.id === "pending" && (
                        <button onClick={() => updateStatus(item.id, "rejected")}
                          className="px-2 py-1 rounded text-[9px] font-bold bg-danger/15 text-danger border border-danger/20 cursor-pointer hover:bg-danger/25 transition-all flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
