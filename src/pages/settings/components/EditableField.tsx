import { useState, useRef, useEffect, useId } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<void> | void;
  validate?: (value: string) => string | null;
  readOnly?: boolean;
}

export function EditableField({
  label,
  description,
  value,
  placeholder,
  onSave,
  validate,
  readOnly,
}: Props) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const isDirty = draft.trim() !== value;

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("This field cannot be empty");
      return;
    }
    if (validate) {
      const msg = validate(trimmed);
      if (msg) {
        setError(msg);
        return;
      }
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setError(null);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (readOnly) {
    return (
      <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-900 dark:text-white">
            {label}
          </p>
          {description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <span className="text-sm text-surface-500 dark:text-surface-400 truncate max-w-[220px]">
          {value || "Not set"}
        </span>
      </div>
    );
  }

  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="min-w-0 shrink-0">
          <p className="text-sm font-medium text-surface-900 dark:text-white">
            {label}
          </p>
          {description && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {description}
            </p>
          )}
        </label>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={draft}
              placeholder={placeholder}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={saving}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`text-sm text-right text-surface-900 dark:text-white bg-surface-50 dark:bg-surface-700/50 rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-1 w-48 transition-colors ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-surface-200 dark:border-surface-600 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
            />
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              aria-label="Save"
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              aria-label="Cancel"
              className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700/50 disabled:opacity-40 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-700/50 rounded-lg px-3 py-1.5 border border-surface-200 dark:border-surface-600 hover:border-surface-300 dark:hover:border-surface-500 transition-colors truncate max-w-[220px] text-right"
          >
            {value || placeholder || "Set value"}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-500 mt-1.5 text-right"
        >
          {error}
        </p>
      )}
    </div>
  );
}
