"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  Zap
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useContentHistory, usePerformanceInsights, useResearchHistory, useSettingsSnapshot, useStats } from "@/lib/storage";

export default function Dashboard({ onNavigate, onStartResearch, onGoToStudio }) {
  const { user } = useAuth();
  const stats = useStats();
  const settings = useSettingsSnapshot();
  const researchHistory = useResearchHistory();
  const contentHistory = useContentHistory();
  const performance = usePerformanceInsights();
  const [metaStatus, setMetaStatus] = useState(null);

  useEffect(() => {
    fetch("/api/meta/status")
      .then((res) => res.json())
      .then((data) => setMetaStatus(data))
      .catch(() => {});
  }, []);

  // Mock word cloud data
  const words = [
    { text: "Generative AI", size: "text-lg md:text-xl", color: "text-[#8884d8] font-bold" },
    { text: "Generative AI", size: "text-xs", color: "text-rose-400 opacity-80" },
    { text: "Eco-Design", size: "text-base md:text-lg", color: "text-emerald-500 font-extrabold" },
    { text: "Metaverse", size: "text-xs", color: "text-blue-400" },
    { text: "Metaverse", size: "text-sm", color: "text-indigo-400 font-semibold" },
    { text: "Metaverse", size: "text-2xl", color: "text-[#6366f1] font-black" },
    { text: "Data Privacy", size: "text-xs", color: "text-emerald-400" },
    { text: "Data Privacy", size: "text-lg md:text-xl", color: "text-purple-500 font-bold" },
    { text: "Data Privacy", size: "text-xs", color: "text-slate-400" },
    { text: "Metaverse", size: "text-sm", color: "text-violet-400" },
  ];

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
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Views</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">1.2M</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Likes</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">45K</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Shares</p>
              <p className="text-base font-black text-[#0B192C] mt-0.5">18K</p>
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
                    AI Agent Recommendations
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </p>
              </div>
              <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                Apply Now
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
                    Suggestions Recommendation
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100/60 text-center">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Views</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">1.2M</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Likes</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">45K</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Shares</p>
                    <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">18K</p>
                  </div>
                </div>
              </div>
              <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                Apply Now
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
                    Suggestions Recommendar
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </p>
              </div>
              <button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                Apply Now
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

      </div>

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
