"use client";

export default function RedditFeed({ trends, loading, onUseTrend }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-surface animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-3/4 mb-3"></div>
            <div className="flex gap-2">
              <div className="h-3 bg-surface-hover rounded w-16"></div>
              <div className="h-3 bg-surface-hover rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="p-5 text-center rounded-xl border border-border bg-surface text-sm text-text-muted">
        No Reddit trends found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trends.map((post) => (
        <div
          key={post.id}
          className="p-4 rounded-xl border border-border bg-surface hover:border-accent/40 transition-all group relative overflow-hidden"
        >
          {post.isHighOpportunity && (
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-xl">
              <div className="absolute top-0 right-0 w-16 h-4 bg-accent text-[8px] font-bold text-white text-center transform translate-x-[15px] translate-y-[10px] rotate-45">
                VIRAL
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-2 pr-6">
            <h4 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">
              {post.title}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-medium text-text-muted">
            <span className="flex items-center gap-1">r/{post.subreddit}</span>
            <span className="flex items-center gap-1 text-accent">↑ {post.score > 1000 ? (post.score/1000).toFixed(1) + 'k' : post.score}</span>
            <span className="flex items-center gap-1">💬 {post.numComments > 1000 ? (post.numComments/1000).toFixed(1) + 'k' : post.numComments}</span>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-surface-hover text-text-secondary hover:text-text-primary transition-all text-center flex-1"
            >
              View Post
            </a>
            <button
              onClick={() => onUseTrend(post)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-accent/10 text-accent-light hover:bg-accent/20 transition-all text-center flex-1 cursor-pointer"
            >
              Generate from Trend
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
