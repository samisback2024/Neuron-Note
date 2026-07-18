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
        <div>
          <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Theme
          </p>
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
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      active
                        ? "bg-primary-100 dark:bg-primary-900/20"
                        : "bg-zinc-100 dark:bg-zinc-700"
                    }`}
                  >
                    <opt.icon
                      size={18}
                      className={
                        active
                          ? "text-primary-500"
                          : "text-zinc-500 dark:text-zinc-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div className="mt-6">
          <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Accent color
          </p>
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
        </div>

        {/* Density */}
        <div className="mt-6">
          <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Density
          </p>
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
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reduced motion */}
        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <ToggleRow
            label="Reduce motion"
            description="Minimize animations throughout the interface"
            enabled={reducedMotion}
            onChange={setReducedMotion}
          />
        </div>

        {/* Live preview */}
        <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Preview
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-800/80 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                N
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Project ideas
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  Updated 2 min ago
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This is a sample card showing how your theme, accent color, and
              density will look across Neuron.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-primary-500 text-white text-[11px] font-medium rounded-lg">
                Primary
              </span>
              <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium rounded-lg">
                Secondary
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 text-center">
            {resolvedTheme === "dark" ? "Dark" : "Light"} theme ·{" "}
            {ACCENT_LABELS[accentColor]} accent ·{" "}
            {density === "compact" ? "Compact" : "Comfortable"} density
          </p>
        </div>
      </SettingSection>
    </div>
  );
}
