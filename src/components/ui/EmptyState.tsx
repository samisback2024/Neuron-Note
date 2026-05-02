import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-10">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Icon size={24} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {description}
          </p>
        </div>
        {action}
      </div>
    </div>
  );
}
