"use client";

export function Skeleton({ className = "", rounded = "rounded-xl" }) {
  return (
    <div className={`skeleton-shimmer ${rounded} ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5 rounded-lg" />
        <Skeleton className="w-1/2 h-3.5 rounded-lg" />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <Skeleton className="w-20 h-4 rounded-md" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="w-full h-4 rounded-md" />
        </td>
      ))}
    </tr>
  );
}

export function PostPreviewSkeleton() {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-28 h-3.5 rounded-md" />
          <Skeleton className="w-16 h-2.5 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full h-56 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="w-full h-3 rounded-md" />
        <Skeleton className="w-4/5 h-3 rounded-md" />
        <Skeleton className="w-2/3 h-3 rounded-md" />
      </div>
    </div>
  );
}
