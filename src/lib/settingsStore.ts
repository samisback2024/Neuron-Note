import { create } from "zustand";

/* ── Types ── */

export type ThemeMode = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
export type AccentColor =
  | "blue"
  | "violet"
  | "green"
  | "rose"
  | "amber"
  | "teal";

export interface NotificationPrefs {
  email: boolean;
  desktop: boolean;
  dailySummary: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

/* ── Accent color palettes ── */

export const ACCENT_PALETTES: Record<AccentColor, Record<string, string>> = {
  blue: {
    "50": "#eef2fe",
    "100": "#dde5fd",
    "200": "#bbcbfb",
    "300": "#99b1f9",
    "400": "#7797f7",
    "500": "#4f7df3",
    "600": "#3a64d8",
    "700": "#2a4cb0",
    "800": "#1d3588",
    "900": "#112060",
  },
  violet: {
    "50": "#f3f1fe",
    "100": "#e7e3fd",
    "200": "#cfc7fb",
    "300": "#b7abf9",
    "400": "#9f8ff7",
    "500": "#8b7cf6",
    "600": "#6c5dd3",
    "700": "#5244a8",
    "800": "#3b2f7d",
    "900": "#261e52",
  },
  green: {
    "50": "#edfbf3",
    "100": "#d0f5e2",
    "200": "#a1ebc5",
    "300": "#72e1a8",
    "400": "#3ddc97",
    "500": "#2bb87d",
    "600": "#1f9463",
    "700": "#167049",
    "800": "#0d4c30",
    "900": "#062817",
  },
  rose: {
    "50": "#fff1f2",
    "100": "#ffe4e6",
    "200": "#fecdd3",
    "300": "#fda4af",
    "400": "#fb7185",
    "500": "#f43f5e",
    "600": "#e11d48",
    "700": "#be123c",
    "800": "#9f1239",
    "900": "#881337",
  },
  amber: {
    "50": "#fffbeb",
    "100": "#fef3c7",
    "200": "#fde68a",
    "300": "#fcd34d",
    "400": "#fbbf24",
    "500": "#f59e0b",
    "600": "#d97706",
    "700": "#b45309",
    "800": "#92400e",
    "900": "#78350f",
  },
  teal: {
    "50": "#f0fdfa",
    "100": "#ccfbf1",
    "200": "#99f6e4",
    "300": "#5eead4",
    "400": "#2dd4bf",
    "500": "#14b8a6",
    "600": "#0d9488",
    "700": "#0f766e",
    "800": "#115e59",
    "900": "#134e4a",
  },
};

export const ACCENT_LABELS: Record<AccentColor, string> = {
  blue: "Blue",
  violet: "Violet",
  green: "Green",
  rose: "Rose",
  amber: "Amber",
  teal: "Teal",
};

export const FONT_SCALE_OPTIONS = [
  { value: 0.9, label: "Small" },
  { value: 1, label: "Default" },
  { value: 1.1, label: "Large" },
  { value: 1.2, label: "Extra large" },
];

/* ── Persistence ── */

const STORAGE_KEY = "neuron-settings";

interface PersistedSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  density: Density;
  reducedMotion: boolean;
  highContrast: boolean;
  fontScale: number;
  notifications: NotificationPrefs;
}

const defaults: PersistedSettings = {
  themeMode: "system",
  accentColor: "blue",
  density: "comfortable",
  reducedMotion: false,
  highContrast: false,
  fontScale: 1,
  notifications: {
    email: true,
    desktop: false,
    dailySummary: true,
    productUpdates: true,
    securityAlerts: true,
  },
};

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        notifications: { ...defaults.notifications, ...parsed.notifications },
      };
    }
  } catch {
    /* corrupted data — use defaults */
  }
  // Migrate legacy theme setting
  const legacy = localStorage.getItem("neuron-theme");
  if (legacy === "dark" || legacy === "light") {
    return { ...defaults, themeMode: legacy };
  }
  return { ...defaults };
}

function persist(state: PersistedSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ── DOM side-effects ── */

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  // Keep legacy key in sync so the main store's initial read still works
  localStorage.setItem("neuron-theme", resolved);
}

function applyAccentColor(color: AccentColor) {
  const palette = ACCENT_PALETTES[color];
  const root = document.documentElement;
  for (const [shade, value] of Object.entries(palette)) {
    root.style.setProperty(`--color-primary-${shade}`, value);
  }
}

function applyDensity(density: Density) {
  document.documentElement.setAttribute("data-density", density);
}

function applyFontScale(scale: number) {
  document.documentElement.style.fontSize = `${15 * scale}px`;
}

function applyHighContrast(enabled: boolean) {
  document.documentElement.toggleAttribute("data-high-contrast", enabled);
}

function applyReducedMotion(enabled: boolean) {
  document.documentElement.toggleAttribute("data-reduced-motion", enabled);
}

/* ── Store ── */

interface SettingsStore extends PersistedSettings {
  /** Resolved (computed) theme — always light or dark */
  resolvedTheme: "light" | "dark";

  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setDensity: (density: Density) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setFontScale: (scale: number) => void;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;

  /** Re-apply all DOM side-effects (call once on app boot) */
  hydrate: () => void;
}

function extractPersisted(
  s: SettingsStore | PersistedSettings,
): PersistedSettings {
  return {
    themeMode: s.themeMode,
    accentColor: s.accentColor,
    density: s.density,
    reducedMotion: s.reducedMotion,
    highContrast: s.highContrast,
    fontScale: s.fontScale,
    notifications: s.notifications,
  };
}

const initial = loadSettings();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initial,
  resolvedTheme: resolveTheme(initial.themeMode),

  setThemeMode: (themeMode) => {
    applyTheme(themeMode);
    const next = { ...extractPersisted(get()), themeMode };
    persist(next);
    set({ themeMode, resolvedTheme: resolveTheme(themeMode) });
  },

  setAccentColor: (accentColor) => {
    applyAccentColor(accentColor);
    const next = { ...extractPersisted(get()), accentColor };
    persist(next);
    set({ accentColor });
  },

  setDensity: (density) => {
    applyDensity(density);
    const next = { ...extractPersisted(get()), density };
    persist(next);
    set({ density });
  },

  setReducedMotion: (reducedMotion) => {
    applyReducedMotion(reducedMotion);
    const next = { ...extractPersisted(get()), reducedMotion };
    persist(next);
    set({ reducedMotion });
  },

  setHighContrast: (highContrast) => {
    applyHighContrast(highContrast);
    const next = { ...extractPersisted(get()), highContrast };
    persist(next);
    set({ highContrast });
  },

  setFontScale: (fontScale) => {
    applyFontScale(fontScale);
    const next = { ...extractPersisted(get()), fontScale };
    persist(next);
    set({ fontScale });
  },

  updateNotifications: (updates) => {
    const notifications = { ...get().notifications, ...updates };
    const next = { ...extractPersisted(get()), notifications };
    persist(next);
    set({ notifications });
  },

  hydrate: () => {
    const s = get();
    applyTheme(s.themeMode);
    applyAccentColor(s.accentColor);
    applyDensity(s.density);
    applyFontScale(s.fontScale);
    applyHighContrast(s.highContrast);
    applyReducedMotion(s.reducedMotion);
  },
}));

/* Listen for system theme changes so "System" option stays reactive */
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const { themeMode } = useSettingsStore.getState();
      if (themeMode === "system") {
        applyTheme("system");
        useSettingsStore.setState({ resolvedTheme: resolveTheme("system") });
      }
    });
}
