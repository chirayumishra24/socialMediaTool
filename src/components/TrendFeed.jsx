"use client";

function formatCount(num) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TrendFeed({ trends, keywords, loading, onUseTrend }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Keywords Bar */}
      {keywords?.primary?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.primary.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/15 text-primary-light border border-primary/20"
            >
              {kw.keyword} • {kw.score}
            </span>
          ))}
        </div>
      )}

      {/* Trend Cards */}
      <div className="space-y-2">
        {trends?.map((trend, i) => (
          <div
            key={trend.id || i}
            className="group p-3.5 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-primary-light transition-colors">
                  {trend.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  <span>{trend.channelTitle}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {formatCount(trend.viewCount)}
                  </span>
                  <span>•</span>
                  <span>{trend.duration}</span>
                  <span>•</span>
                  <span>{timeAgo(trend.publishedAt)}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUseTrend?.(trend);
                }}
                className="shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary-light hover:bg-primary/20 border border-primary/20 transition-all opacity-0 group-hover:opacity-100"
              >
                Use Topic →
              </button>
            </div>

            {/* Tags */}
            {trend.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {trend.tags.slice(0, 4).map((tag, j) => (
                  <span
                    key={j}
                    className="px-1.5 py-0.5 rounded text-[9px] bg-surface-hover text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
