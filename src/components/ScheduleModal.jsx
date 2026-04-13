"use client";

import { useState } from "react";
import { schedulePost } from "@/lib/ayrshare";

export default function ScheduleModal({ result, onClose }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platforms, setPlatforms] = useState(["instagram"]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleTogglePlatform = (p) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSchedule = async () => {
    if (!date || !time) return alert("Please select date and time.");
    if (platforms.length === 0) return alert("Please select at least one platform.");

    setLoading(true);
    try {
      const scheduledDate = `${date}T${time}:00Z`;
      const res = await schedulePost({
        platforms,
        script: result.script,
        seo: result.seo,
        postDate: scheduledDate,
      });
      setSuccess(res);
    } catch (err) {
      alert("Failed to schedule: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover hover:bg-danger/10 hover:text-danger text-text-muted transition-all"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <span>📅</span> Schedule Post
        </h2>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3 text-success">✅</div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Post Scheduled!</h3>
            <p className="text-sm text-text-secondary mb-6">{success.message}</p>
            <div className="flex gap-2 justify-center">
              {success.platforms.map((p) => (
                <span key={p} className="px-2 py-1 rounded bg-surface-hover text-xs font-bold uppercase border border-border">
                  {p}
                </span>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-4">
              Date: {new Date(success.scheduledDate).toLocaleString()}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                1. Select Platforms
              </label>
              <div className="flex gap-2">
                {["instagram", "youtube", "tiktok", "twitter"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleTogglePlatform(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                      platforms.includes(p)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-hover border-border text-text-secondary hover:border-text-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                2. Select Date & Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              {result.seo?.bestPostingTime && (
                <p className="text-[10px] text-accent mt-2 flex items-center gap-1">
                  <span>💡</span> AI Suggestion: {result.seo.bestPostingTime}
                </p>
              )}
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={handleSchedule}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                ) : (
                  <span>🚀 Schedule Now</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
