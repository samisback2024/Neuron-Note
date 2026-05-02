import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  description,
  action,
  children,
}: PageShellProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <main className="space-y-6">{children}</main>
    </div>
  );
}
