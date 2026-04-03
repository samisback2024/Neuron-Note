import { useId } from "react";

interface Props {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  disabled,
}: Props) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <label htmlFor={id} className="min-w-0 cursor-pointer select-none">
        <p
          className={`text-sm font-medium ${
            disabled
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
      </label>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-150 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${enabled ? "bg-primary-500" : "bg-surface-300 dark:bg-surface-600"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-150 ease-out ${
            enabled ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
