"use client";

import { useState } from "react";
import { exportAsMarkdown, exportAsJSON, copyAllToClipboard } from "@/lib/export";

export default function ScriptViewer({ script, research, format, fullResult }) {
  const [copied, setCopied] = useState(false);
  const [copyAllDone, setCopyAllDone] = useState(false);

  if (!script) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = script;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Highlight annotations in the script
  const highlightScript = (text) => {
    return text.split("\n").map((line, i) => {
      let className = "text-text-primary";
      let bg = "";

      // Section headers
      if (/^#{1,3}\s|^HOOK|^PROMISE|^VALUE|^CTA|^SECTION|^SLIDE|^\[TIMESTAMP/i.test(line.trim())) {
        className = "text-primary-light font-bold";
        bg = "bg-primary/5 -mx-4 px-4 py-0.5 rounded";
      }
      // On-screen text annotations
      else if (/\[ONSCREEN TEXT:|TEXT OVERLAY:/i.test(line)) {
        className = "text-accent-light text-xs font-mono";
        bg = "bg-accent/5 -mx-4 px-4 py-0.5 rounded border-l-2 border-accent/30";
      }
      // B-Roll annotations
      else if (/\[B-ROLL:/i.test(line)) {
        className = "text-warning text-xs font-mono italic";
        bg = "bg-warning/5 -mx-4 px-4 py-0.5 rounded border-l-2 border-warning/30";
      }
      // Timestamps
      else if (/\[\d+:\d+/i.test(line)) {
        className = "text-success font-mono text-xs";
      }
      // Editor notes
      else if (/editor note|improvement|changed|rewritten/i.test(line)) {
        className = "text-text-muted text-xs italic";
        bg = "bg-surface-hover -mx-4 px-4 py-0.5 rounded";
      }

      return (
        <div key={i} className={`${bg}`}>
          <span className={className}>{line || "\u00A0"}</span>
        </div>
      );
    });
  };

  // Parse carousel slides if format is instagram_carousel
  const renderCarouselPreview = (text) => {
    // Split text by SLIDE indicators
    const slidesRaw = text.split(/(?=^#{0,3}\s*SLIDE\s*\d+|^\*\*SLIDE\s*\d+\*\*|\[SLIDE\s*\d+\])/im).filter(s => s.trim().length > 0);
    
    return (
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x w-full">
        {slidesRaw.map((slideText, index) => {
          const lines = slideText.trim().split("\n");
          // Try to extract slide number/title
          const slideHeaderMatch = lines[0].match(/.*?SLIDE\s*(\d+)/i);
          const slideNum = slideHeaderMatch ? slideHeaderMatch[1] : (index + 1);
          
          // Remove the header line to show just content
          const contentLines = lines[0].toUpperCase().includes("SLIDE") ? lines.slice(1) : lines;

          return (
            <div key={index} className="snap-center shrink-0 w-64 h-80 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
              <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-50/50 px-4 py-2 text-center text-[10px] font-bold text-indigo-400 tracking-wider">
                SLIDE {slideNum}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {contentLines.join("\n").trim()}
                </p>
              </div>
              <div className="absolute bottom-3 flex justify-center w-full gap-1.5 opacity-40">
                {slidesRaw.map((_, dotIdx) => (
                  <div key={dotIdx} className={`w-1.5 h-1.5 rounded-full ${dotIdx === index ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Research Brief */}
      {research && (
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="text-xs font-bold text-accent-light mb-2 flex items-center gap-1.5">
            <span>🔍</span> Research Brief
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-text-muted">Topic:</span>{" "}
              <span className="text-text-primary font-medium">{research.selectedTopic}</span>
            </div>
            <div>
              <span className="text-text-muted">Angle:</span>{" "}
              <span className="text-text-primary">{research.mainAngle}</span>
            </div>
            <div>
              <span className="text-text-muted">Why Now:</span>{" "}
              <span className="text-text-primary">{research.whyNow}</span>
            </div>
            {research.subAngles?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {research.subAngles.map((angle, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent-light border border-accent/20">
                    {angle}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Script */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <span>📝</span> {format === 'instagram_carousel' ? 'Carousel Preview' : 'Generated Script'}
          </h3>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
          >
            {copied ? "✓ Copied!" : "Copy Script"}
          </button>
        </div>

        {format === 'instagram_carousel' && (
          <div className="mb-4 bg-slate-50 p-4 border border-slate-200 rounded-lg">
            <h4 className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-wider">Visual Preview</h4>
            {renderCarouselPreview(script)}
          </div>
        )}

        <div className="script-viewer max-h-[500px] overflow-y-auto space-y-0.5 text-sm leading-relaxed p-4 rounded-lg bg-slate-50 border border-slate-200">
          {highlightScript(script)}
        </div>
      </div>
    </div>
  );
}
