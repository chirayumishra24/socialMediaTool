"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TrendFeed from "@/components/TrendFeed";
import NewsFeed from "@/components/NewsFeed";
import RedditFeed from "@/components/RedditFeed";
import GenerateForm from "@/components/GenerateForm";
import ScriptViewer from "@/components/ScriptViewer";
import SeoPanel from "@/components/SeoPanel";
import QualityScore from "@/components/QualityScore";
import ScheduleModal from "@/components/ScheduleModal";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [trends, setTrends] = useState([]);
  const [keywords, setKeywords] = useState(null);
  const [news, setNews] = useState([]);
  const [redditTrends, setRedditTrends] = useState([]);
  
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [redditLoading, setRedditLoading] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Fetch trends on mount
  useEffect(() => {
    fetchTrends();
    fetchNews();
    fetchReddit();
  }, []);

  const fetchTrends = async () => {
    setTrendsLoading(true);
    try {
      const res = await fetch("/api/trends");
      const data = await res.json();
      setTrends(data.trends || []);
      setKeywords(data.keywords || null);
    } catch (err) {
      console.error("Error fetching trends:", err);
    } finally {
      setTrendsLoading(false);
    }
  };

  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.news || []);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchReddit = async () => {
    setRedditLoading(true);
    try {
      const res = await fetch("/api/reddit");
      const data = await res.json();
      setRedditTrends(data.trends || []);
    } catch (err) {
      console.error("Error fetching reddit trends:", err);
    } finally {
      setRedditLoading(false);
    }
  };

  const handleGenerate = useCallback(async (formData) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setActiveTab("generate");

    try {
      // Build context from trends and news
      const trendContext = trends
        .slice(0, 5)
        .map((t) => `"${t.title}" (${t.viewCount} views)`)
        .join("\n");

      const newsContext = news
        .slice(0, 3)
        .map((n) => `${n.headline} (NRS: ${n.nrs}, Source: ${n.source})`)
        .join("\n");

      const redditContext = redditTrends
        .slice(0, 3)
        .map((r) => `${r.title} (r/${r.subreddit}, score: ${r.score})`)
        .join("\n");

      const keywordContext = keywords?.primary
        ?.map((k) => k.keyword)
        .join(", ");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          trendData: trendContext + "\nREDDIT TRENDS:\n" + redditContext,
          newsData: newsContext,
          keywords: keywordContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [trends, news, redditTrends, keywords]);

  const handleUseTrend = (trend) => {
    setPrefill({
      niche: trend.title || trend.headline,
      audience: "",
      platform: "youtube",
      format: "youtube_longform",
    });
    setActiveTab("generate");
  };

  const handleUseNews = (article) => {
    setPrefill({
      niche: article.headline || article.title,
      audience: "",
      platform: "youtube",
      format: "youtube_longform",
    });
    setActiveTab("generate");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Gradient glow overlay */}
        <div className="gradient-glow absolute top-0 left-0 right-0 h-[300px] pointer-events-none" />

        <main className="flex-1 overflow-y-auto relative">
          {/* ═══════ DASHBOARD VIEW ═══════ */}
          {activeTab === "dashboard" && (
            <div className="p-5 space-y-5">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon="📈" label="YouTube Topics" value={trends.length} color="primary" />
                <StatCard icon="📡" label="Reddit Signals" value={redditTrends.length} color="success" />
                <StatCard icon="📰" label="News Stories" value={news.length} color="accent" />
                <StatCard
                  icon="🔥"
                  label="Viral Alerts"
                  value={news.filter((n) => n.isHighOpportunity).length + redditTrends.filter((r) => r.isHighOpportunity).length}
                  color="danger"
                />
              </div>

              {/* Three Column Layout for Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 border-t border-border pt-5">
                {/* 1: YouTube Trends */}
                <div className="space-y-3 col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <span>📈</span> YouTube Trends
                    </h3>
                    <button
                      onClick={fetchTrends}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-text-muted hover:text-primary-light transition-all cursor-pointer"
                    >
                      ↻
                    </button>
                  </div>
                  <TrendFeed
                    trends={trends}
                    keywords={keywords}
                    loading={trendsLoading}
                    onUseTrend={handleUseTrend}
                  />
                </div>

                {/* 2: Reddit Trends */}
                <div className="space-y-3 col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <span>📡</span> Reddit Viral Signals
                    </h3>
                    <button
                      onClick={fetchReddit}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-text-muted hover:text-accent-light transition-all cursor-pointer"
                    >
                      ↻
                    </button>
                  </div>
                  <RedditFeed
                    trends={redditTrends}
                    loading={redditLoading}
                    onUseTrend={handleUseTrend}
                  />
                </div>

                {/* 3: News */}
                <div className="space-y-3 col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <span>📰</span> News & Current Affairs
                    </h3>
                    <button
                      onClick={fetchNews}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-text-muted hover:text-primary-light transition-all cursor-pointer"
                    >
                      ↻
                    </button>
                  </div>
                  <NewsFeed
                    news={news}
                    loading={newsLoading}
                    onUseNews={handleUseNews}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════ GENERATE VIEW ═══════ */}
          {activeTab === "generate" && (
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Form */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>✨</span> Generate Content
                  </h3>
                  <GenerateForm
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    prefill={prefill}
                  />

                  {error && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger animate-fade-in">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Quality Score */}
                  {result?.quality && <QualityScore quality={result.quality} />}
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-8 space-y-4">
                  {!result && !isGenerating && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="text-5xl mb-4">✨</div>
                      <h3 className="text-lg font-bold text-text-primary mb-1">Ready to Generate</h3>
                      <p className="text-sm text-text-muted max-w-md">
                        Enter your subject and audience, pick a platform, and let the AI pipeline
                        create a trend-aligned script with SEO optimization.
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                      <div className="text-5xl mb-4 animate-bounce">🤖</div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">AI Agents Working...</h3>
                      <div className="space-y-2 text-sm text-text-secondary">
                        <p>🔍 Researcher analyzing trends & news...</p>
                        <p className="text-text-muted">✍️ Writer drafting script...</p>
                        <p className="text-text-muted">✏️ Editor polishing content...</p>
                        <p className="text-text-muted">📊 SEO Optimizer generating metadata...</p>
                      </div>
                      <p className="text-xs text-text-muted mt-4">This takes ~60-90 seconds</p>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-4">
                      {/* Pipeline Completed Badge & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-border animate-fade-in shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
                          <span className="text-success text-base">✅</span>
                          <span className="leading-snug">Pipeline completed: Researcher → Writer → Editor → SEO Optimizer</span>
                        </div>
                        <button
                          onClick={() => setIsScheduleOpen(true)}
                          className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          <span>🚀</span> Schedule Post
                        </button>
                      </div>

                      {/* Tab switcher between Script and SEO */}
                      <ResultTabs result={result} />
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Modal */}
              {isScheduleOpen && result && (
                <ScheduleModal
                  result={result}
                  onClose={() => setIsScheduleOpen(false)}
                />
              )}
            </div>
          )}

          {/* ═══════ TRENDS VIEW ═══════ */}
          {activeTab === "trends" && (
            <div className="p-5 max-w-3xl">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                <span>📈</span> All Trending Education Topics
              </h3>
              <TrendFeed
                trends={trends}
                keywords={keywords}
                loading={trendsLoading}
                onUseTrend={handleUseTrend}
              />
            </div>
          )}

          {/* ═══════ NEWS VIEW ═══════ */}
          {activeTab === "news" && (
            <div className="p-5 max-w-3xl">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                <span>📰</span> All Education News & Current Affairs
              </h3>
              <NewsFeed
                news={news}
                loading={newsLoading}
                onUseNews={handleUseNews}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ═══════ Result Tabs Component ═══════
function ResultTabs({ result }) {
  const [tab, setTab] = useState("script");

  return (
    <div>
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-surface-hover border border-border inline-flex">
        {[
          { id: "script", label: "📝 Script", icon: "" },
          { id: "seo", label: "🏷️ SEO & Hashtags", icon: "" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              tab === t.id
                ? "bg-primary/20 text-primary-light"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "script" && (
        <ScriptViewer script={result.script} research={result.research} format={result?.metadata?.format} />
      )}
      {tab === "seo" && <SeoPanel seo={result.seo} />}
    </div>
  );
}

// ═══════ Stat Card Component ═══════
function StatCard({ icon, label, value, color }) {
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
        </div>
      </div>
    </div>
  );
}
