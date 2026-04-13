"use client";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getNRSBadge(nrs) {
  if (nrs >= 85) return { className: "nrs-high", label: "🔥 HOT", textColor: "text-white" };
  if (nrs >= 70) return { className: "nrs-medium", label: "⚡ HIGH", textColor: "text-black" };
  return { className: "nrs-low", label: "📌 GOOD", textColor: "text-white" };
}

export default function NewsFeed({ news, loading, onUseNews }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!news?.length) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        <p>📰 No news loaded yet</p>
        <p className="text-xs mt-1">News updates every 30 minutes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {news.map((article, i) => {
        const badge = getNRSBadge(article.nrs);
        return (
          <div
            key={article.id || i}
            className={`group p-3.5 rounded-xl bg-surface border transition-all duration-300 hover:shadow-lg ${
              article.isHighOpportunity
                ? "border-danger/30 hover:border-danger/50"
                : "border-border hover:border-primary/30"
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Newsjacking alert banner */}
            {article.isHighOpportunity && (
              <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-danger/10 border border-danger/20">
                <span className="text-[10px] font-bold text-danger">
                  🚨 NEWSJACKING OPPORTUNITY — Act within {article.urgencyWindowHours}h
                </span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
                  {article.headline}
                </h4>
                <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-text-muted">{article.source}</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-[10px] text-text-muted">{timeAgo(article.publishedAt)}</span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.className} ${badge.textColor}`}
                  >
                    NRS {article.nrs} {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={() => onUseNews?.(article)}
              className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all opacity-70 group-hover:opacity-100"
            >
              Generate Content from This News →
            </button>
          </div>
        );
      })}
    </div>
  );
}
