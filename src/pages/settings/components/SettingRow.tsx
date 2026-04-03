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
                ? "text-surface-400 dark:text-surface-500"
                : "text-surface-900 dark:text-white"
            }`}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {comingSoon ? (
            <span
              className="text-[11px] font-medium text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-700/50 px-2.5 py-1 rounded-full select-none"
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
