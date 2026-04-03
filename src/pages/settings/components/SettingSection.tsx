import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}: Props) {
  return (
    <section
      className="bg-white dark:bg-surface-800/80 rounded-2xl border border-surface-200/60 dark:border-surface-700/30 shadow-sm"
      aria-labelledby={`settings-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center gap-3 p-5 md:p-6 pb-0 md:pb-0">
        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary-500" />
        </div>
        <div>
          <h2
            id={`settings-${title.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-[15px] font-semibold text-surface-900 dark:text-white"
          >
            {title}
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {description}
          </p>
        </div>
      </div>
      <div className="p-5 md:p-6 pt-4 md:pt-5">{children}</div>
    </section>
  );
}
