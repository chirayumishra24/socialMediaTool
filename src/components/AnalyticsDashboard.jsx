"use client";

import { useState, useEffect } from "react";
import { getStats, getHistory } from "@/lib/storage";
import { getRollingStats } from "@/lib/feedback";
import dynamic from "next/dynamic";

// Dynamic import for Recharts (client-only)
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

const FORMAT_LABELS = {
  youtube_longform: "YT Long",
  youtube_short: "YT Short",
  instagram_reel: "IG Reel",
  instagram_carousel: "IG Carousel",
};

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
    setHistory(getHistory());
    setFeedbackStats(getRollingStats());
  }, []);

  if (!mounted) return null;

  const qualityTrend = history
    .slice(0, 20)
    .reverse()
    .map((item, idx) => ({
      name: `#${idx + 1}`,
      score: item.quality?.score || 0,
      niche: item.niche?.substring(0, 15),
    }));

  const formatData = Object.entries(stats?.byFormat || {}).map(([key, value]) => ({
    name: FORMAT_LABELS[key] || key,
    value,
  }));

  const platformData = Object.entries(stats?.byPlatform || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  const feedbackChartData = (feedbackStats?.recentEntries || []).map((entry, idx) => ({
    name: `#${idx + 1}`,
    accuracy: entry.accuracy?.overallAccuracy || 0,
    viewAcc: entry.accuracy?.viewAccuracy || 0,
    engAcc: entry.accuracy?.engagementAccuracy || 0,
  }));

  const topContent = [...history]
    .sort((a, b) => (b.quality?.score || 0) - (a.quality?.score || 0))
    .slice(0, 5);

  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnalyticsStatCard
          icon="📊"
          label="Total Generated"
          value={stats?.total || 0}
          sub={`${stats?.thisWeek || 0} this week`}
          color="primary"
        />
        <AnalyticsStatCard
          icon="✅"
          label="Published"
          value={stats?.byStatus?.published || 0}
          sub={`${stats?.byStatus?.draft || 0} drafts`}
          color="success"
        />
        <AnalyticsStatCard
          icon="⭐"
          label="Avg Quality"
          value={stats?.avgQuality || 0}
          sub="out of 100"
          color="accent"
        />
        <AnalyticsStatCard
          icon="🎯"
          label="Prediction Accuracy"
          value={`${feedbackStats?.avgAccuracy || 0}%`}
          sub={feedbackStats?.trend === "improving" ? "↑ Improving" : feedbackStats?.trend === "declining" ? "↓ Declining" : "→ Stable"}
          color="danger"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quality Score Trend */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>📈</span> Quality Score Trend
          </h4>
          {qualityTrend.length > 0 ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Generate content to see quality trends" />
          )}
        </div>

        {/* Prediction Accuracy Trend */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>🎯</span> Prediction Accuracy
          </h4>
          {feedbackChartData.length > 0 ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={feedbackChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="viewAcc" name="Views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engAcc" name="Engagement" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Use the Feedback panel to simulate performance" />
          )}
        </div>

        {/* Format Distribution */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>🎬</span> Format Distribution
          </h4>
          {formatData.length > 0 ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {formatData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Generate content to see format breakdown" />
          )}
        </div>

        {/* Platform Distribution */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>📱</span> Platform Distribution
          </h4>
          {platformData.length > 0 ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {platformData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Generate content to see platform breakdown" />
          )}
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span>🏆</span> Top Performing Content
        </h4>
        {topContent.length > 0 ? (
          <div className="space-y-2">
            {topContent.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-hover border border-border/50 hover:border-primary/20 transition-all"
              >
                <span className="text-lg min-w-[28px] text-center">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {FORMAT_LABELS[item.format] || item.format} • {item.platform} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${
                    (item.quality?.score || 0) >= 75 ? "text-green-400" :
                    (item.quality?.score || 0) >= 50 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {item.quality?.score || 0}
                  </span>
                  <p className="text-[9px] text-text-muted">/100</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted text-center py-8">
            No content generated yet. Start creating to see your top performers!
          </p>
        )}
      </div>
    </div>
  );
}

function AnalyticsStatCard({ icon, label, value, sub, color }) {
  const colors = {
    primary: "border-primary/20 bg-primary/5",
    accent: "border-accent/20 bg-accent/5",
    danger: "border-danger/20 bg-danger/5",
    success: "border-success/20 bg-success/5",
  };

  return (
    <div className={`p-3.5 rounded-xl border ${colors[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-[220px] text-text-muted text-xs">
      {message}
    </div>
  );
}
