"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Heart,
  Eye,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  AlertTriangle,
  Zap,
  Calendar,
  MessageCircle,
  Share2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const PLATFORM_COLORS = {
  instagram: { primary: "#E1306C", gradient: "from-pink-500 to-purple-600", bg: "bg-pink-50", text: "text-pink-700" },
  facebook: { primary: "#1877F2", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50", text: "text-blue-700" },
};

export default function MetaDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("week");
  const [error, setError] = useState("");

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/meta/insights?period=${period}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-sm text-slate-500 font-semibold">Loading Meta insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Unable to Load Insights</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchData()}
          className="mt-4 px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data?.platforms?.length) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center">
        <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Platforms Connected</h3>
        <p className="text-sm text-slate-500 mt-2">
          Connect your Meta account in Settings → Meta Connect to see live analytics.
        </p>
      </div>
    );
  }

  const { platforms, aggregate, comparison } = data;

  // Chart data
  const engagementByPlatform = platforms.map((p) => ({
    name: p.platform === "instagram" ? "Instagram" : "Facebook",
    engagement: p.metrics?.totalEngagement || 0,
    followers: p.followers || 0,
    rate: p.metrics?.engagementRate || 0,
    fill: PLATFORM_COLORS[p.platform]?.primary || "#6366f1",
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { value: "day", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "days_28", label: "28 Days" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Sync
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Total Followers"
          value={formatNumber(aggregate.totalFollowers)}
          gradient="from-blue-500 to-cyan-500"
        />
        <KPICard
          icon={Heart}
          label="Total Engagement"
          value={formatNumber(aggregate.totalEngagement)}
          gradient="from-pink-500 to-rose-500"
        />
        <KPICard
          icon={TrendingUp}
          label="Avg Engagement Rate"
          value={`${aggregate.avgEngagementRate}%`}
          gradient="from-emerald-500 to-teal-500"
        />
        <KPICard
          icon={Calendar}
          label="Recent Posts"
          value={aggregate.totalPosts}
          gradient="from-purple-500 to-indigo-500"
        />
      </div>

      {/* Platform Comparison */}
      {comparison && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <h3 className="text-sm font-black text-slate-800 mb-4">Platform Comparison</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementByPlatform} barGap={12}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="followers" name="Followers" radius={[8, 8, 0, 0]} fill="#6366f1" />
                <Bar dataKey="engagement" name="Engagement" radius={[8, 8, 0, 0]} fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-Platform Sections */}
      {platforms.map((platform) => (
        <PlatformSection key={platform.platform} platform={platform} />
      ))}
    </div>
  );
}

// ─── KPI Card Component ────────────────────────────────────────

function KPICard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 relative overflow-hidden group hover:shadow-lg transition-all">
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Platform Section ──────────────────────────────────────────

function PlatformSection({ platform }) {
  const colors = PLATFORM_COLORS[platform.platform] || PLATFORM_COLORS.instagram;
  const platformLabel = platform.platform === "instagram" ? "Instagram" : "Facebook";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
      {/* Platform Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${colors.gradient} flex items-center justify-center text-white shadow-md`}>
            <span className="text-xs font-bold">{platform.platform === "instagram" ? "IG" : "FB"}</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">{platformLabel}</h3>
            <p className="text-xs text-slate-400 font-semibold">
              @{platform.accountName} • {formatNumber(platform.followers)} followers
            </p>
          </div>
        </div>
        {platform.metrics?.engagementRate > 0 && (
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors.bg} ${colors.text}`}>
            {platform.metrics.engagementRate}% ER
          </span>
        )}
      </div>

      {/* Top Content */}
      {platform.topContent?.length > 0 && (
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Top Performing</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {platform.topContent.map((post, i) => (
              <div
                key={post.id || i}
                className="bg-slate-50 rounded-2xl p-4 hover:bg-slate-100 transition-all group"
              >
                {post.thumbnail && (
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-slate-200">
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <p className="text-[11px] text-slate-600 font-semibold line-clamp-2 mb-2">
                  {post.caption || post.message || "No caption"}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {formatNumber(post.likes || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {formatNumber(post.comments || 0)}
                  </span>
                  {post.shares > 0 && (
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> {formatNumber(post.shares)}
                    </span>
                  )}
                </div>
                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-[10px] text-indigo-500 font-bold hover:text-indigo-700"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {platform.recentPosts?.length > 0 && (
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
            Recent Activity ({platform.recentPosts.length} posts)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
            {platform.recentPosts.slice(0, 6).map((post, i) => (
              <div key={post.id || i} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-all">
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-semibold truncate">
                    {post.caption || post.message || "No caption"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {post.contentType} • {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-700">{formatNumber(post.likes || 0)} ❤️</p>
                  <p className="text-[10px] text-slate-400">{formatNumber(post.comments || 0)} 💬</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}
