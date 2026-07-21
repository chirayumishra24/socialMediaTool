"use client";

import { useState, useCallback } from "react";
import {
  Send,
  Image,
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
} from "lucide-react";

const PLATFORM_OPTIONS = [
  { id: "instagram", label: "Instagram", icon: "IG", color: "from-pink-500 to-purple-600", maxCaption: 2200 },
  { id: "facebook", label: "Facebook", icon: "FB", color: "from-blue-500 to-indigo-600", maxCaption: 63206 },
];

export default function PostComposer({ onPublished, initialContent = "" }) {
  const [caption, setCaption] = useState(initialContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram"]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const extractHashtags = (text) => (text.match(/#[\w]+/g) || []);
  const charLimit = Math.min(...selectedPlatforms.map((p) => PLATFORM_OPTIONS.find((o) => o.id === p)?.maxCaption || 2200));

  const handleEnhanceCaption = async () => {
    if (!caption.trim()) return;
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
      const data = await res.json();
      if (data.script) {
        setCaption(data.script);
      }
    } catch (err) {
      console.error("Caption enhancement failed:", err);
    } finally {
      setEnhancing(false);
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() || selectedPlatforms.length === 0) return;
    setPublishing(true);
    setResult(null);

    try {
      const body = {
        caption: caption.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl || undefined,
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

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Publishing failed" });
      } else {
        setResult({
          success: true,
          message: scheduling
            ? `Scheduled for ${new Date(body.scheduledAt).toLocaleString()}`
            : "Published successfully!",
          urls: data.urls || [],
        });
        if (onPublished) onPublished(data);
      }
    } catch (err) {
      setResult({ success: false, message: err.message || "Network error" });
    } finally {
      setPublishing(false);
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);

    // For now, use object URL (in production, upload to cloud storage)
    setMediaUrl(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Publish To</h3>
        <div className="flex gap-3">
          {PLATFORM_OPTIONS.map((platform) => {
            const selected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer border-2 ${
                  selected
                    ? `bg-gradient-to-r ${platform.color} text-white border-transparent shadow-lg`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-xs">{platform.icon}</span>
                {platform.label}
                {selected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caption Editor */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Caption</h3>
          <button
            onClick={handleEnhanceCaption}
            disabled={enhancing || !caption.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Enhance
          </button>
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your post caption here... Use #hashtags for better reach"
          rows={6}
          maxLength={charLimit}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none font-medium"
        />

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            {extractHashtags(caption).length > 0 && (
              <span className="flex items-center gap-1 text-indigo-500 font-bold">
                <Hash className="w-3 h-3" />
                {extractHashtags(caption).length} hashtags
              </span>
            )}
          </div>
          <span className={`font-bold ${caption.length > charLimit * 0.9 ? "text-amber-500" : "text-slate-400"}`}>
            {caption.length.toLocaleString()} / {charLimit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Media Upload */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Media</h3>
        
        {mediaPreview ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-100">
            <img src={mediaPreview} alt="Upload preview" className="w-full h-48 object-cover" />
            <button
              onClick={() => { setMediaPreview(""); setMediaUrl(""); }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer">
            <Image className="w-8 h-8 text-slate-300 mb-2" />
            <span className="text-xs text-slate-400 font-bold">Click to upload image or video</span>
            <span className="text-[10px] text-slate-300 mt-1">JPG, PNG, MP4 • Max 50MB</span>
            <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Schedule Toggle */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Schedule</h3>
          <button
            onClick={() => setScheduling(!scheduling)}
            className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
              scheduling ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              scheduling ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>

        {scheduling && (
          <div className="flex gap-3 mt-3">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-32 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}
      </div>

      {/* Result Message */}
      {result && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 ${
          result.success
            ? "bg-emerald-50 border border-emerald-200"
            : "bg-rose-50 border border-rose-200"
        }`}>
          {result.success
            ? <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          }
          <div>
            <p className={`text-sm font-bold ${result.success ? "text-emerald-700" : "text-rose-700"}`}>
              {result.message}
            </p>
            {result.urls?.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View post #{i + 1} <span className="text-[10px]">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        disabled={publishing || !caption.trim() || selectedPlatforms.length === 0}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {publishing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : scheduling ? (
          <Clock className="w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        {publishing
          ? "Publishing..."
          : scheduling
          ? `Schedule to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}`
          : `Publish to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}`
        }
      </button>
    </div>
  );
}
