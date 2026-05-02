import type { ReactNode } from "react";

interface Props {
  label: string;
  description?: string;
  children?: ReactNode;
  /** Show a "Coming soon" badge instead of children */
  comingSoon?: boolean;
  /** Extra content below the label line */
  footer?: ReactNode;
}

export function SettingRow({
  label,
  description,
  children,
  comingSoon,
  footer,
}: Props) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-sm font-medium ${
              comingSoon
                ? "text-zinc-400 dark:text-zinc-500"
                : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {comingSoon ? (
            <span
              className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full select-none"
              title="This feature is planned for a future release"
            >
              Coming soon
            </span>
          ) : (
            children
          )}
        </div>
      </div>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}
