import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral",
  className,
  iconClassName,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group cursor-default",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  trendType === "positive" &&
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                  trendType === "negative" &&
                    "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
                  trendType === "neutral" &&
                    "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400"
                )}
              >
                {trend}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/20 shrink-0",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {/* Subtle depth gradient glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent" />
    </div>
  );
}
