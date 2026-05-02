import { Accessibility } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { SettingRow } from "../components/SettingRow";
import { ToggleRow } from "../components/ToggleRow";
import {
  useSettingsStore,
  FONT_SCALE_OPTIONS,
} from "../../../lib/settingsStore";
import toast from "react-hot-toast";

export function AccessibilitySection() {
  const {
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
  } = useSettingsStore();

  return (
    <SettingSection
      icon={Accessibility}
      title="Accessibility"
      description="Make Neuron work better for you"
    >
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <ToggleRow
          label="Reduce motion"
          description="Minimize animations and transitions"
          enabled={reducedMotion}
          onChange={(v) => {
            setReducedMotion(v);
            toast.success(v ? "Reduced motion enabled" : "Animations restored");
          }}
        />

        <ToggleRow
          label="High contrast"
          description="Increase contrast for better visibility"
          enabled={highContrast}
          onChange={(v) => {
            setHighContrast(v);
            toast.success(
              v ? "High contrast enabled" : "High contrast disabled",
            );
          }}
        />

        {/* Font scale */}
        <div className="py-3.5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Text size
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Adjust the base font size across the app
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SCALE_OPTIONS.map((opt) => {
              const active = fontScale === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFontScale(opt.value)}
                  aria-pressed={active}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    active
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <SettingRow
          label="Keyboard navigation"
          description="Neuron fully supports keyboard navigation with Tab, Enter, and Escape"
        >
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium">
            Active
          </span>
        </SettingRow>

        {/* Shortcuts reference */}
        <div className="py-3.5">
          <p className="text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400 mb-3">
            Keyboard shortcuts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { keys: "Ctrl + K", action: "Quick capture" },
              { keys: "Ctrl + /", action: "Search" },
              { keys: "Shift + D", action: "Start tour" },
              { keys: "Tab", action: "Navigate forward" },
              { keys: "Shift + Tab", action: "Navigate backward" },
              { keys: "Escape", action: "Close dialogs" },
            ].map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg"
              >
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {shortcut.action}
                </span>
                <kbd className="text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-600 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingSection>
  );
}
