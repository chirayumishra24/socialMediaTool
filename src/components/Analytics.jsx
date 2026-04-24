"use client";

import { useState, useEffect } from "react";

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    try {
      const { getStats, getContentHistory, getResearchHistory } = require("@/lib/storage");
      const s = getStats();
      const content = getContentHistory();
      const research = getResearchHistory();
      setStats({ ...s, content, research });
    } catch {}
  }, []);

  if (!stats) return <div className="p-5 text-center text-txt-muted">Loading analytics...</div>;

  const formatDist = {};
  stats.content?.forEach((c) => {
    const f = c.metadata?.format || c.format || "unknown";
    formatDist[f] = (formatDist[f] || 0) + 1;
  });

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <h3 className="text-sm font-bold text-txt flex items-center gap-2">📊 Analytics</h3>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnalyticCard icon="🔬" label="Total Research" value={stats.totalResearch} />
        <AnalyticCard icon="✅" label="Approved" value={stats.approved} />
        <AnalyticCard icon="🎬" label="Content Created" value={stats.totalContent} />
        <AnalyticCard icon="🚀" label="Published" value={stats.published} />
      </div>

      {/* Format Distribution */}
      {Object.keys(formatDist).length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-5">
          <h4 className="text-sm font-bold text-txt mb-3">Content Format Distribution</h4>
          <div className="space-y-2">
            {Object.entries(formatDist).sort((a, b) => b[1] - a[1]).map(([format, count]) => {
              const pct = Math.round((count / stats.totalContent) * 100);
              return (
                <div key={format} className="flex items-center gap-3">
                  <span className="text-xs text-txt-secondary w-32 truncate capitalize">{format.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
                    <div className="h-full rounded-full grad-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-txt-muted w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-xl bg-bg-card border border-border p-5">
        <h4 className="text-sm font-bold text-txt mb-3">Recent Activity</h4>
        {stats.content?.length === 0 && stats.research?.length === 0 ? (
          <p className="text-xs text-txt-muted">No activity yet. Start by running an R&D pipeline or generating content.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scroll">
            {[...stats.research?.slice(0, 5).map((r) => ({ ...r, type: "research" })) || [], ...stats.content?.slice(0, 5).map((c) => ({ ...c, type: "content" })) || []]
              .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
              .slice(0, 10)
              .map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-bg-elevated">
                  <span className="text-sm">{item.type === "research" ? "🔬" : "🎬"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-txt truncate">{item.keyword || item.metadata?.keyword || "Untitled"}</p>
                    <p className="text-[10px] text-txt-muted">{item.type} • {new Date(item.savedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.status === "approved" ? "bg-success/15 text-success" : item.status === "published" ? "bg-primary-muted text-primary-hover" : "bg-bg-card-hover text-txt-muted"}`}>
                    {item.status || "draft"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticCard({ icon, label, value }) {
  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold text-txt mt-1">{value}</p>
      <p className="text-[11px] text-txt-muted">{label}</p>
    </div>
  );
}
