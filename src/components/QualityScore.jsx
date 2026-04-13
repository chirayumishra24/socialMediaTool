"use client";

export default function QualityScore({ quality }) {
  if (!quality) return null;

  const { score, suggestions, wordCount, estimatedDuration } = quality;

  const getScoreColor = (s) => {
    if (s >= 75) return { stroke: "#10B981", bg: "bg-success/10", text: "text-success", label: "Excellent" };
    if (s >= 50) return { stroke: "#F59E0B", bg: "bg-warning/10", text: "text-warning", label: "Good" };
    return { stroke: "#EF4444", bg: "bg-danger/10", text: "text-danger", label: "Needs Work" };
  };

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-4 rounded-xl bg-surface border border-border animate-slide-up">
      <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-1.5">
        <span>📊</span> Content Quality Score
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="none" stroke="#E2E8F0" strokeWidth="6"
            />
            {/* Score arc */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={color.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color.text}`}>{score}</span>
            <span className="text-[9px] text-text-muted">/100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 flex-1">
          <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${color.bg} ${color.text}`}>
            {color.label}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-text-muted">Words</span>
              <p className="text-text-primary font-medium">{wordCount}</p>
            </div>
            <div>
              <span className="text-text-muted">Duration</span>
              <p className="text-text-primary font-medium">{estimatedDuration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <span className="text-[10px] font-bold text-text-muted">💡 Improvement Suggestions</span>
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-text-secondary px-3 py-2 rounded-lg bg-surface-hover"
            >
              <span className="text-warning shrink-0 mt-0.5">→</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Predictive Metrics (Phase 2) */}
      {quality.predictions && (
        <div className="mt-4 grid grid-cols-3 gap-2 animate-slide-up">
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Expect. Views</span>
            <span className="text-xs font-black text-text-primary">{quality.predictions.views}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-accent/5 border border-accent/20 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold text-accent uppercase tracking-wider mb-0.5">Eng. Rate</span>
            <span className="text-xs font-black text-text-primary">{quality.predictions.engagementRate}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-center flex flex-col justify-center">
            <span className="text-[9px] font-bold text-warning uppercase tracking-wider mb-0.5">Competition</span>
            <span className="text-xs font-black text-text-primary">{quality.predictions.competition}</span>
          </div>
        </div>
      )}
    </div>
  );
}
