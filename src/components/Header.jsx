"use client";

export default function Header() {
  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-40">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Content Intelligence Dashboard</h2>
        <p className="text-xs text-text-muted">
          Powered by Multi-Agent AI Pipeline • Researcher → Writer → Editor → SEO
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover border border-border text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Gemini 2.5 Flash
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover border border-border text-xs text-text-secondary">
          <span>🇮🇳</span> India
        </div>
      </div>
    </header>
  );
}
