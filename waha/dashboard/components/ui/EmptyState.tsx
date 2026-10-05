import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center px-4">
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5">
        <Icon className="h-10 w-10 text-slate-500" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
