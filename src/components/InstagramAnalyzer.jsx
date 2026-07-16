"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  Loader2,
  Sparkles,
  Users,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  History
} from "lucide-react";
import { saveAnalysis, useAnalysisHistory } from "@/lib/storage";

export default function InstagramAnalyzer() {
  // ─── State ──────────────────────────────────────────────
  const [username, setUsername] = useState("skillizee.io");
  const [scraping, setScraping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  const history = useAnalysisHistory();

  // Manual profile input
  const [manualProfile, setManualProfile] = useState({
    username: "skillizee.io",
    fullName: "Skillizee",
    bio: "",
    followers: "",
    following: "",
    postCount: "",
    externalUrl: "",
    category: "Education",
  });
  const [manualPosts, setManualPosts] = useState([
    { caption: "", contentType: "Reel / Video", likes: "", comments: "", views: "", date: "" },
  ]);

  // Profile context for AI
  const [context, setContext] = useState({
    age: "22",
    role: "Founder",
    niche: "Education / EdTech / AI",
    audience: "Students, parents, educators, startup founders",
    otherPlatforms: "YouTube, LinkedIn, Website",
    goal1: "Grow followers in education niche",
    goal2: "Drive leads for Skillizee platform",
    goal3: "Build community around education innovation",
    goal4: "Establish personal brand as edtech founder",
  });

  // Listen for real-time Chrome Extension sync events
  useEffect(() => {
    const handleCacheUpdate = () => {
      console.log("[IG Analyzer] Received skilizee_cache_updated event");
      const cacheStr = localStorage.getItem("skilizee_ig_sync_cache");
      const cleanUser = username.toLowerCase().trim();
      if (cacheStr && cleanUser) {
        try {
          const cache = JSON.parse(cacheStr);
          if (cache[cleanUser] && !profileData) {
            console.log(`[IG Analyzer] Auto-loading newly synced data for @${cleanUser}`);
            setProfileData(ensureAnalytics(cache[cleanUser]));
            setError("");
            setManualMode(false);
          }
        } catch (e) {
          console.error("[IG Analyzer] Error parsing cache:", e);
        }
      }
    };

    window.addEventListener("skilizee_cache_updated", handleCacheUpdate);
    return () => {
      window.removeEventListener("skilizee_cache_updated", handleCacheUpdate);
    };
  }, [username, profileData]);

  // ─── Scrape Handler (Client-side extension cache lookup) ───
  const handleScrape = useCallback(async () => {
    const cleanUser = username.toLowerCase().trim();
    if (!cleanUser) {
      console.warn("[IG Analyzer] Username is empty");
      return;
    }
    console.log(`[IG Analyzer] Checking local extension sync storage cache for: ${cleanUser}`);
    setError("");
    setScraping(true);
    setProfileData(null);
    setStrategy(null);
    setManualMode(false);

    try {
      const cacheStr = localStorage.getItem("skilizee_ig_sync_cache");
      let data = null;
      if (cacheStr) {
        const cache = JSON.parse(cacheStr);
        if (cache[cleanUser]) {
          data = cache[cleanUser];
          console.log("[IG Analyzer] Cache hit from extension storage:", data);
        }
      }

      if (data) {
        setProfileData(ensureAnalytics(data));
        console.log("[IG Analyzer] Loaded synced profile data successfully!");
      } else {
        console.log("[IG Analyzer] Cache miss. Forcing manual input mode.");
        setError(`No cached extension data found for @${cleanUser}. Please open Instagram, visit the profile page, and click "Sync to Dashboard" in the Chrome Extension popup first!`);
        setManualMode(true);
        setManualProfile((prev) => ({ ...prev, username: cleanUser }));
      }
    } catch (err) {
      console.error("[IG Analyzer] Scrape handler exception:", err);
      setError(err.message);
      setManualMode(true);
      setManualProfile((prev) => ({ ...prev, username: cleanUser }));
    } finally {
      setScraping(false);
      console.log("[IG Analyzer] Scrape process finished");
    }
  }, [username]);

  // ─── Manual Submit Handler ──────────────────────────────
  const handleManualSubmit = useCallback(async () => {
    setError("");
    setScraping(true);

    try {
      const res = await fetch("/api/meta/instagram/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manual: { ...manualProfile, recentPosts: manualPosts },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setProfileData(ensureAnalytics(data));
      setManualMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  }, [manualProfile, manualPosts]);

  // ─── Analyze Handler ────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!profileData) return;
    setError("");
    setAnalyzing(true);

    try {
      const res = await fetch("/api/meta/instagram/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData, profileContext: context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setStrategy(data.strategy);
      
      // Save to localStorage history
      saveAnalysis({
        profile: profileData.profile,
        posts: profileData.posts,
        analysis: profileData.analysis,
        strategy: data.strategy,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, [profileData, context]);

  // ─── Manual Post Helpers ────────────────────────────────
  const addManualPost = () => {
    setManualPosts((prev) => [
      ...prev,
      { caption: "", contentType: "Static Image", likes: "", comments: "", views: "", date: "" },
    ]);
  };

  const removeManualPost = (idx) => {
    setManualPosts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateManualPost = (idx, field, value) => {
    setManualPosts((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* History panel if any exists */}
      {history.length > 0 && !profileData && !strategy && !manualMode && (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-extrabold text-[#0B192C]">Recent Profile Analyses</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {history.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => {
                  setProfileData({ profile: item.profile, posts: item.posts, analysis: item.analysis });
                  setStrategy(item.strategy);
                  setUsername(item.profile?.username || "");
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-200/50 text-left transition-all flex flex-col gap-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600">@{item.profile?.username}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{item.profile?.followers?.toLocaleString()} followers</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 mt-1">{item.strategy?.summary}</p>
                <span className="text-[8px] text-slate-400 font-bold mt-2">
                  {new Date(item.savedAt || item.strategy?.generatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SECTION 1: Profile Input ═══ */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0B192C]">Instagram Profile Analyzer</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scrape & strategize any public profile</p>
          </div>
        </div>

        {/* Username Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="skillizee.io"
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            />
          </div>
          <button
            onClick={handleScrape}
            disabled={scraping || !username.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {scraping ? "Scraping..." : "Scrape Profile"}
          </button>
          <button
            onClick={() => { setManualMode(true); setProfileData(null); setStrategy(null); }}
            className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            Manual Entry
          </button>
        </div>

        {/* Chrome Extension Scraper Helper Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 flex items-start gap-3">
          <span className="text-base">💡</span>
          <div className="text-[11px] text-indigo-950/80 leading-relaxed font-semibold">
            <p className="font-extrabold text-indigo-950">Sync automatically without RapidAPI subscriptions:</p>
            <ol className="list-decimal pl-4 mt-1 space-y-1">
              <li>Open Chrome and navigate to <code className="bg-white/80 px-1 py-0.5 rounded border border-indigo-200">chrome://extensions/</code></li>
              <li>Turn on <b>Developer mode</b> (top right toggle)</li>
              <li>Click <b>Load unpacked</b> and select the <code className="bg-white/80 px-1 py-0.5 rounded border border-indigo-200">extension</code> directory in your project folder</li>
              <li>Go to any public Instagram profile page, open the extension popup, and click <b>Sync to Dashboard</b></li>
            </ol>
          </div>
        </div>

        {/* Context Form (Collapsible) */}
        <div className="mt-4">
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider hover:text-indigo-600 transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            Profile Context (for AI strategy)
            {contextOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {contextOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
              <ContextField label="Age" value={context.age} onChange={(v) => setContext((c) => ({ ...c, age: v }))} />
              <ContextField label="Role" value={context.role} onChange={(v) => setContext((c) => ({ ...c, role: v }))} />
              <ContextField label="Content Niche" value={context.niche} onChange={(v) => setContext((c) => ({ ...c, niche: v }))} />
              <ContextField label="Target Audience" value={context.audience} onChange={(v) => setContext((c) => ({ ...c, audience: v }))} />
              <ContextField label="Other Platforms" value={context.otherPlatforms} onChange={(v) => setContext((c) => ({ ...c, otherPlatforms: v }))} />
              <ContextField label="Goal 1" value={context.goal1} onChange={(v) => setContext((c) => ({ ...c, goal1: v }))} />
              <ContextField label="Goal 2" value={context.goal2} onChange={(v) => setContext((c) => ({ ...c, goal2: v }))} />
              <ContextField label="Goal 3" value={context.goal3} onChange={(v) => setContext((c) => ({ ...c, goal3: v }))} />
              <ContextField label="Goal 4" value={context.goal4} onChange={(v) => setContext((c) => ({ ...c, goal4: v }))} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ═══ MANUAL INPUT MODE ═══ */}
      {manualMode && (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0B192C]">Manual Profile Entry</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instagram API unavailable — enter your stats manually
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <ContextField label="Username" value={manualProfile.username} onChange={(v) => setManualProfile((p) => ({ ...p, username: v }))} />
            <ContextField label="Full Name" value={manualProfile.fullName} onChange={(v) => setManualProfile((p) => ({ ...p, fullName: v }))} />
            <ContextField label="Followers" value={manualProfile.followers} onChange={(v) => setManualProfile((p) => ({ ...p, followers: v }))} placeholder="e.g. 5200" />
            <ContextField label="Following" value={manualProfile.following} onChange={(v) => setManualProfile((p) => ({ ...p, following: v }))} placeholder="e.g. 340" />
            <ContextField label="Total Posts" value={manualProfile.postCount} onChange={(v) => setManualProfile((p) => ({ ...p, postCount: v }))} placeholder="e.g. 85" />
            <ContextField label="Category" value={manualProfile.category} onChange={(v) => setManualProfile((p) => ({ ...p, category: v }))} />
          </div>
          <div className="mb-6">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Bio</label>
            <textarea
              value={manualProfile.bio}
              onChange={(e) => setManualProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Paste your Instagram bio here..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              rows={2}
            />
          </div>

          {/* Recent Posts */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Posts (add your last few posts)</p>
              <button onClick={addManualPost} className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Post
              </button>
            </div>
            <div className="space-y-3">
              {manualPosts.map((post, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Caption / Topic</label>
                    <input type="text" value={post.caption} onChange={(e) => updateManualPost(i, "caption", e.target.value)} placeholder="What was the post about?" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Format</label>
                    <select value={post.contentType} onChange={(e) => updateManualPost(i, "contentType", e.target.value)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none">
                      <option>Reel / Video</option>
                      <option>Carousel</option>
                      <option>Static Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Likes</label>
                    <input type="number" value={post.likes} onChange={(e) => updateManualPost(i, "likes", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Comments</label>
                    <input type="number" value={post.comments} onChange={(e) => updateManualPost(i, "comments", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Views</label>
                      <input type="number" value={post.views} onChange={(e) => updateManualPost(i, "views", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                    </div>
                    {manualPosts.length > 1 && (
                      <button onClick={() => removeManualPost(i)} className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={scraping || !manualProfile.followers}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
          >
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Submit & Analyze Profile
          </button>
        </div>
      )}

      {/* ═══ SECTION 2: Profile Overview (after scrape) ═══ */}
      {profileData && (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium animate-fade-in">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px] shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                {profileData.profile.profilePic ? (
                  <img src={profileData.profile.profilePic} alt={profileData.profile.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                    {(profileData.profile.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#0B192C]">@{profileData.profile.username}</h3>
                {profileData.profile.isVerified && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">✓</span>
                )}
                {profileData.source && (
                  <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    via {profileData.source === "manual" ? "manual entry" : profileData.source}
                  </span>
                )}
              </div>
              {profileData.profile.fullName && <p className="text-sm font-bold text-slate-600">{profileData.profile.fullName}</p>}
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">{profileData.profile.bio || "No bio"}</p>
              {profileData.profile.externalUrl && (
                <a href={profileData.profile.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1 mt-1">
                  {profileData.profile.externalUrl} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <StatCard icon={Users} label="Followers" value={formatNum(profileData.profile.followers)} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard icon={Heart} label="Avg Likes" value={formatNum(profileData.analysis.avgLikes)} color="text-rose-500" bg="bg-rose-50" />
            <StatCard icon={MessageCircle} label="Avg Comments" value={formatNum(profileData.analysis.avgComments)} color="text-emerald-500" bg="bg-emerald-50" />
            <StatCard icon={TrendingUp} label="Engagement" value={`${profileData.analysis.engagementRate}%`} color="text-purple-600" bg="bg-purple-50" />
            <StatCard icon={BarChart3} label="Top Format" value={profileData.analysis.topFormat} color="text-amber-600" bg="bg-amber-50" />
          </div>

          {/* Format Distribution */}
          {(profileData.analysis.formatDistribution.reels > 0 || profileData.analysis.formatDistribution.carousels > 0 || profileData.analysis.formatDistribution.static > 0) && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Format Mix</p>
              <div className="flex-1 flex gap-2 h-4 rounded-full overflow-hidden min-w-[100px]">
                {profileData.analysis.formatDistribution.reels > 0 && (
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ flex: profileData.analysis.formatDistribution.reels }} />
                )}
                {profileData.analysis.formatDistribution.carousels > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ flex: profileData.analysis.formatDistribution.carousels }} />
                )}
                {profileData.analysis.formatDistribution.static > 0 && (
                  <div className="bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full" style={{ flex: profileData.analysis.formatDistribution.static }} />
                )}
              </div>
              <div className="flex gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Reels ({profileData.analysis.formatDistribution.reels})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Carousels ({profileData.analysis.formatDistribution.carousels})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Static ({profileData.analysis.formatDistribution.static})</span>
              </div>
            </div>
          )}

          {/* Recent Posts Grid */}
          {profileData.posts.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Last {profileData.posts.length} Posts</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {profileData.posts.map((post, i) => (
                  <div key={post.id || i} className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square hover:shadow-lg transition-all">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-2 text-center">
                        <span className="text-2xl opacity-30 mb-1">{post.contentType === "Reel / Video" ? "🎬" : post.contentType === "Carousel" ? "📑" : "📷"}</span>
                        <span className="text-[8px] font-bold text-slate-400 line-clamp-3">{post.caption || "Post"}</span>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1 text-white">
                      <span className="text-[8px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">{post.contentType}</span>
                      <div className="flex items-center gap-3 text-[10px] font-bold mt-1">
                        <span>❤️ {formatNum(post.likes)}</span>
                        <span>💬 {formatNum(post.comments)}</span>
                      </div>
                      {post.views > 0 && <span className="text-[9px] opacity-70">👁️ {formatNum(post.views)}</span>}
                    </div>
                    <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase ${
                      post.engagementLevel === "Very High" ? "bg-emerald-500 text-white" :
                      post.engagementLevel === "High" ? "bg-blue-500 text-white" :
                      post.engagementLevel === "Medium" ? "bg-amber-500 text-white" :
                      "bg-slate-300 text-slate-600"
                    }`}>
                      {post.engagementLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Strategy Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white text-sm font-black uppercase tracking-wider flex items-center gap-3 hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {analyzing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Strategy...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Marketing Strategy</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SECTION 3: AI Strategy Report ═══ */}
      {strategy && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 p-6 rounded-[2rem] text-white shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-lg font-extrabold">AI Marketing Strategy</h2>
            </div>
            <p className="text-sm font-medium opacity-90 leading-relaxed">{strategy.summary}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-3">Generated {new Date(strategy.generatedAt).toLocaleString()}</p>
          </div>

          {/* Step 1: Profile Audit */}
          <StrategyCard step="1" title="Profile Audit" icon={Target} color="from-emerald-500 to-teal-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AuditColumn title="What's Working ✅" items={strategy.profileAudit.whatsWorking} color="text-emerald-600" bg="bg-emerald-50" />
              <AuditColumn title="What's Not ❌" items={strategy.profileAudit.whatsNot} color="text-rose-600" bg="bg-rose-50" />
              <AuditColumn title="Quick Fixes 🔧" items={strategy.profileAudit.quickFixes} color="text-amber-600" bg="bg-amber-50" />
            </div>
          </StrategyCard>

          {/* Step 2: Content Pillars */}
          <StrategyCard step="2" title="Content Pillars" icon={BarChart3} color="from-indigo-500 to-purple-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategy.contentPillars.map((pillar, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-2.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#0B192C]">{pillar.name}</h4>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{pillar.weeklyPercent}%</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider w-fit px-2 py-0.5 rounded-full ${
                    pillar.goal === "Attract" ? "bg-blue-50 text-blue-600" :
                    pillar.goal === "Nurture" ? "bg-emerald-50 text-emerald-600" :
                    pillar.goal === "Convert" ? "bg-rose-50 text-rose-600" :
                    "bg-purple-50 text-purple-600"
                  }`}>{pillar.goal}</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{pillar.description}</p>
                </div>
              ))}
            </div>
          </StrategyCard>

          {/* Step 3: Weekly Format Mix */}
          <StrategyCard step="3" title="Weekly Format Mix" icon={Calendar} color="from-pink-500 to-rose-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(strategy.weeklyFormatMix).map(([key, val]) => (
                <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative">
                    <span className="text-lg font-black text-indigo-600">{val.count}</span>
                    <span className="absolute -bottom-1 text-[8px] font-bold text-slate-400">/week</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#0B192C] capitalize">{key.replace(/([A-Z])/g, " $1")}</h4>
                  <span className="text-[9px] font-bold text-indigo-500">{val.percent}%</span>
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">{val.reasoning}</p>
                </div>
              ))}
            </div>
          </StrategyCard>

          {/* Step 4: Weekly Calendar */}
          <StrategyCard step="4" title="1-Week Content Calendar" icon={Calendar} color="from-amber-500 to-orange-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {strategy.weeklyCalendar.map((day, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{day.day}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      day.format?.includes("Reel") ? "bg-pink-50 text-pink-600" :
                      day.format?.includes("Carousel") ? "bg-indigo-50 text-indigo-600" :
                      day.format?.includes("Story") ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>{day.format}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#0B192C] leading-tight">{day.title}</h4>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Hook</p>
                    <p className="text-[10px] text-slate-600 font-bold leading-relaxed">&ldquo;{day.hook}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    <p className="text-[9px] font-bold text-indigo-600">{day.cta}</p>
                  </div>
                </div>
              ))}
            </div>
          </StrategyCard>

          {/* Step 5: Viral Hooks */}
          <StrategyCard step="5" title="5 Viral Hook Templates" icon={Zap} color="from-violet-500 to-fuchsia-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategy.viralHooks.map((hook, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-black">{i + 1}</span>
                    <p className="text-xs font-extrabold text-[#0B192C] leading-tight">{hook.template}</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-2.5">
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-wider mb-1">Example</p>
                    <p className="text-[10px] text-violet-700 font-bold">&ldquo;{hook.example}&rdquo;</p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold flex items-start gap-1">
                    <Lightbulb className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                    {hook.whyItWorks}
                  </p>
                </div>
              ))}
            </div>
          </StrategyCard>

          {/* Step 6: Conversion Funnel */}
          <StrategyCard step="6" title="Conversion Funnel" icon={TrendingUp} color="from-cyan-500 to-blue-500">
            <div className="flex flex-col gap-0">
              <FunnelStep label="Cold Audience" desc={strategy.conversionFunnel.cold} color="bg-blue-50 border-blue-200 text-blue-700" width="100%" />
              <FunnelArrow />
              <FunnelStep label="Warm Audience" desc={strategy.conversionFunnel.warm} color="bg-amber-50 border-amber-200 text-amber-700" width="80%" />
              <FunnelArrow />
              <FunnelStep label="Hot Audience" desc={strategy.conversionFunnel.hot} color="bg-rose-50 border-rose-200 text-rose-700" width="60%" />
              <FunnelArrow />
              <FunnelStep label="End Goal" desc={strategy.conversionFunnel.endGoal} color="bg-emerald-50 border-emerald-200 text-emerald-700" width="40%" />
            </div>
          </StrategyCard>

          {/* Step 7: Weekly KPIs */}
          <StrategyCard step="7" title="3 Weekly KPIs" icon={BarChart3} color="from-emerald-500 to-green-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategy.weeklyKPIs.map((kpi, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#0B192C]">{kpi.metric}</h4>
                  <span className="text-lg font-black text-emerald-600">{kpi.target}</span>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{kpi.whyItMatters}</p>
                </div>
              ))}
            </div>
          </StrategyCard>
        </div>
      )}

      {/* Loading skeleton */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-sm font-extrabold text-slate-600">AI is analyzing your profile...</p>
          <p className="text-xs text-slate-400 font-semibold">This takes 15-30 seconds. Crafting a personalized strategy.</p>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────

function ContextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-extrabold text-[#0B192C] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StrategyCard({ step, title, icon: Icon, color, children }) {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-premium">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-base font-extrabold text-[#0B192C]">Step {step}: {title}</h3>
      </div>
      {children}
    </div>
  );
}

function AuditColumn({ title, items = [], color, bg }) {
  return (
    <div className={`p-4 rounded-2xl ${bg} border border-slate-100`}>
      <h4 className={`text-xs font-extrabold ${color} mb-3`}>{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-[10px] text-slate-600 font-semibold leading-relaxed flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0">•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FunnelStep({ label, desc, color, width }) {
  return (
    <div className={`p-4 rounded-2xl border ${color} mx-auto transition-all`} style={{ width }}>
      <h4 className="text-xs font-extrabold mb-1">{label}</h4>
      <p className="text-[10px] font-semibold opacity-80 leading-relaxed">{desc}</p>
    </div>
  );
}

function FunnelArrow() {
  return (
    <div className="w-8 h-6 mx-auto flex items-center justify-center">
      <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
    </div>
  );
}

function formatNum(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ensureAnalytics(data) {
  if (!data) return null;
  if (data.analysis && typeof data.analysis.avgLikes === "number") return data;

  const posts = data.posts || [];
  const profile = data.profile || {};

  const totalLikes = posts.reduce((s, p) => s + (Number(p.likes) || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (Number(p.comments) || 0), 0);
  const totalViews = posts.reduce((s, p) => s + (Number(p.views) || 0), 0);

  const avgLikes = posts.length ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length ? Math.round(totalComments / posts.length) : 0;
  const avgViews = posts.length ? Math.round(totalViews / posts.length) : 0;

  const followers = Number(profile.followers) || 1;
  const engagementRate = (((avgLikes + avgComments) / followers) * 100).toFixed(2);

  const reels = posts.filter((p) => p.contentType === "Reel / Video").length;
  const carousels = posts.filter((p) => p.contentType === "Carousel").length;
  const staticPosts = posts.filter((p) => p.contentType === "Static Image").length;

  const topFormat = reels >= carousels && reels >= staticPosts ? "Reels" : carousels >= staticPosts ? "Carousels" : "Static Images";

  let postingFrequency = "Unknown";
  const timestamps = posts.map((p) => p.timestamp || p.date).filter(Boolean).sort();
  if (timestamps.length >= 2) {
    const daySpan = Math.max(1, (new Date(timestamps[timestamps.length - 1]) - new Date(timestamps[0])) / (1000 * 60 * 60 * 24));
    postingFrequency = `~${((timestamps.length / daySpan) * 7).toFixed(1)} posts/week`;
  }

  const sorted = [...posts].sort((a, b) => ((Number(b.likes) || 0) + (Number(b.comments) || 0)) - ((Number(a.likes) || 0) + (Number(a.comments) || 0)));

  return {
    ...data,
    analysis: {
      avgLikes,
      avgComments,
      avgViews,
      engagementRate,
      formatDistribution: { reels, carousels, static: staticPosts },
      topFormat,
      postingFrequency,
      bestPerformingPost: sorted[0] || null,
      worstPerformingPost: sorted[sorted.length - 1] || null,
    }
  };
}
