"use client";

import { BarChart as BarChartIcon, Search, MousePointerClick, Clapperboard, Rocket, TrendingUp, Users, Clock, Globe, Hash, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useContentHistory, usePerformanceInsights, useResearchHistory, useStats } from "@/lib/storage";

export default function Analytics() {
  const stats = useStats();
  const content = useContentHistory();
  const research = useResearchHistory();
  const performance = usePerformanceInsights();

  if (!stats) return <div className="p-20 text-center text-txt-muted animate-pulse">Initializing Executive Dashboard...</div>;

  const colors = ["#EF4444", "#E1306C", "#1DA1F2", "#0A66C2", "#8B5CF6"];
  const platformData = performance.platformPerformance.map((item, index) => ({
    name: item.platform,
    value: item.totalClicks,
    color: colors[index % colors.length],
  })).filter((item) => item.value > 0);

  const velocityData = [
    { stage: "Research", count: stats.totalResearch },
    { stage: "Approved", count: stats.approved },
    { stage: "Published", count: stats.published },
  ];
  const tagData = performance.topTags.slice(0, 6).map((item) => ({
    tag: item.tag,
    clicks: item.totalClicks,
    posts: item.posts,
  }));

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h3 className="text-2xl font-bold text-txt tracking-tight flex items-center gap-2">
            <BarChartIcon className="w-6 h-6 text-primary" strokeWidth={2.5} /> Executive Intelligence
          </h3>
          <p className="text-sm text-txt-muted font-medium">Measuring impact and pipeline health across the educational ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-bg-elevated border border-border text-[10px] font-bold text-txt-secondary uppercase tracking-widest">
            Last 30 Days
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnalyticCard icon={<Search className="w-5 h-5" />} label="R&D Cycles" value={stats.totalResearch} color="text-accent" />
        <AnalyticCard icon={<MousePointerClick className="w-5 h-5" />} label="Tracked Clicks" value={stats.totalClicks || 0} color="text-success" />
        <AnalyticCard icon={<Eye className="w-5 h-5" />} label="Tracked Views" value={stats.totalViews || 0} color="text-warning" />
        <AnalyticCard icon={<Rocket className="w-5 h-5" />} label="Avg CTR" value={`${performance.totals.avgCtr || 0}%`} color="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Chart */}
        <div className="rounded-2xl bg-bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" /> Pipeline Velocity
            </h4>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Conversion Flow</span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: 'var(--txt-muted)'}} dy={10} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}
                  cursor={{fill: 'var(--bg-elevated)', opacity: 0.4}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {velocityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--primary)' : index === 1 ? 'var(--success)' : 'var(--accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Pie */}
        <div className="rounded-2xl bg-bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Clicks by Platform
            </h4>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Tracked Posts</span>
          </div>
          <div className="h-[240px] w-full flex items-center">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 pl-6">
              {platformData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}} />
                  <span className="text-xs font-bold text-txt">{d.name}</span>
                  <span className="text-[10px] font-medium text-txt-muted ml-auto">{d.value} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">
              <Hash className="w-4 h-4 text-accent" /> Tag Lift
            </h4>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Posts using each tag</span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--txt-muted)" }} />
                <YAxis type="category" dataKey="tag" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--txt-muted)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}
                  formatter={(value, _name, props) => [`${value} clicks`, `${props.payload.posts} post(s)`]}
                />
                <Bar dataKey="clicks" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" /> Top Performing Posts
            </h4>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Learning inputs</span>
          </div>
          <div className="space-y-3">
            {performance.topContent.length > 0 ? performance.topContent.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-bg-elevated/30 border border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-txt">{item.keyword}</p>
                    <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mt-1">{item.format}</p>
                  </div>
                  {item.publishedUrl && (
                    <a href={item.publishedUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                      Open
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <MiniMetric label="Views" value={item.views} />
                  <MiniMetric label="Clicks" value={item.clicks} />
                  <MiniMetric label="CTR" value={`${item.ctr}%`} />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-primary/5 text-primary border border-primary/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center text-sm text-txt-muted">
                No tracked published posts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl bg-bg-card border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between bg-bg-elevated/30">
          <h4 className="text-sm font-bold text-txt">Recent Activity Stream</h4>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline cursor-pointer">Export Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg-elevated/10">
                <th className="px-6 py-4 text-[10px] font-bold text-txt-muted uppercase tracking-widest">Source / Topic</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-muted uppercase tracking-widest">Stage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-muted uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-muted uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[...research.slice(0, 5).map((r) => ({ ...r, type: "research" })), ...content.slice(0, 5).map((c) => ({ ...c, type: "content" }))]
                .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                .slice(0, 8)
                .map((item, i) => (
                  <tr key={i} className="hover:bg-bg-elevated/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                          {item.type === "research" ? <Search className="w-4 h-4 text-accent" /> : <Clapperboard className="w-4 h-4 text-warning" />}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-xs font-bold text-txt truncate">{item.keyword || item.metadata?.keyword || "Untitled Project"}</p>
                          <p className="text-[10px] text-txt-muted capitalize">{item.type} Strategy</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-txt-muted" />
                        <span className="text-[10px] font-bold text-txt-secondary">{item.metadata?.format || item.depth || "Standard"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-txt-muted">
                      {new Date(item.savedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight ${
                        item.status === "approved" ? "bg-success/10 text-success" : 
                        item.status === "published" ? "bg-primary/10 text-primary" : 
                        "bg-bg-elevated text-txt-muted border border-border/50"
                      }`}>
                        {item.status || "draft"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticCard({ icon, label, value, color }) {
  return (
    <div className="p-6 rounded-2xl bg-bg-card border border-border group hover:border-primary/20 transition-all shadow-sm">
      <div className={`mb-3 w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-3xl font-bold text-txt tracking-tight">{value}</p>
      <p className="text-[11px] font-bold text-txt-muted uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-border/60">
      <p className="text-[9px] font-black text-txt-muted uppercase tracking-wider">{label}</p>
      <p className="text-sm font-black text-txt mt-1">{value}</p>
    </div>
  );
}
