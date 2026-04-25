"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  Globe,
  Heart,
  Lightbulb,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Share2,
  Smartphone,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import SocialPreview from "./SocialPreview";
import {
  updateContentTracking,
  updateContentBody,
  updateResearchStatus,
  useContentHistory,
  useResearchHistory,
} from "@/lib/storage";

const STAGES = [
  { id: "pending", label: "Pending Review", shortLabel: "Pending", icon: Clock, color: "text-warning", bg: "bg-warning/5", accent: "bg-warning" },
  { id: "approved", label: "Approved", shortLabel: "Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/5", accent: "bg-success" },
  { id: "published", label: "Published", shortLabel: "Published", icon: Rocket, color: "text-primary", bg: "bg-primary/5", accent: "bg-primary" },
];

const FILTERS = [{ id: "all", label: "All Stages" }, ...STAGES.map((stage) => ({ id: stage.id, label: stage.shortLabel }))];

const EMPTY_PUBLISH_FORM = {
  platform: "",
  publishedUrl: "",
  postId: "",
  views: "",
  clicks: "",
  likes: "",
  comments: "",
  shares: "",
  saves: "",
  impressions: "",
};

function getBoardStage(status) {
  if (status === "in_production") return "published";
  return status || "pending";
}

export default function ApprovalBoard() {
  const items = useResearchHistory();
  const scripts = useContentHistory();

  const [previewItem, setPreviewItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showRejected, setShowRejected] = useState(false);
  const [publishForm, setPublishForm] = useState(EMPTY_PUBLISH_FORM);
  const [publishError, setPublishError] = useState("");
  const [isSyncingInstagram, setIsSyncingInstagram] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");

  const updateStatus = (id, status) => {
    updateResearchStatus(id, status);
  };

  const handleApproveAll = () => {
    items
      .filter((item) => (item.status || "pending") === "pending")
      .forEach((item) => updateResearchStatus(item.id, "approved"));
  };

  const hydratePublishForm = (script) => ({
    platform: script?.publication?.platform || script?.metadata?.platforms?.[0] || "",
    publishedUrl: script?.publication?.publishedUrl || "",
    postId: script?.publication?.postId || "",
    views: script?.performance?.views ?? "",
    clicks: script?.performance?.clicks ?? "",
    likes: script?.performance?.likes ?? "",
    comments: script?.performance?.comments ?? "",
    shares: script?.performance?.shares ?? "",
    saves: script?.performance?.saves ?? "",
    impressions: script?.performance?.impressions ?? "",
  });

  const findScript = (item) => {
    const researchId = item.relatedContentIds?.[0] || item.id;
    return scripts.find((script) =>
      item.relatedContentIds?.includes(script.id) ||
      script.metadata?.researchId === researchId ||
      script.keyword === item.keyword ||
      script.metadata?.keyword === item.keyword
    );
  };

  const matchesSearch = (item, script) => {
    if (!searchQuery.trim()) return true;
    const needle = searchQuery.toLowerCase();
    return [
      item.keyword,
      item.location,
      script?.format,
      script?.publication?.platform,
      script?.script,
    ].some((value) => String(value || "").toLowerCase().includes(needle));
  };

  const getFilteredItems = (stage) =>
    items.filter((item) => {
      const status = getBoardStage(item.status);
      if (status !== stage) return false;
      if (status === "rejected" && !showRejected) return false;
      return matchesSearch(item, findScript(item));
    });

  const getStageCount = (stage) => items.filter((item) => getBoardStage(item.status) === stage).length;

  const totalLiveClicks = useMemo(
    () => scripts.reduce((sum, script) => sum + Number(script.performance?.clicks || 0), 0),
    [scripts]
  );

  const totalLiveViews = useMemo(
    () => scripts.reduce((sum, script) => sum + Number(script.performance?.views || 0), 0),
    [scripts]
  );

  const boardStages = useMemo(() => {
    const visibleStages =
      activeFilter === "all" ? STAGES : STAGES.filter((stage) => stage.id === activeFilter);

    return [
      ...visibleStages,
      ...(showRejected && activeFilter === "all"
        ? [{ id: "rejected", label: "Rejected History", shortLabel: "Rejected", icon: XCircle, color: "text-danger", bg: "bg-danger/5", accent: "bg-danger" }]
        : []),
    ];
  }, [activeFilter, showRejected]);

  const openPreview = (item, script) => {
    setPreviewItem({
      ...item,
      boardStatus: getBoardStage(item.status),
      script: script?.script,
      contentId: script?.id,
      format: script?.format,
      publication: script?.publication || {},
      performance: script?.performance || {},
      tagSnapshot: script?.tagSnapshot || [],
    });
    setEditBody(script?.script || "");
    setPublishForm(hydratePublishForm(script));
    setPublishError("");
    setSyncFeedback("");
    setIsEditing(false);
  };

  const handleSaveEdit = (id) => {
    try {
      updateContentBody(id, editBody);
      setIsEditing(false);
      setPreviewItem((prev) => (prev ? { ...prev, script: editBody } : prev));
    } catch (error) {
      console.error(error);
    }
  };

  const downloadScriptDocument = ({ keyword, format, script, location }) => {
    const safeKeyword = String(keyword || "script").trim() || "script";
    const filename = `${safeKeyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "script"}-${format || "content"}.doc`;
    const formattedScript = escapeHtml(String(script || "")).replace(/\n/g, "<br />");
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(safeKeyword)}</title>
        </head>
        <body>
          <h1>${escapeHtml(safeKeyword)}</h1>
          <p><strong>Format:</strong> ${escapeHtml(format || "content")}</p>
          <p><strong>Location:</strong> ${escapeHtml(location || "IN")}</p>
          <hr />
          <p>${formattedScript}</p>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleApproveAndPublish = (item, script, closeAfter = false) => {
    updateStatus(item.id, "published");
    downloadScriptDocument({
      keyword: item.keyword,
      format: script?.format || item.format,
      script: script?.script || item.script,
      location: item.location,
    });
    if (closeAfter) setPreviewItem(null);
  };

  const handleSaveTracking = async () => {
    if (!previewItem?.contentId) return;

    setIsPublishing(true);
    setPublishError("");
    setSyncFeedback("");
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trackedEntry = updateContentTracking(previewItem.contentId, {
      publication: {
        platform: publishForm.platform || previewItem.publication?.platform || previewItem.format?.split("_")[0] || "general",
        publishedUrl: publishForm.publishedUrl.trim(),
        postId: publishForm.postId.trim(),
      },
      performance: {
        views: Number(publishForm.views || 0),
        clicks: Number(publishForm.clicks || 0),
        likes: Number(publishForm.likes || 0),
        comments: Number(publishForm.comments || 0),
        shares: Number(publishForm.shares || 0),
        saves: Number(publishForm.saves || 0),
        impressions: Number(publishForm.impressions || 0),
      },
    });

    setIsPublishing(false);
    setPreviewItem((prev) =>
      prev
        ? {
            ...prev,
            boardStatus: "published",
            publication: trackedEntry?.publication || prev.publication,
            performance: trackedEntry?.performance || prev.performance,
          }
        : null
    );
  };

  const handleSyncInstagram = async () => {
    if (!previewItem?.contentId) return;

    setIsSyncingInstagram(true);
    setPublishError("");
    setSyncFeedback("");

    try {
      const response = await fetch("/api/meta/instagram/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publishedUrl: publishForm.publishedUrl.trim(),
          postId: publishForm.postId.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Instagram sync failed");
      }

      const mergedPublication = {
        ...(previewItem.publication || {}),
        ...(payload.publication || {}),
      };
      const mergedPerformance = {
        ...(previewItem.performance || {}),
        ...(payload.performance || {}),
        clicks: Number(publishForm.clicks || previewItem.performance?.clicks || 0),
      };

      const trackedEntry = updateContentTracking(previewItem.contentId, {
        publication: mergedPublication,
        performance: mergedPerformance,
      });

      setPublishForm((prev) => ({
        ...prev,
        platform: trackedEntry?.publication?.platform || prev.platform,
        publishedUrl: trackedEntry?.publication?.publishedUrl || prev.publishedUrl,
        postId: trackedEntry?.publication?.postId || prev.postId,
        views: String(trackedEntry?.performance?.views ?? prev.views ?? ""),
        clicks: String(trackedEntry?.performance?.clicks ?? prev.clicks ?? ""),
        likes: String(trackedEntry?.performance?.likes ?? prev.likes ?? ""),
        comments: String(trackedEntry?.performance?.comments ?? prev.comments ?? ""),
        shares: String(trackedEntry?.performance?.shares ?? prev.shares ?? ""),
        saves: String(trackedEntry?.performance?.saves ?? prev.saves ?? ""),
        impressions: String(trackedEntry?.performance?.impressions ?? prev.impressions ?? ""),
      }));
      setPreviewItem((prev) =>
        prev
          ? {
              ...prev,
              publication: trackedEntry?.publication || mergedPublication,
              performance: trackedEntry?.performance || mergedPerformance,
            }
          : null
      );
      setSyncFeedback("Instagram metrics synced from Meta.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Instagram sync failed";
      setPublishError(message);

      const trackedEntry = updateContentTracking(previewItem.contentId, {
        publication: {
          ...(previewItem.publication || {}),
          platform: publishForm.platform || previewItem.publication?.platform || "instagram",
          publishedUrl: publishForm.publishedUrl.trim(),
          postId: publishForm.postId.trim(),
          syncStatus: "error",
          syncError: message,
        },
      });

      setPreviewItem((prev) =>
        prev
          ? {
              ...prev,
              publication: trackedEntry?.publication || prev.publication,
            }
          : null
      );
    } finally {
      setIsSyncingInstagram(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-40 text-center bg-bg-card border border-border/50 rounded-[4rem] shadow-inner">
          <div className="w-28 h-28 rounded-3xl bg-bg-elevated flex items-center justify-center text-txt-muted mx-auto mb-10 shadow-sm ring-[12px] ring-bg-elevated/20 animate-pulse">
            <FileText className="w-14 h-14" />
          </div>
          <h3 className="text-3xl font-black text-txt mb-4 tracking-tight">The board is currently clear</h3>
          <p className="text-base text-txt-muted max-w-sm mx-auto font-medium leading-relaxed italic opacity-80">
            "Efficiency is doing things right; effectiveness is doing the right things."
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-10 px-8 py-3.5 rounded-2xl border-2 border-border text-[11px] font-black uppercase tracking-widest text-txt hover:bg-primary/5 hover:border-primary/20 transition-all"
          >
            Refresh Pipeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
      <div className="space-y-8 border-b border-border pb-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <ListChecks className="w-6 h-6" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-txt tracking-tighter">Director&apos;s Board</h3>
                <p className="text-sm text-txt-muted font-bold tracking-wide uppercase opacity-60">Strategic Content Pipeline</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm text-txt-secondary font-medium leading-relaxed">
              Review scripts, publish them immediately after editor approval, and attach the Instagram or Facebook link later to track performance and improve the next outputs.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
              <input
                type="text"
                placeholder="Search topics, formats, platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-bg-card border border-border focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-3 bg-bg-card border border-border p-1.5 rounded-2xl shadow-sm">
              <button
                onClick={handleApproveAll}
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-success text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-success/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve All Pending
              </button>
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={() => setShowRejected(!showRejected)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  showRejected ? "bg-txt text-white" : "bg-bg-elevated text-txt-muted border border-border hover:text-txt"
                }`}
              >
                {showRejected ? "Hide History" : "Show History"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
          <SummaryCard label="Pending Review" value={getStageCount("pending")} icon={Clock} tone="warning" />
          <SummaryCard label="Approved" value={getStageCount("approved")} icon={CheckCircle2} tone="success" />
          <SummaryCard label="Rejected" value={getStageCount("rejected")} icon={XCircle} tone="danger" />
          <SummaryCard label="Published" value={getStageCount("published")} icon={Rocket} tone="primary" />
          <SummaryCard label="Tracked Clicks" value={totalLiveClicks} icon={MousePointerClick} tone="primary" />
          <SummaryCard label="Tracked Views" value={totalLiveViews} icon={TrendingUp} tone="success" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${
                  activeFilter === filter.id
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white text-txt-muted border-border hover:text-txt hover:border-primary/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-bold text-txt-muted uppercase tracking-[0.18em]">
            {items.length} items in pipeline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {boardStages.map((stage) => {
          const stageItems = getFilteredItems(stage.id);
          const StageIcon = stage.icon;

          return (
            <section key={stage.id} className="rounded-[2rem] border border-border bg-white shadow-sm overflow-hidden">
              <div className={`flex items-center gap-4 px-5 py-5 border-b border-border/80 ${stage.bg}`}>
                <div className={`w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm ${stage.color}`}>
                  <StageIcon className={`w-5 h-5 ${stage.color}`} strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-black text-txt uppercase tracking-[0.2em]">{stage.label}</h4>
                  <p className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.15em] mt-1">
                    {stageItems.length} item{stageItems.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="ml-auto text-[11px] font-black text-white bg-txt px-3 py-1 rounded-xl shadow-sm">
                  {stageItems.length}
                </span>
              </div>

              <div className="p-4 space-y-4 min-h-[420px]">
                {stageItems.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-bg-elevated/30 px-5 py-10 text-center">
                    <p className="text-sm font-bold text-txt-muted">No items here.</p>
                  </div>
                ) : (
                  stageItems.map((item) => {
                    const script = findScript(item);

                    return (
                      <article
                        key={item.id}
                        className="group p-5 rounded-[1.75rem] bg-white border border-border/80 hover:border-primary/30 hover:shadow-[0_20px_40px_-18px_rgba(10,37,64,0.18)] transition-all relative overflow-hidden ring-1 ring-black/5"
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 ${stage.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2 pr-6">
                            {item.research?.impact === "CRITICAL" && (
                              <span className="px-2 py-0.5 rounded-md bg-danger text-white text-[8px] font-black animate-pulse">
                                CRITICAL
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                              {script?.format?.split("_").join(" ") || "General"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-bg-elevated border border-border text-[8px] font-black text-txt-muted uppercase tracking-widest">
                              {item.location || "IN"}
                            </span>
                            {getBoardStage(item.status) === "published" && (
                              <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Rocket className="w-2 h-2" /> Live
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-[16px] font-black text-txt leading-[1.25] tracking-tight group-hover:text-primary transition-colors">
                              {item.keyword}
                            </p>
                            <p className="text-[10px] font-bold text-txt-muted uppercase tracking-[0.15em] mt-2 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(item.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </p>
                          </div>

                          {getBoardStage(item.status) === "published" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <MetricPill label="Views" value={script?.performance?.views || 0} tone="success" />
                              <MetricPill label="Clicks" value={script?.performance?.clicks || 0} tone="primary" />
                            </div>
                          ) : item.research?.recommendedStrategy ? (
                            <div className="p-3 rounded-2xl bg-bg-elevated/40 border border-border/40 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                              <p className="text-[9px] font-black text-primary-hover mb-2 uppercase tracking-widest flex items-center gap-2">
                                <Lightbulb className="w-3.5 h-3.5" /> Strategy
                              </p>
                              <p className="text-[11px] text-txt-secondary leading-relaxed font-medium line-clamp-2">
                                {item.research.recommendedStrategy.bestAngle}
                              </p>
                            </div>
                          ) : null}

                          {script?.tagSnapshot?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {script.tagSnapshot.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-bg-elevated border border-border text-txt-secondary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {script?.publication?.publishedUrl && (
                            <a
                              href={script.publication.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:underline"
                            >
                              <LinkIcon className="w-3.5 h-3.5" /> Open Live Post
                            </a>
                          )}

                          <div className="flex flex-col gap-2 pt-1">
                            {script && (
                              <button
                                onClick={() => openPreview(item, script)}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm ${
                                  getBoardStage(item.status) === "published"
                                    ? "bg-success text-white border-success hover:opacity-90"
                                    : "bg-bg-card border-border text-txt hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                                }`}
                              >
                                <Eye className="w-4 h-4" /> {getBoardStage(item.status) === "published" ? "View Performance" : "Review & Edit"}
                              </button>
                            )}

                            <div className="flex gap-2">
                              {stage.id === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateStatus(item.id, "approved")}
                                    className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-success/5 text-success border border-success/20 cursor-pointer hover:bg-success/10 transition-all flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => updateStatus(item.id, "rejected")}
                                    className="px-3 rounded-xl bg-danger/5 text-danger border border-danger/20 cursor-pointer hover:bg-danger/10 transition-all"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {stage.id === "approved" && (
                                <button
                                  onClick={() => handleApproveAndPublish(item, script)}
                                  className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest grad-primary text-white cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                  <Rocket className="w-3.5 h-3.5" /> Approve & Publish
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="absolute inset-0 bg-txt/60 backdrop-blur-md" onClick={() => !isEditing && setPreviewItem(null)} />

          <div className="relative w-full max-w-[92vw] 2xl:max-w-[1480px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in flex flex-col max-h-[92vh] border border-white/20">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg-elevated/40">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${previewItem.boardStatus === "published" ? "bg-success text-white shadow-success/20" : "bg-primary text-white shadow-primary/20"}`}>
                  {previewItem.boardStatus === "published" ? <TrendingUp className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-black text-txt tracking-tighter">
                      {previewItem.boardStatus === "published"
                        ? "Institutional Performance Report"
                        : "Executive Intelligence Review"}
                    </h4>
                    <span className="px-3 py-1 rounded-lg bg-bg-card border border-border text-[9px] font-black uppercase tracking-widest text-txt-muted">
                      {previewItem.format || "Generic"}
                    </span>
                    {previewItem.boardStatus === "published" && (
                      <span className="px-3 py-1 rounded-lg bg-success/10 border border-success/20 text-[9px] font-black uppercase tracking-widest text-success">
                        Live on Feed
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-txt-muted mt-1 flex items-center gap-2">
                    {previewItem.keyword} <span className="opacity-30">•</span> <Calendar className="w-3.5 h-3.5" />{" "}
                    {new Date(previewItem.savedAt).toLocaleDateString()}
                  </p>
                  {previewItem.publication?.publishedUrl && (
                    <a
                      href={previewItem.publication.publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Open Live Post
                    </a>
                  )}
                  {previewItem.boardStatus === "published" && previewItem.publication?.lastSyncedAt && (
                    <p className="mt-2 text-[10px] font-black text-success uppercase tracking-widest">
                      Meta synced {new Date(previewItem.publication.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="p-3 rounded-2xl hover:bg-bg-elevated transition-all cursor-pointer text-txt-muted hover:text-txt group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col xl:flex-row">
              <div className="xl:w-[44%] p-8 bg-bg-elevated/20 overflow-y-auto custom-scroll border-r border-border flex flex-col items-center justify-center gap-8">
                {previewItem.boardStatus === "published" ? (
                  <div className="w-full max-w-xl space-y-8">
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black text-success uppercase tracking-[0.3em]">Campaign Health</p>
                      <h5 className="text-3xl font-black text-txt tracking-tighter">Live Performance Snapshot</h5>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Total Reach", value: previewItem.performance?.views || 0, change: `${previewItem.performance?.impressions || 0} imp`, icon: Users },
                        { label: "Clicks", value: previewItem.performance?.clicks || 0, change: `${previewItem.performance?.likes || 0} likes`, icon: MousePointerClick },
                        { label: "Comments", value: previewItem.performance?.comments || 0, change: `${previewItem.performance?.shares || 0} shares`, icon: Heart },
                        { label: "Saves", value: previewItem.performance?.saves || 0, change: `${previewItem.publication?.postId || "tracked"}`, icon: Bookmark },
                      ].map((stat) => (
                        <div key={stat.label} className="p-5 rounded-[1.75rem] bg-white border border-border shadow-sm">
                          <stat.icon className="w-5 h-5 text-primary mb-4" />
                          <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-1">{stat.label}</p>
                          <div className="flex items-end justify-between gap-3">
                            <p className="text-2xl font-black text-txt tracking-tighter">{stat.value}</p>
                            <span className="text-[10px] font-black text-success text-right">{stat.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {previewItem.tagSnapshot?.length > 0 && (
                      <div className="p-5 rounded-[1.75rem] bg-white border border-border shadow-sm">
                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-3">Tracked Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {previewItem.tagSnapshot.map((tag) => (
                            <span key={tag} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-primary/5 text-primary border border-primary/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-6 mb-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${!isEditing ? "bg-primary text-white border-primary" : "bg-bg-card text-txt-muted border-border"}`}>
                        <Smartphone className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Mockup</span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <div className="flex items-center gap-2 px-4 py-2 text-txt-muted">
                        <Globe className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">{previewItem.location || "Global"}</span>
                      </div>
                    </div>
                    <SocialPreview format={previewItem.format || "instagram_reel"} script={isEditing ? editBody : previewItem.script} persona="visionary" />
                  </>
                )}
              </div>

              <div className="xl:w-[56%] p-8 flex flex-col bg-white overflow-y-auto custom-scroll">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-[11px] font-black text-txt uppercase tracking-[0.2em] flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-primary" /> Content Refinement
                  </h5>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isEditing ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-3.5 h-3.5" /> Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" /> Edit Script
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 bg-bg-elevated/30 rounded-[2rem] border border-border p-6 relative flex flex-col min-h-[360px]">
                  {isEditing ? (
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-[15px] text-txt-secondary leading-loose font-medium font-sans resize-none custom-scroll"
                      placeholder="Refine your script here..."
                    />
                  ) : (
                    <div className="flex-1 overflow-y-auto custom-scroll pr-4">
                      <pre className="text-[15px] text-txt-secondary leading-loose whitespace-pre-wrap font-sans">
                        {previewItem.script}
                      </pre>
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute bottom-6 right-6">
                      <button
                        onClick={() => handleSaveEdit(previewItem.contentId)}
                        className="px-6 py-3 rounded-xl bg-success text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-black text-primary-hover mb-2 uppercase tracking-widest">Director&apos;s Note</p>
                  <p className="text-xs text-txt-secondary font-medium leading-relaxed italic">
                    "{previewItem.research?.executiveSummary || "Focus on building community trust through transparent educational insights."}"
                  </p>
                </div>

                {previewItem.boardStatus === "published" && (
                  <div className="mt-6 p-6 rounded-2xl bg-success/5 border border-success/10 space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-success uppercase tracking-widest">Performance Tracking</p>
                        <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">Add the live link after posting</span>
                      </div>
                      <button
                        onClick={handleSyncInstagram}
                        disabled={isSyncingInstagram}
                        className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-white border border-success/20 text-success hover:bg-success/5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSyncingInstagram ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing Instagram
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Sync Instagram Metrics
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-2xl bg-white/80 border border-success/10 p-4 space-y-2">
                      <p className="text-[10px] font-black text-txt uppercase tracking-[0.15em]">Meta Sync</p>
                      <p className="text-xs text-txt-secondary font-medium leading-relaxed">
                        Uses the saved Instagram URL or media ID and pulls live metrics from the connected Meta account.
                      </p>
                      {previewItem.publication?.lastSyncedAt && (
                        <p className="text-[10px] font-black text-success uppercase tracking-widest">
                          Last sync: {new Date(previewItem.publication.lastSyncedAt).toLocaleString()}
                        </p>
                      )}
                      {previewItem.publication?.syncStatus === "error" && previewItem.publication?.syncError && (
                        <p className="text-xs font-bold text-danger">{previewItem.publication.syncError}</p>
                      )}
                      {syncFeedback && <p className="text-xs font-bold text-success">{syncFeedback}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Platform">
                        <input
                          type="text"
                          value={publishForm.platform}
                          onChange={(e) => setPublishForm((prev) => ({ ...prev, platform: e.target.value }))}
                          placeholder="youtube / instagram / x"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm"
                        />
                      </Field>
                      <Field label="Post ID">
                        <input
                          type="text"
                          value={publishForm.postId}
                          onChange={(e) => setPublishForm((prev) => ({ ...prev, postId: e.target.value }))}
                          placeholder="optional platform post id"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm"
                        />
                      </Field>
                    </div>

                    <Field label="Live Post URL">
                      <input
                        type="url"
                        value={publishForm.publishedUrl}
                        onChange={(e) => setPublishForm((prev) => ({ ...prev, publishedUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm"
                      />
                    </Field>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        ["views", "Views"],
                        ["clicks", "Clicks"],
                        ["likes", "Likes"],
                        ["comments", "Comments"],
                        ["shares", "Shares"],
                        ["saves", "Saves"],
                      ].map(([key, label]) => (
                        <Field key={key} label={label}>
                          <input
                            type="number"
                            min="0"
                            value={publishForm[key]}
                            onChange={(e) => setPublishForm((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm"
                          />
                        </Field>
                      ))}
                    </div>

                    <Field label="Impressions">
                      <input
                        type="number"
                        min="0"
                        value={publishForm.impressions}
                        onChange={(e) => setPublishForm((prev) => ({ ...prev, impressions: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-border text-sm"
                      />
                    </Field>

                    {publishError && <p className="text-xs font-bold text-danger">{publishError}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-border bg-bg-elevated/30 flex items-center justify-between gap-4">
              <button className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-txt-muted hover:text-txt flex items-center gap-2.5 transition-all">
                <Share2 className="w-4 h-4" /> Team Comments (4)
              </button>

              <div className="flex gap-4">
                {previewItem.boardStatus === "pending" && (
                  <button
                    onClick={() => {
                      updateStatus(previewItem.id, "approved");
                      setPreviewItem(null);
                    }}
                    className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-success text-white hover:opacity-90 transition-all shadow-xl shadow-success/20 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" /> Approve
                  </button>
                )}
                {previewItem.boardStatus === "approved" && (
                  <button
                    onClick={() => handleApproveAndPublish(previewItem, { format: previewItem.format, script: previewItem.script }, true)}
                    className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-accent text-white hover:opacity-90 transition-all shadow-xl shadow-accent/20 flex items-center gap-2.5"
                  >
                    <Rocket className="w-4.5 h-4.5" /> Approve & Publish + Word Doc
                  </button>
                )}
                <button
                  onClick={() => {
                    if (previewItem.boardStatus === "published") {
                      handleSaveTracking();
                      return;
                    }
                    if (previewItem.boardStatus === "approved") {
                      handleApproveAndPublish(previewItem, { format: previewItem.format, script: previewItem.script }, true);
                      return;
                    }
                    setPreviewItem(null);
                  }}
                  disabled={isPublishing || isSyncingInstagram || previewItem.boardStatus === "pending"}
                  className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest grad-primary text-white hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2.5"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Saving...
                    </>
                  ) : previewItem.boardStatus === "approved" ? (
                    <>
                      <Save className="w-4.5 h-4.5" /> Export Word
                    </>
                  ) : previewItem.boardStatus === "published" ? (
                    <>
                      <Save className="w-4.5 h-4.5" /> Save Tracking
                    </>
                  ) : (
                    <>
                      <Save className="w-4.5 h-4.5" /> Awaiting Approval
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const toneClasses = {
    warning: "text-warning bg-warning/5",
    success: "text-success bg-success/5",
    accent: "text-accent bg-accent/5",
    primary: "text-primary bg-primary/5",
    danger: "text-danger bg-danger/5",
  };

  return (
    <div className={`p-5 rounded-[1.75rem] border border-border bg-white shadow-sm ${toneClasses[tone] || ""}`}>
      <Icon className={`w-4 h-4 mb-3 ${toneClasses[tone]?.split(" ")[0] || "text-primary"}`} />
      <p className="text-2xl font-black text-txt tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.18em] mt-1">{label}</p>
    </div>
  );
}

function MetricPill({ label, value, tone }) {
  const toneClasses = {
    success: "bg-success/5 border-success/10 text-success",
    primary: "bg-primary/5 border-primary/10 text-primary",
  };

  return (
    <div className={`p-3 rounded-2xl border ${toneClasses[tone] || "bg-bg-elevated border-border text-txt"}`}>
      <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-base font-black text-txt mt-1">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
