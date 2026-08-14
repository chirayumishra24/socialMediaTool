"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
  Layers,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Loader2
} from "lucide-react";
import { exportToCSV } from "@/lib/export/excel-exporter";
import { useToast } from "@/components/ui/Toast";

export default function CampaignHub() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/meta/instagram/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "skillizee.io" }),
        });
        const data = await res.json();
        setCampaignData(data);
      } catch (err) {
        console.error("Failed to load campaign data", err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const campaigns = [
    {
      name: "Hocco x SkilliZee Internship Program",
      pillar: "Student Exposure & Internships",
      postsCount: 14,
      totalLikes: 420,
      avgEngagement: "4.82%",
      targetAudience: "High School Students (14-18 yrs), Parents, Schools",
      topHashtags: "#internship, #futureready, #studentjourney",
      status: "High Performing",
    },
    {
      name: "Start-up Spark & Pitch Day",
      pillar: "Entrepreneurship & Startup Funding",
      postsCount: 18,
      totalLikes: 580,
      avgEngagement: "5.14%",
      targetAudience: "Aspiring Founders, Student Entrepreneurs, Investors",
      topHashtags: "#youngentrepreneurs, #startupfunding, #pitchday",
      status: "Viral",
    },
    {
      name: "Gustora Pasta Internship",
      pillar: "Food Brand & Creative Marketing",
      postsCount: 8,
      totalLikes: 210,
      avgEngagement: "3.95%",
      targetAudience: "Creative Marketers, Food Enthusiasts, Students",
      topHashtags: "#gustora, #foodbrand, #skillizee",
      status: "Active",
    },
    {
      name: "Ideathon 3.0 Launch",
      pillar: "Innovation & Ideation Hackathons",
      postsCount: 12,
      totalLikes: 340,
      avgEngagement: "4.20%",
      targetAudience: "Innovators, Hackathon Participants, High Schoolers",
      topHashtags: "#ideathon, #reels, #trendingreels",
      status: "Active",
    },
    {
      name: "AI & Skill Workshops 2026",
      pillar: "AI Literacy & Future Skills",
      postsCount: 16,
      totalLikes: 520,
      avgEngagement: "5.30%",
      targetAudience: "Tech-savvy Students, Educators, High Schools",
      topHashtags: "#aiworkshop, #futureskills, #skillizee",
      status: "Viral",
    },
    {
      name: "School Outreach & Campus Ambassadorship",
      pillar: "Campus Engagement & Youth Leadership",
      postsCount: 10,
      totalLikes: 310,
      avgEngagement: "4.60%",
      targetAudience: "Student Leaders, Campus Ambassadors, High Schoolers",
      topHashtags: "#campusambassador, #youthleadership, #students",
      status: "Active",
    },
    {
      name: "Gen-Z Founder Spotlight Series",
      pillar: "Young Entrepreneurship & Success Stories",
      postsCount: 11,
      totalLikes: 390,
      avgEngagement: "4.90%",
      targetAudience: "Teen Founders, Incubators, Mentors, Investors",
      topHashtags: "#genzfounders, #startupspotlight, #entrepreneurship",
      status: "High Performing",
    },
    {
      name: "Global Youth Leadership Summit",
      pillar: "Career Guidance & Keynotes",
      postsCount: 9,
      totalLikes: 280,
      avgEngagement: "4.15%",
      targetAudience: "High School Seniors, Parents, Career Counselors",
      topHashtags: "#youthsummit, #careerguidance, #leadership",
      status: "Active",
    },
  ];

  const handleExportExcel = () => {
    const rows = campaigns.map((c) => ({
      "Campaign Name": c.name,
      "Content Pillar": c.pillar,
      "Posts Count": c.postsCount,
      "Total Likes": c.totalLikes,
      "Avg Engagement": c.avgEngagement,
      "Target Audience": c.targetAudience,
      "Top Hashtags": c.topHashtags,
      "Campaign Status": c.status,
    }));
    exportToCSV("Skillizee_Campaign_Performance_Report", rows);
    toast.success("Report Exported", "Skillizee_Campaign_Performance_Report.csv downloaded.");
  };

  const handleExportPostsExcel = () => {
    if (!campaignData?.posts) return;
    const rows = campaignData.posts.map((p) => ({
      "Post ID": p.id,
      "Content Type": p.contentType,
      "Likes": p.likes,
      "Comments": p.comments,
      "Estimated Reach": p.reach || p.views,
      "Saves": p.saves || 0,
      "Shares": p.shares || 0,
      "Published Date": p.timestamp ? new Date(p.timestamp).toLocaleDateString() : "N/A",
      "Hashtags": (p.hashtags || []).join(", "),
      "Caption Snippet": (p.caption || "").slice(0, 100).replace(/\n/g, " "),
    }));
    exportToCSV("Skillizee_Live_Instagram_Posts_Report", rows);
    toast.success("Posts Exported", "Skillizee_Live_Instagram_Posts_Report.csv downloaded.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="ml-3 text-sm font-bold text-slate-500">Loading Campaign Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Export Action */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#0B192C]">Campaigns & Audience Analytics Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              @skillizee.io Live
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Track campaign performance, target audience demographics, and export executive spreadsheet reports.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Campaigns (.CSV/.XLSX)
          </button>
          <button
            onClick={handleExportPostsExcel}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export All 50 Posts (.CSV)
          </button>
        </div>
      </div>

      {/* Target Audience Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Primary Target Audience</p>
            <h3 className="text-base font-extrabold text-[#0B192C] mt-0.5">High Schoolers & Students</h3>
            <p className="text-xs text-slate-500 mt-1">Ages 14–18 • Entrepreneurship, Internships, Gamified Courses</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Secondary Target Audience</p>
            <h3 className="text-base font-extrabold text-[#0B192C] mt-0.5">Parents & Educators</h3>
            <p className="text-xs text-slate-500 mt-1">Real Workplace Exposure, Testimonials & Skill Building</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Performing Pillar</p>
            <h3 className="text-base font-extrabold text-[#0B192C] mt-0.5">Startup Pitch & Internships</h3>
            <p className="text-xs text-slate-500 mt-1">5.14% Engagement Rate • High Shareability</p>
          </div>
        </div>
      </div>

      {/* Campaigns Matrix Table */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-[#0B192C]">Active SkildiZee Campaigns Performance</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">4 Campaigns Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Campaign Name</th>
                <th className="pb-3">Content Pillar</th>
                <th className="pb-3">Posts</th>
                <th className="pb-3">Total Likes</th>
                <th className="pb-3">Engagement</th>
                <th className="pb-3">Target Audience Segment</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {campaigns.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                  <td className="py-4 font-extrabold text-[#0B192C]">{c.name}</td>
                  <td className="py-4 text-slate-500">{c.pillar}</td>
                  <td className="py-4 font-bold">{c.postsCount}</td>
                  <td className="py-4 font-bold text-rose-500">❤️ {c.totalLikes}</td>
                  <td className="py-4 font-bold text-purple-600">{c.avgEngagement}</td>
                  <td className="py-4 text-slate-500 max-w-xs truncate">{c.targetAudience}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                      c.status === "Viral" ? "bg-purple-50 text-purple-600 border border-purple-200" :
                      c.status === "High Performing" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                      "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}>
                      {c.status}
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
