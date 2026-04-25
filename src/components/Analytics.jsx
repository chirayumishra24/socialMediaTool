"use client";

import { useState, useEffect } from "react";
import { BarChart as BarChartIcon, Search, CheckCircle2, Clapperboard, Rocket, TrendingUp, Users, Clock, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

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

  if (!stats) return <div className="p-20 text-center text-txt-muted animate-pulse">Initializing Executive Dashboard...</div>;

  // Prepare data for Chart 1: Content by Platform
  const platformData = [
    { name: "YouTube", value: stats.content?.filter(c => c.metadata?.platforms?.includes('youtube')).length || 0, color: "#EF4444" },
    { name: "Instagram", value: stats.content?.filter(c => c.metadata?.platforms?.includes('instagram')).length || 0, color: "#E1306C" },
    { name: "Twitter/X", value: stats.content?.filter(c => c.metadata?.platforms?.includes('twitter') || c.metadata?.platforms?.includes('x')).length || 0, color: "#1DA1F2" },
    { name: "LinkedIn", value: stats.content?.filter(c => c.metadata?.platforms?.includes('linkedin')).length || 0, color: "#0A66C2" },
  ].filter(d => d.value > 0);

  // Prepare data for Chart 2: Pipeline Velocity (Research vs Approved vs Published)
  const velocityData = [
    { stage: "Research", count: stats.totalResearch },
    { stage: "Approved", count: stats.approved },
    { stage: "Published", count: stats.published },
  ];

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
        <AnalyticCard icon={<CheckCircle2 className="w-5 h-5" />} label="Quality Score" value="94%" color="text-success" />
        <AnalyticCard icon={<Clapperboard className="w-5 h-5" />} label="Assets Ready" value={stats.totalContent} color="text-warning" />
        <AnalyticCard icon={<Rocket className="w-5 h-5" />} label="Market Reach" value={`${(stats.published * 1.2).toFixed(1)}k`} color="text-primary" />
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
              <Globe className="w-4 h-4 text-primary" /> Platform Distribution
            </h4>
            <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">Content Strategy</span>
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
                  <span className="text-[10px] font-medium text-txt-muted ml-auto">{Math.round((d.value / stats.totalContent) * 100)}%</span>
                </div>
              ))}
            </div>
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
              {[...stats.research?.slice(0, 5).map((r) => ({ ...r, type: "research" })) || [], ...stats.content?.slice(0, 5).map((c) => ({ ...c, type: "content" })) || []]
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
