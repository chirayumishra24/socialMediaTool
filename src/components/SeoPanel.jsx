"use client";

import { useState } from "react";

export default function SeoPanel({ seo }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!seo) return null;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const allHashtags = [
    ...(seo.hashtags?.mega || []),
    ...(seo.hashtags?.mid || []),
    ...(seo.hashtags?.niche || []),
  ].join(" ");

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Titles */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-1.5">
          <span>🏷️</span> Title Variants (A/B/C)
        </h3>
        <div className="space-y-2">
          {seo.titles?.map((title, i) => (
            <div
              key={i}
              className="flex items-center gap-2 group"
            >
              <span className="shrink-0 w-5 h-5 rounded-full gradient-primary text-[10px] font-bold flex items-center justify-center text-white">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary">
                {title}
                <span className="ml-2 text-[10px] text-text-muted">({title.length} chars)</span>
              </div>
              <button
                onClick={() => copyToClipboard(title, `title-${i}`)}
                className="shrink-0 px-2 py-1 rounded text-[9px] bg-surface-hover text-text-muted hover:text-primary-light transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                {copiedField === `title-${i}` ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Description or Instagram Captions */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        {seo.instagramCaptions?.length > 0 ? (
          <div>
            <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-1.5">
              <span>📋</span> Instagram Captions (A/B Test)
            </h3>
            <div className="space-y-4">
              {seo.instagramCaptions.map((caption, i) => (
                <div key={i} className="relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(caption, `cap-${i}`)}
                      className="px-2 py-1 rounded text-[9px] bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
                    >
                      {copiedField === `cap-${i}` ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="p-3 bg-surface-hover rounded-lg border border-border">
                    <span className="inline-block px-2 py-0.5 mb-2 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase">
                      Variant {String.fromCharCode(65 + i)}
                    </span>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <span>📋</span> SEO Description
              </h3>
              <button
                onClick={() => copyToClipboard(seo.description, "desc")}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
              >
                {copiedField === "desc" ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {seo.description}
            </p>
          </div>
        )}
      </div>

      {/* Hashtags */}
      <div className="p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <span>#️⃣</span> Hashtag Tiers
          </h3>
          <button
            onClick={() => copyToClipboard(allHashtags, "hashtags")}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
          >
            {copiedField === "hashtags" ? "✓ Copied All!" : "Copy All"}
          </button>
        </div>

        {/* Mega */}
        {seo.hashtags?.mega?.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold text-danger">MEGA (5M+ posts)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {seo.hashtags.mega.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-danger/10 text-danger border border-danger/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mid */}
        {seo.hashtags?.mid?.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-bold text-warning">MID (500K–5M posts)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {seo.hashtags.mid.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-warning/10 text-warning border border-warning/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Niche */}
        {seo.hashtags?.niche?.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-success">NICHE (&lt;500K posts)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {seo.hashtags.niche.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-success/10 text-success border border-success/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail + Posting Time */}
      <div className="grid grid-cols-2 gap-3">
        {seo.thumbnailText && (
          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="text-[10px] font-bold text-text-muted">📸 Thumbnail Text</span>
            <p className="text-sm font-bold text-text-primary mt-1">{seo.thumbnailText}</p>
          </div>
        )}
        {seo.bestPostingTime && (
          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="text-[10px] font-bold text-text-muted">⏰ Best Post Time</span>
            <p className="text-sm font-medium text-accent-light mt-1">{seo.bestPostingTime}</p>
          </div>
        )}
      </div>

      {/* YouTube Tags */}
      {seo.tags?.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-primary">🔖 YouTube Tags</h3>
            <button
              onClick={() => copyToClipboard(seo.tags.join(", "), "tags")}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
            >
              {copiedField === "tags" ? "✓ Copied!" : "Copy Tags"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {seo.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-surface-hover text-text-secondary border border-border">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
