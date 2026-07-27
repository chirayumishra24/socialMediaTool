"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  Zap,
  Bookmark,
  Calendar,
  Sparkles,
  Trash2,
  FileText,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useContentHistory, usePerformanceInsights, useResearchHistory, useSettingsSnapshot, useStats, useSavedStrategies, deleteStrategy } from "@/lib/storage";

export default function Dashboard({ onNavigate, onStartResearch, onGoToStudio }) {
  const { user } = useAuth();
  const stats = useStats();
  const settings = useSettingsSnapshot();
  const researchHistory = useResearchHistory();
  const contentHistory = useContentHistory();
  const performance = usePerformanceInsights();
  const [metaStatus, setMetaStatus] = useState(null);
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    fetch("/api/meta/status")
      .then((res) => res.json())
      .then((data) => setMetaStatus(data))
      .catch(() => {});

    fetch("/api/meta/instagram/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "skillizee.io" }),
    })
      .then((res) => res.json())
      .then((data) => setLiveData(data))
      .catch(() => {});
  }, []);

  // Real word cloud data from @skillizee.io hashtags
  const words = useMemo(() => {
    if (!liveData?.posts) {
      return [
        { text: "#skillizee", size: "text-2xl", color: "text-[#6366f1] font-black" },
        { text: "#youngentrepreneurs", size: "text-lg md:text-xl", color: "text-purple-500 font-bold" },
        { text: "#internship", size: "text-base md:text-lg", color: "text-emerald-500 font-extrabold" },
        { text: "#futureready", size: "text-sm", color: "text-indigo-400 font-semibold" },
        { text: "#startupfunding", size: "text-xs", color: "text-rose-400 opacity-80" },
      ];
    }
    const tagMap = {};
    liveData.posts.forEach((p) => {
      (p.hashtags || []).forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    const colors = [
      "text-[#6366f1] font-black text-2xl",
      "text-purple-500 font-bold text-lg",
      "text-emerald-500 font-extrabold text-base",
      "text-indigo-500 font-semibold text-sm",
      "text-rose-400 font-bold text-xs",
    ];
    return Object.entries(tagMap)
      .slice(0, 10)
      .map(([text], i) => ({
        text,
        color: colors[i % colors.length],
        size: "",
      }));
  }, [liveData]);

  // Editor states
  const [editorText, setEditorText] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."
  );
  const [editorTab, setEditorTab] = useState("text");
  const [optimizationStatus, setOptimizationStatus] = useState("idle");

  const handleOptimize = () => {
    setOptimizationStatus("optimizing");
    setTimeout(() => {
      setEditorText((prev) => prev + " ✨ Optimized with high-engagement keywords and emotional hooks for higher CTR.");
      setOptimizationStatus("completed");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Meta Quick Connect Banner */}
      {metaStatus && !metaStatus.connected && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              Maximize Your Reach with Meta API
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Connect Instagram and Facebook to enable one-click publishing, AI strategy recommendations, and live content metrics directly in your calendar.
            </p>
          </div>
          <button
            onClick={() => onNavigate("settings")}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-100 shrink-0 cursor-pointer"
          >
            Connect Account
          </button>
        </div>
      )}

      {metaStatus?.connected && (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black shadow-inner">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Connected to Meta Channels</h4>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Instagram: @{metaStatus.instagram?.username || "—"} • Facebook: {metaStatus.facebook?.pageName || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("analytics")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            View Live Insights
          </button>
        </div>
      )}

      {/* Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* CARD 1: AI Trend Discovery */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-[#0B192C]">AI Trend Discovery</h3>
            <button className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-100 hover:shadow-sm cursor-pointer uppercase tracking-wider">
              Dynamic
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trend Chart (Line chart simulation with SVG) */}
          <div className="h-32 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="chart1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="chart2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area 1 */}
              <path d="M 0 35 Q 15 25 30 20 T 60 12 T 90 28 T 100 20 L 100 40 L 0 40 Z" fill="url(#chart1)" />
              {/* Line 1 */}
              <path d="M 0 35 Q 15 25 30 20 T 60 12 T 90 28 T 100 20" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />

              {/* Area 2 */}
              <path d="M 0 38 Q 20 30 40 15 T 70 28 T 100 8 L 100 40 L 0 40 Z" fill="url(#chart2)" />
              {/* Line 2 */}
              <path d="M 0 38 Q 20 30 40 15 T 70 28 T 100 8" fill="none" stroke="#ec4899" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {/* Custom tooltip simulation */}
            <div className="absolute top-[30%] left-[60%] bg-[#0B192C]/90 text-white text-[9px] px-2 py-0.5 rounded shadow-lg font-bold pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
              2.1k
            </div>
          </div>

          {/* Month Labels */}
          <div className="flex justify-between px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>

          {/* Secondary bar grids */}
          <div className="flex gap-2 h-14 items-end mt-1 px-2 border-b border-slate-100/50 pb-2">
            {[45, 60, 30, 80, 50, 70, 40, 95, 60, 75].map((val, idx) => (
              <div key={idx} className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500 rounded-t-sm" style={{ height: `${val}%` }} />
            ))}
          </div>

          {/* Word Cloud Visual */}
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-center min-h-[90px]">
            {words.map((w, idx) => (
              <span key={idx} className={`${w.size} ${w.color} transition-all hover:scale-105 cursor-default`}>
                {w.text}
              </span>
            ))}
          </div>
        </div>

        {/* CARD 2: Content Performance Analytics */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-[#0B192C]">Content Performance Analytics</h3>
            <button className="text-slate-400 hover:text-[#0B192C] cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Performance Curve (SVG gradient chart) */}
          <div className="h-32 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.5" />

              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d="M 0 38 Q 20 10 40 25 T 80 8 T 100 15 L 100 40 L 0 40 Z" fill="url(#perfGrad)" />
              <path d="M 0 38 Q 20 10 40 25 T 80 8 T 100 15" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Week labels */}
          <div className="flex justify-between px-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Circular gauges */}
          <div className="grid grid-cols-3 gap-2 text-center mt-1">
            <CircularProgress val={70} color="#8b5cf6" label="Reach" />
            <CircularProgress val={35} color="#ec4899" label="Clicks" />
            <CircularProgress val={18} color="#06b6d4" label="Shares" />
          </div>

          {/* Stats values */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100/50 pt-3 text-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Est. Reach</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">
                {liveData?.posts ? (liveData.posts.reduce((s, p) => s + (p.reach || p.views || 0), 0)).toLocaleString() : "8.4K"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Likes</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">
                {liveData?.posts ? (liveData.posts.reduce((s, p) => s + p.likes, 0)).toLocaleString() : "420"}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Comments</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">
                {liveData?.posts ? (liveData.posts.reduce((s, p) => s + p.comments, 0)).toLocaleString() : "18"}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: Content Studio Editor */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-[#0B192C]">Content Studio Editor</h3>
            <button className="text-slate-400 hover:text-[#0B192C] cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Editor sub-tabs */}
          <div className="flex gap-4 border-b border-slate-100 pb-2">
            <button
              onClick={() => setEditorTab("text")}
              className={`text-[10px] font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                editorTab === "text" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Text editor
            </button>
            <button
              onClick={() => setEditorTab("media")}
              className={`text-[10px] font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                editorTab === "media" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Media uploader
            </button>
          </div>

          {/* Rich text formatting bar simulation */}
          <div className="flex items-center gap-3 text-slate-400 text-xs border-b border-slate-100/50 pb-2">
            <span className="font-extrabold hover:text-slate-600 cursor-pointer">B</span>
            <span className="italic hover:text-slate-600 cursor-pointer">I</span>
            <span className="underline hover:text-slate-600 cursor-pointer">U</span>
            <span className="hover:text-slate-600 cursor-pointer">🔗</span>
            <span className="hover:text-slate-600 cursor-pointer">📋</span>
            <span className="hover:text-slate-600 cursor-pointer">🎨</span>
          </div>

          {/* Editor Workspace */}
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">New Post</p>
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="w-full bg-transparent border-0 outline-none resize-none text-xs text-slate-600 mt-1.5 focus:ring-0 leading-relaxed font-semibold"
                rows={3}
              />
            </div>

            {/* AI generated banner */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-[#EEF2F6] p-3.5 flex items-center justify-between shadow-inner">
              <div className="space-y-1">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  AI Generated
                </span>
                <p className="text-[11px] font-bold text-slate-700 mt-1">Creative Campaign Graphic</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white text-xs font-black shadow-lg">
                AI
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100/50 pt-3">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Schedule for</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">10/26 11:30 AM</p>
              </div>

              <button
                onClick={handleOptimize}
                disabled={optimizationStatus === "optimizing"}
                className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {optimizationStatus === "optimizing" ? "Optimizing..." : "Optimize Post"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* CARD 4: AI Agent Recommendations */}
        <div className="xl:col-span-2 bg-white border border-slate-100 p-5 rounded-[2rem] shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-[#0B192C]">AI Agent Recommendations</h3>
            <button className="text-slate-400 hover:text-[#0B192C] cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal recommendations row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            
            {/* Recommendation 1 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                    🤖
                  </span>
                  <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                    Hashtag Virality Boost
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Posts featuring <span className="text-indigo-600 font-bold">#skillizee</span> & <span className="text-indigo-600 font-bold">#internship</span> earn 3.4x higher engagement. Increase hashtag density on carousel posts.
                </p>
              </div>
              <button
                onClick={() => onNavigate("composer")}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Apply Hashtag Strategy
              </button>
            </div>

            {/* Recommendation 2 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                    📈
                  </span>
                  <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                    Meta Channel Feed Audit
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100/60 text-center">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Est. Reach</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {liveData?.posts ? (liveData.posts.reduce((s, p) => s + (p.reach || p.views || 0), 0)).toLocaleString() : "8.4K"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Likes</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {liveData?.posts ? (liveData.posts.reduce((s, p) => s + p.likes, 0)).toLocaleString() : "420"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Comments</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">
                      {liveData?.posts ? (liveData.posts.reduce((s, p) => s + p.comments, 0)).toLocaleString() : "18"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate("instagram-analyzer")}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                View Live Audit
              </button>
            </div>

            {/* Recommendation 3 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
                    🎯
                  </span>
                  <p className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                    Optimal Reel Schedule
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Videos and Reels published between <span className="text-purple-600 font-bold">6:00 PM – 9:00 PM IST</span> see 48% higher initial impressions for @skillizee.io.
                </p>
              </div>
              <button
                onClick={() => onNavigate("calendar")}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Schedule Optimal Reel
              </button>
            </div>

          </div>
        </div>

        {/* CARD 5: Audience Insights */}
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-premium flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0B192C]">Audience Insights</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Demographics</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 font-extrabold text-xs">
              <span>▲</span>
              <span>+14%</span>
            </div>
          </div>

          {/* Vertical Demographics Bar Chart */}
          <div className="h-36 flex items-end gap-3.5 px-2 mt-1">
            <Bar height={25} label="0-14" />
            <Bar height={45} label="15-24" active />
            <Bar height={80} label="25-34" active />
            <Bar height={60} label="35-54" active />
            <Bar height={35} label="55-64" />
            <Bar height={15} label="66+" />
          </div>
        </div>

      {/* Saved Strategies & Calendars Section */}
      <SavedStrategiesSection
        onNavigate={onNavigate}
        onStartResearch={onStartResearch}
        onGoToStudio={onGoToStudio}
      />

    </div>
  );
}

/* Saved Strategies & Calendars Component */
function SavedStrategiesSection({ onNavigate, onStartResearch, onGoToStudio }) {
  const savedStrategies = useSavedStrategies();
  const contentHistory = useContentHistory();
  const [activeTab, setActiveTab] = useState("strategies");
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0B192C]">Saved Strategies & Calendars</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Quick access to your saved AI content plans, strategies, and draft calendars</p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "strategies"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Saved Strategies ({savedStrategies.length})
          </button>
          <button
            onClick={() => setActiveTab("calendars")}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "calendars"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Content & Drafts ({contentHistory.length})
          </button>
        </div>
      </div>

      {activeTab === "strategies" ? (
        savedStrategies.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-700">No Saved Strategies Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">
              Generate an AI strategy in the Content Planner and click "Save Strategy" to save it here for instant reuse.
            </p>
            <button
              onClick={() => onNavigate("calendar")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Go to Content Planner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedStrategies.map((strat) => {
              const isExpanded = expandedId === strat.id;
              const insights = strat.insights || {};
              const format = insights.bestFormat || "Reel";
              const formattedDate = strat.savedAt
                ? new Date(strat.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Saved Strategy";

              return (
                <div
                  key={strat.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-indigo-200 hover:bg-white transition-all shadow-sm flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                        {strat.niche || "General"}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">{formattedDate}</span>
                        <button
                          onClick={() => deleteStrategy(strat.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete strategy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
                        <span>{strat.type || "AI Calendar Strategy"}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {strat.calendarCount || strat.calendar?.length || 0} Posts
                        </span>
                      </h4>
                      {insights.formatInsight && (
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                          {insights.formatInsight}
                        </p>
                      )}
                    </div>

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold">
                        Top Format: {format}
                      </span>
                      {insights.bestPostingHours && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                          Peak: {insights.bestPostingHours.map(h => `${h}:00`).join(", ")}
                        </span>
                      )}
                    </div>

                    {/* Topics */}
                    {insights.trendingTopics && insights.trendingTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {insights.trendingTopics.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand preview if calendar posts exist */}
                  {isExpanded && strat.calendar && strat.calendar.length > 0 && (
                    <div className="border-t border-slate-100 pt-3 space-y-2 max-h-48 overflow-y-auto custom-scroll pr-1">
                      <p className="text-[10px] font-black uppercase text-slate-400">Strategy Posts Preview</p>
                      {strat.calendar.slice(0, 5).map((post, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-slate-100/60 text-[11px] font-medium flex items-center justify-between gap-2">
                          <div className="truncate">
                            <span className="font-bold text-slate-700">{post.day || post.date}: </span>
                            <span className="text-slate-600">{post.topic}</span>
                          </div>
                          {onStartResearch && (
                            <button
                              onClick={() => onStartResearch(post.topic)}
                              className="text-[9px] font-bold text-indigo-600 hover:underline shrink-0 cursor-pointer"
                            >
                              Research →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate("calendar")}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Open in Planner
                    </button>
                    {strat.calendar && strat.calendar.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : strat.id)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        {isExpanded ? "Hide Preview" : "Preview Posts"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Saved Calendars & Draft Content */
        contentHistory.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-700">No Draft Content Saved</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">
              Create scripts, carousel frameworks, or reel drafts in the Content Studio to view them here.
            </p>
            <button
              onClick={() => onNavigate("studio")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Open Content Studio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-purple-200 hover:bg-white transition-all shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider">
                      {item.format?.replace(/_/g, " ") || "Draft"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {item.savedAt ? new Date(item.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                    {item.keyword || item.title || "Untitled Draft"}
                  </h4>
                  {item.script && (
                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {item.script}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 capitalize">
                    Status: {item.status || "Draft"}
                  </span>
                  <button
                    onClick={() => {
                      if (onGoToStudio) {
                        onGoToStudio({ keyword: item.keyword || item.title, format: item.format });
                      } else {
                        onNavigate("studio");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Open in Studio →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* Circular progress gauge simulation */
function CircularProgress({ val, color, label }) {
  const strokeDash = (2 * Math.PI * 18);
  const strokeOffset = strokeDash - (val / 100) * strokeDash;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r="18" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={strokeDash}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[9px] font-black text-slate-700">{val}%</span>
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
  );
}

/* Demographics Bar helper */
function Bar({ height, label, active = false }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
      <div className="relative w-full h-full flex flex-col justify-end">
        <div
          className={`w-full rounded-t-lg transition-all duration-500 ${
            active
              ? "bg-gradient-to-t from-indigo-500 to-purple-500 shadow-md"
              : "bg-slate-200"
          }`}
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-[8px] font-black text-slate-400 whitespace-nowrap">{label}</span>
    </div>
  );
}
