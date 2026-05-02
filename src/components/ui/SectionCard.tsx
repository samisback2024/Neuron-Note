import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface SectionCardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionCardHeader({
  title,
  description,
  action,
}: SectionCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-0.5 min-w-0">
        <h2 className="text-base font-semibold text-surface-900 dark:text-zinc-50">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-surface-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
