"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  Calendar,
  Hash,
  Sparkles,
  Loader2,
  Check,
  X,
  Eye,
  Clock,
  AlertCircle,
  ChevronDown,
  Layers,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Smartphone,
  Flame,
  ThumbsUp,
  Globe,
  MoreHorizontal,
  MessageSquare,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/lib/AccountContext";

const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", icon: "IG", color: "from-pink-500 via-rose-500 to-purple-600", maxCaption: 2200 },
  { id: "facebook", label: "Facebook", icon: "FB", color: "from-blue-600 to-indigo-600", maxCaption: 63206 },
];

const SUGGESTED_TAGS = [
  "#skillizee", "#edtech2026", "#studentgrowth", "#schoolleadership",
  "#educationmatters", "#futureoflearning", "#internships", "#innovativelearning"
];

export default function PostComposer({ onPublished, initialContent = "", prefillDate = "", postToEdit = null }) {
  const toast = useToast();
  const { activeAccount } = useAccount();
  const [caption, setCaption] = useState(initialContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram"]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [scheduling, setScheduling] = useState(Boolean(prefillDate));
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [scheduledDate, setScheduledDate] = useState(prefillDate || tomorrow);
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [previewPlatform, setPreviewPlatform] = useState("instagram");

  useEffect(() => {
    if (initialContent) setCaption(initialContent);
    if (prefillDate) {
      setScheduledDate(prefillDate);
      setScheduling(true);
    }
    if (postToEdit) {
      if (postToEdit.caption || postToEdit.content) setCaption(postToEdit.caption || postToEdit.content);
      const media = postToEdit.mediaUrl || postToEdit.thumbnail || postToEdit.url;
      if (media) {
        setMediaUrl(media);
        setMediaPreview(media);
        setIsVideo(!!(postToEdit.isVideo || media.match(/\.(mp4|mov|webm)/i)));
      }
    }
  }, [initialContent, prefillDate, postToEdit]);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const addTagToCaption = (tag) => {
    if (caption.includes(tag)) return;
    setCaption((prev) => (prev ? `${prev.trim()} ${tag}` : tag));
  };

  const extractHashtags = (text) => text.match(/#[\w]+/g) || [];
  const charLimit = Math.min(...selectedPlatforms.map((p) => PLATFORM_OPTIONS.find((o) => o.id === p)?.maxCaption || 2200));
  const progressPercent = Math.min(100, (caption.length / charLimit) * 100);

  const handleEnhanceCaption = async () => {
    if (!caption.trim()) {
      toast.warning("Empty Caption", "Type a basic caption first before enhancing.");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: caption.substring(0, 200),
          format: selectedPlatforms.includes("instagram") ? "instagram_caption" : "facebook_post",
          style: "engaging",
          audience: "general",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.script) {
        setCaption(data.script);
        toast.ai("Caption Enhanced", "Added emotional hooks, emojis, and hashtags.");
      }
    } catch (err) {
      console.error("Caption enhancement failed:", err);
      toast.error("Enhancement Failed", err.message);
    } finally {
      setEnhancing(false);
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() || selectedPlatforms.length === 0) {
      toast.warning("Incomplete Post", "Add a caption and select at least one platform.");
      return;
    }

    if (uploading) {
      toast.warning("Still Uploading", "Wait for the media upload to finish before publishing.");
      return;
    }

    if (selectedPlatforms.includes("instagram") && !mediaUrl) {
      toast.warning("Media Required", "Instagram posts need an image or video. Upload one or paste a public URL.");
      return;
    }

    setPublishing(true);

    try {
      const body = {
        caption: caption.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl || undefined,
        accountId: activeAccount.id,
      };

      if (scheduling && scheduledDate && scheduledTime) {
        body.scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const endpoint = scheduling ? "/api/meta/schedule" : "/api/meta/publish";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // /api/meta/publish returns `errors: [{ platform, error }]` — the
        // per-platform reason is far more useful than the status code.
        const detail = Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.map((e) => `${e.platform}: ${e.error}`).join(" | ")
          : data.error || "Could not publish post.";
        toast.error("Publish Failed", detail);
        console.error("[PostComposer] Publish failed:", data);
      } else {
        const msg = scheduling
          ? `Scheduled for ${new Date(body.scheduledAt).toLocaleString()}`
          : "Published to connected channels!";
        toast.success(scheduling ? "Post Scheduled" : "Post Published", msg);
        if (onPublished) onPublished(data);
      }
    } catch (err) {
      toast.error("Network Error", err.message || "Request failed.");
    } finally {
      setPublishing(false);
    }
  };

  // A picked file has to be hosted before it can be published: Instagram's
  // container endpoint takes an `image_url` that Meta's servers download, so a
  // `blob:` handle from URL.createObjectURL is only ever a local preview.
  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(false);

    const isVid = file.type.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/i.test(file.name);
    setIsVideo(isVid);

    // Show the local preview immediately; it is never used for publishing.
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setMediaPreview(ev.target.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setMediaUrl("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("accountId", activeAccount.id);

      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        setMediaPreview("");
        toast.error("Upload Failed", data.error || "Could not host this file for publishing.");
        return;
      }

      setMediaUrl(data.url);

      if (data.aspectWarning) {
        toast.warning("Media Ready — check framing", data.aspectWarning);
      } else {
        toast.success(
          "Media Ready",
          data.converted
            ? "Converted to JPEG and hosted — Instagram can fetch it."
            : "Uploaded and publicly reachable — Instagram can fetch it."
        );
      }
    } catch (err) {
      setMediaPreview("");
      toast.error("Upload Failed", err.message || "Could not upload this file.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageError(false);
    const cleanUrl = urlInput.trim();
    const isVid = /\.(mp4|mov|webm)(\?.*)?$/i.test(cleanUrl);
    setIsVideo(isVid);
    setMediaPreview(cleanUrl);
    setMediaUrl(cleanUrl);
    setShowUrlModal(false);
    setUrlInput("");
    toast.success("Media Attached", "External media URL linked to post.");
  };

  const clearMedia = () => {
    setMediaPreview("");
    setMediaUrl("");
    setImageError(false);
    setIsVideo(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Left Column: Post Editor & Controls */}
      <div className="lg:col-span-7 space-y-6">
        {/* Platform Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Target Channels
          </label>
          <div className="flex flex-wrap gap-3">
            {PLATFORM_OPTIONS.map((platform) => {
              const selected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    selected
                      ? `bg-gradient-to-r ${platform.color} text-white border-transparent shadow-md`
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/20">
                    {platform.icon}
                  </span>
                  <span>{platform.label}</span>
                  {selected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption Editor */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Caption &amp; Copy
            </label>
            <button
              onClick={handleEnhanceCaption}
              disabled={enhancing || !caption.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>AI Polish &amp; Hooks</span>
            </button>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your high-impact caption here... Add #hashtags or use AI Polish"
            rows={7}
            maxLength={charLimit}
            className="w-full p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
          />

          {/* Hashtag Quick Insertion Cloud */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3 text-indigo-500" /> Recommended Tags:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTagToCaption(tag)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Character Counter & Hashtag count */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {extractHashtags(caption).length} hashtags
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    progressPercent > 90 ? "bg-rose-500" : progressPercent > 70 ? "bg-amber-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-400">
                {caption.length} / {charLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Media Upload Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Media Asset (Photo / Reel / Carousel Cover)
            </label>
            <button
              onClick={() => setShowUrlModal(!showUrlModal)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>{showUrlModal ? "Cancel" : "Attach via URL"}</span>
            </button>
          </div>

          {showUrlModal && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-fade-in">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste direct image or video URL (https://...)"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={handleApplyUrl}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer transition-all"
              >
                Apply
              </button>
            </div>
          )}

          {mediaPreview ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 group">
              {isVideo ? (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full h-56 object-contain bg-black"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Post media preview"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setImageError(true)}
                  className={`w-full h-56 object-cover transition-opacity duration-300 ${
                    imageError ? "opacity-30" : "opacity-100"
                  }`}
                />
              )}

              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/80 text-white">
                  <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-slate-200">Media preview couldn't load</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                    The external host may restrict hotlinking. The URL is still saved.
                  </p>
                </div>
              )}

              {/* Badges & Actions */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                {isVideo ? "🎥 Video / Reel" : "🖼️ Photo"}
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <label className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                </label>
                <button
                  onClick={clearMedia}
                  className="w-8 h-8 rounded-full bg-rose-600/90 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-700 cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                Click or drag &amp; drop media asset
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, WebP, MP4, MOV • Up to 50MB
              </span>
              <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Schedule & Timing Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Schedule Post</h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Set a future broadcast date and time for automatic dispatch.
              </p>
            </div>
            <button
              onClick={() => setScheduling(!scheduling)}
              className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${
                scheduling ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                  scheduling ? "left-[26px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {scheduling && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Publish Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Publish / Schedule Button */}
        <button
          onClick={handlePublish}
          disabled={publishing || !caption.trim() || selectedPlatforms.length === 0}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : scheduling ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>
            {publishing
              ? "Dispatching..."
              : scheduling
              ? `Schedule Post for ${scheduledDate}`
              : `Publish to ${selectedPlatforms.join(" & ")}`}
          </span>
        </button>
      </div>

      {/* Right Column: Real-Time Phone Mockup Preview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm sticky top-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Live Feed Preview
              </h4>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setPreviewPlatform("instagram")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  previewPlatform === "instagram"
                    ? "bg-white dark:bg-slate-700 text-pink-600 font-extrabold shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                IG
              </button>
              <button
                onClick={() => setPreviewPlatform("facebook")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  previewPlatform === "facebook"
                    ? "bg-white dark:bg-slate-700 text-blue-600 font-extrabold shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                FB
              </button>
            </div>
          </div>

          {/* Social Phone Frame */}
          <div className="max-w-[320px] mx-auto rounded-[2.5rem] bg-white dark:bg-slate-950 border-4 border-slate-900 shadow-2xl p-4 overflow-hidden">
            {/* Phone Notch */}
            <div className="w-20 h-3.5 bg-slate-900 rounded-full mx-auto mb-3" />

            {previewPlatform === "facebook" ? (
              /* Facebook Feed Layout */
              <div className="space-y-2.5 animate-fade-in">
                {/* FB Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-xs shadow-sm">
                      f
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                          Skillizee Edu
                        </p>
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-[7px] text-white flex items-center justify-center font-bold">✓</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                        <span>Just now</span>
                        <span>•</span>
                        <Globe className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </div>

                {/* FB Caption (Above Media) */}
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-normal leading-relaxed max-h-24 overflow-y-auto custom-scroll whitespace-pre-wrap">
                  {caption ? caption : "Your Facebook post copy will appear here in real-time..."}
                </div>

                {/* FB Media Area */}
                <div className="w-full h-36 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden border border-slate-200/80 dark:border-slate-800 relative">
                  {mediaPreview && !imageError ? (
                    isVideo ? (
                      <video src={mediaPreview} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Facebook Post Media"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <ImageIcon className="w-6 h-6 text-blue-500" />
                      <span className="text-[9px] font-bold text-slate-500">
                        Facebook Media Attachment
                      </span>
                    </div>
                  )}
                </div>

                {/* FB Reactions bar */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px]">👍</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[7px]">❤️</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300 ml-0.5">48</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span>12 comments</span>
                    <span>•</span>
                    <span>4 shares</span>
                  </div>
                </div>

                {/* FB Action Buttons */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <button className="flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ThumbsUp className="w-3 h-3 text-slate-500" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Share2 className="w-3 h-3 text-slate-500" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Instagram Feed Layout */
              <div className="space-y-3 animate-fade-in">
                {/* Profile Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-black text-[10px] text-indigo-600">
                      S
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">
                      skillizee.io
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">Sponsored • Education</p>
                  </div>
                </div>

                {/* Media Area in Preview */}
                <div className="w-full h-44 rounded-xl bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 relative">
                  {mediaPreview && !imageError ? (
                    isVideo ? (
                      <video src={mediaPreview} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Instagram Reel Preview"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Flame className="w-8 h-8 text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500">
                        High-Converting Reel Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Engagement Icons */}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <MessageCircle className="w-4 h-4" />
                    <Share2 className="w-4 h-4" />
                  </div>
                  <Bookmark className="w-4 h-4" />
                </div>

                {/* Caption in Preview */}
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed max-h-36 overflow-y-auto custom-scroll pr-1">
                  <span className="font-bold mr-1.5 text-slate-900 dark:text-white">skillizee.io</span>
                  {caption ? caption : "Your live post caption will appear here in real-time..."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
