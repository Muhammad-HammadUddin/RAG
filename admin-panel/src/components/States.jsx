import { Inbox, WifiOff, RefreshCw } from "lucide-react";

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-ink-700">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div className="w-8 h-8 rounded bg-ink-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-ink-700 rounded" />
          <div className="h-2.5 w-1/5 bg-ink-700 rounded" />
        </div>
        <div className="h-5 w-14 bg-ink-700 rounded" />
        <div className="h-5 w-20 bg-ink-700 rounded" />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ title = "Nothing here yet", description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <div className="w-12 h-12 rounded-full bg-ink-700 flex items-center justify-center mb-4">
      <Inbox size={20} className="text-slate-500" />
    </div>
    <h3 className="text-slate-200 font-medium mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 text-sm font-medium rounded-md bg-signal text-ink-950 hover:bg-signal-dim transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <div className="w-12 h-12 rounded-full bg-rose-soft border border-rose/30 flex items-center justify-center mb-4">
      <WifiOff size={20} className="text-rose" />
    </div>
    <h3 className="text-slate-200 font-medium mb-1">Couldn't load this</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-5">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium rounded-md bg-ink-700 text-slate-200 hover:bg-ink-600 transition-colors flex items-center gap-2"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    )}
  </div>
);
