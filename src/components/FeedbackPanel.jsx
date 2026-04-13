"use client";

import { useState, useEffect } from "react";
import {
  simulatePerformance,
  calculateAccuracy,
  recordFeedback,
  getRollingStats,
} from "@/lib/feedback";

export default function FeedbackPanel({ quality, contentId }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [actualData, setActualData] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [rollingStats, setRollingStats] = useState(null);

  useEffect(() => {
    setRollingStats(getRollingStats());
  }, []);

  const handleSimulate = (timeframe) => {
    const simulated = simulatePerformance(quality, timeframe);
    const acc = calculateAccuracy(quality, simulated);
    recordFeedback(contentId || `sim_${Date.now()}`, quality, simulated, acc);
    
    setSelectedTimeframe(timeframe);
    setActualData(simulated);
    setAccuracy(acc);
    setRollingStats(getRollingStats());
  };

  const getAccuracyColor = (val) => {
    if (val >= 75) return "text-green-400";
    if (val >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getDeltaIcon = (val) => {
    if (val > 0) return { icon: "▲", color: "text-green-400", label: "Over-performed" };
    if (val < 0) return { icon: "▼", color: "text-red-400", label: "Under-performed" };
    return { icon: "─", color: "text-text-muted", label: "On target" };
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <span>🔄</span> Feedback Loop
        </h4>
        {rollingStats && rollingStats.totalEntries > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light font-semibold">
            Lifetime Accuracy: {rollingStats.avgAccuracy}%
          </span>
        )}
      </div>

      {/* Simulate Buttons */}
      <div className="flex gap-2">
        {["24h", "72h", "168h"].map((tf) => (
          <button
            key={tf}
            onClick={() => handleSimulate(tf)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTimeframe === tf
                ? "bg-primary/20 text-primary-light border border-primary/30"
                : "bg-surface-hover text-text-muted hover:text-text-secondary border border-border"
            }`}
          >
            Simulate {tf === "168h" ? "7d" : tf}
          </button>
        ))}
      </div>

      {/* Results */}
      {actualData && accuracy && (
        <div className="space-y-3 animate-fade-in">
          {/* Accuracy Badge */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-border">
            <div className={`text-2xl font-black ${getAccuracyColor(accuracy.overallAccuracy)}`}>
              {accuracy.overallAccuracy}%
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Prediction Accuracy</p>
              <p className="text-[10px] text-text-muted">
                Based on {selectedTimeframe === "168h" ? "7-day" : selectedTimeframe} simulated performance
              </p>
            </div>
          </div>

          {/* Predicted vs Actual Table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-hover">
                  <th className="text-left px-3 py-2 text-text-muted font-semibold">Metric</th>
                  <th className="text-right px-3 py-2 text-text-muted font-semibold">Predicted</th>
                  <th className="text-right px-3 py-2 text-text-muted font-semibold">Actual</th>
                  <th className="text-right px-3 py-2 text-text-muted font-semibold">Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Views</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">
                    {quality.predictions?.views || "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">
                    {actualData.views.toLocaleString()}
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${getDeltaIcon(accuracy.viewDelta).color}`}>
                    {getDeltaIcon(accuracy.viewDelta).icon} {Math.abs(accuracy.viewDelta).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Engagement</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">
                    {quality.predictions?.engagementRate || "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">
                    {actualData.engagementRate}%
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${getDeltaIcon(accuracy.engDelta).color}`}>
                    {getDeltaIcon(accuracy.engDelta).icon} {Math.abs(accuracy.engDelta)}%
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Likes</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">{actualData.likes.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Comments</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">{actualData.comments.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Shares</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">{actualData.shares.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-text-secondary">Saves</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                  <td className="px-3 py-2 text-right text-text-primary font-medium">{actualData.saves.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-text-muted">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sub-accuracy breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-surface-hover border border-border text-center">
              <p className="text-[10px] text-text-muted">View Accuracy</p>
              <p className={`text-lg font-black ${getAccuracyColor(accuracy.viewAccuracy)}`}>
                {accuracy.viewAccuracy}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-hover border border-border text-center">
              <p className="text-[10px] text-text-muted">Engagement Accuracy</p>
              <p className={`text-lg font-black ${getAccuracyColor(accuracy.engagementAccuracy)}`}>
                {accuracy.engagementAccuracy}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rolling Stats */}
      {rollingStats && rollingStats.totalEntries > 0 && (
        <div className="p-3 rounded-lg bg-surface-hover/50 border border-border/50">
          <p className="text-[10px] font-bold text-text-muted mb-1.5">ROLLING MODEL STATS (last 10)</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs font-black text-text-primary">{rollingStats.avgAccuracy}%</p>
              <p className="text-[9px] text-text-muted">Avg Accuracy</p>
            </div>
            <div>
              <p className="text-xs font-black text-text-primary">{rollingStats.totalEntries}</p>
              <p className="text-[9px] text-text-muted">Data Points</p>
            </div>
            <div>
              <p className={`text-xs font-black ${
                rollingStats.trend === "improving" ? "text-green-400" :
                rollingStats.trend === "declining" ? "text-red-400" : "text-text-primary"
              }`}>
                {rollingStats.trend === "improving" ? "📈 Up" :
                 rollingStats.trend === "declining" ? "📉 Down" : "➡️ Stable"}
              </p>
              <p className="text-[9px] text-text-muted">Trend</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
