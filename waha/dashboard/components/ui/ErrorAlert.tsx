import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorAlertProps) {
  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-rose-300">Error</p>
        <p className="text-sm text-rose-400/80 mt-0.5 break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
