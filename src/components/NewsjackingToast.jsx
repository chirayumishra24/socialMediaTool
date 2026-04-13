"use client";

import { useState, useEffect } from "react";

export default function NewsjackingToast({ news, onGenerate }) {
  const [visible, setVisible] = useState(false);
  const [alertStory, setAlertStory] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!news || news.length === 0) return;

    // Find first high-opportunity story not yet dismissed
    const highNRS = news.find(
      (n) => n.isHighOpportunity && !dismissed.has(n.headline)
    );

    if (highNRS && !alertStory) {
      setAlertStory(highNRS);
      setVisible(true);
      setTimeLeft(30);
    }
  }, [news, dismissed, alertStory]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!visible) return;
    
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleDismiss();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const handleDismiss = () => {
    if (alertStory) {
      setDismissed((prev) => new Set([...prev, alertStory.headline]));
    }
    setVisible(false);
    setAlertStory(null);
  };

  const handleGenerate = () => {
    if (onGenerate && alertStory) {
      onGenerate(alertStory);
    }
    handleDismiss();
  };

  if (!visible || !alertStory) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right max-w-sm">
      <div className="rounded-xl border border-danger/30 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-danger/10 overflow-hidden">
        {/* Urgency bar */}
        <div className="h-1 bg-danger/20">
          <div
            className="h-full bg-gradient-to-r from-danger to-orange-500 transition-all duration-1000"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">🔥</span>
              <div>
                <p className="text-[10px] font-black text-danger uppercase tracking-wider">
                  Newsjacking Alert
                </p>
                <p className="text-[9px] text-text-muted">
                  High-opportunity story detected • NRS {alertStory.nrs}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm leading-none"
            >
              ✕
            </button>
          </div>

          {/* Story */}
          <div className="p-2.5 rounded-lg bg-danger/5 border border-danger/10">
            <p className="text-xs font-bold text-text-primary leading-snug">
              {alertStory.headline}
            </p>
            <p className="text-[10px] text-text-muted mt-1">
              {alertStory.source} • {alertStory.timeAgo}
            </p>
          </div>

          {/* Urgency */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted">⏱️ Trend window:</span>
            <span className="text-[10px] font-bold text-orange-400">
              ~{alertStory.urgencyWindow || "12-18"} hours remaining
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-danger to-orange-500 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-danger/20"
            >
              ⚡ Generate Script
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-text-muted bg-surface-hover border border-border hover:text-text-secondary transition-all cursor-pointer"
            >
              Later
            </button>
          </div>

          {/* Auto-dismiss timer */}
          <p className="text-[9px] text-text-muted text-center">
            Auto-dismiss in {timeLeft}s
          </p>
        </div>
      </div>
    </div>
  );
}
