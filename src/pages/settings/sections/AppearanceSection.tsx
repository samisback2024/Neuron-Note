import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { ToggleRow } from "../components/ToggleRow";
import {
  useSettingsStore,
  ACCENT_PALETTES,
  ACCENT_LABELS,
  type ThemeMode,
  type AccentColor,
  type Density,
} from "../../../lib/settingsStore";

const THEME_OPTIONS: {
  value: ThemeMode;
  icon: typeof Sun;
  label: string;
  desc: string;
}[] = [
  { value: "light", icon: Sun, label: "Light", desc: "Clean & bright" },
  { value: "dark", icon: Moon, label: "Dark", desc: "Easy on the eyes" },
  { value: "system", icon: Monitor, label: "System", desc: "Match your OS" },
];

const DENSITY_OPTIONS: { value: Density; label: string; desc: string }[] = [
  {
    value: "comfortable",
    label: "Comfortable",
    desc: "More space between elements",
  },
  { value: "compact", label: "Compact", desc: "Fit more on screen" },
];

export function AppearanceSection() {
  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    density,
    setDensity,
    reducedMotion,
    setReducedMotion,
    resolvedTheme,
  } = useSettingsStore();

  return (
    <div className="space-y-6">
      <SettingSection
        icon={Palette}
        title="Appearance"
        description="Customize the look and feel"
      >
        {/* Theme */}
        <fieldset>
          <legend className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
            Theme
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setThemeMode(opt.value)}
                  aria-pressed={active}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    active
                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm"
                      : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      active
                        ? "bg-primary-100 dark:bg-primary-900/20"
                        : "bg-surface-100 dark:bg-surface-700"
                    }`}
                  >
                    <opt.icon
                      size={18}
                      className={
                        active
                          ? "text-primary-500"
                          : "text-surface-500 dark:text-surface-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-surface-500">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Accent color */}
        <fieldset className="mt-6">
          <legend className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
            Accent color
          </legend>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((color) => {
              const active = accentColor === color;
              const swatch = ACCENT_PALETTES[color]["500"];
              return (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  aria-pressed={active}
                  aria-label={ACCENT_LABELS[color]}
                  title={ACCENT_LABELS[color]}
                  className={`w-9 h-9 rounded-full border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    active
                      ? "border-primary-500 ring-2 ring-primary-500/20 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}
          </div>
        </fieldset>

        {/* Density */}
        <fieldset className="mt-6">
          <legend className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
            Density
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {DENSITY_OPTIONS.map((opt) => {
              const active = density === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDensity(opt.value)}
                  aria-pressed={active}
                  className={`p-3 rounded-xl border-2 transition-all text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    active
                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm"
                      : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                  }`}
                >
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Reduced motion */}
        <div className="mt-5 pt-5 border-t border-surface-100 dark:border-surface-700/40">
          <ToggleRow
            label="Reduce motion"
            description="Minimize animations throughout the interface"
            enabled={reducedMotion}
            onChange={setReducedMotion}
          />
        </div>
      </SettingSection>

      {/* Live preview */}
      <div
        className="rounded-2xl border border-surface-200/60 dark:border-surface-700/30 p-5 md:p-6"
        aria-label="Appearance preview"
      >
        <p className="text-[12.5px] font-medium text-surface-500 dark:text-surface-400 mb-3">
          Preview
        </p>
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 border border-surface-200/60 dark:border-surface-700/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500" />
            <div>
              <div className="h-3 w-24 bg-primary-200 dark:bg-primary-800 rounded-full" />
              <div className="h-2 w-16 bg-surface-200 dark:bg-surface-700 rounded-full mt-1.5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-surface-200 dark:bg-surface-700 rounded-full" />
            <div className="h-2.5 w-3/4 bg-surface-200 dark:bg-surface-700 rounded-full" />
          </div>
          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 bg-primary-500 text-white text-[11px] font-medium rounded-lg">
              Primary
            </span>
            <span className="px-3 py-1 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 text-[11px] font-medium rounded-lg">
              Secondary
            </span>
          </div>
        </div>
        <p className="text-[11px] text-surface-400 mt-2 text-center">
          {resolvedTheme === "dark" ? "Dark" : "Light"} theme ·{" "}
          {ACCENT_LABELS[accentColor]} accent ·{" "}
          {density === "compact" ? "Compact" : "Comfortable"} density
        </p>
      </div>
    </div>
  );
}
