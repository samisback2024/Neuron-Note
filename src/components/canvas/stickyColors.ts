export const STICKY_COLORS = [
  "yellow",
  "blue",
  "pink",
  "green",
  "purple",
  "orange",
] as const;

export type StickyColor = (typeof STICKY_COLORS)[number];

export const STICKY_COLOR_STYLES: Record<
  StickyColor,
  { bg: string; border: string; swatch: string }
> = {
  yellow: {
    bg: "bg-amber-100 dark:bg-amber-400/15",
    border: "border-amber-300 dark:border-amber-400/40",
    swatch: "bg-amber-300",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-400/15",
    border: "border-blue-300 dark:border-blue-400/40",
    swatch: "bg-blue-300",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-400/15",
    border: "border-pink-300 dark:border-pink-400/40",
    swatch: "bg-pink-300",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-400/15",
    border: "border-green-300 dark:border-green-400/40",
    swatch: "bg-green-300",
  },
  purple: {
    bg: "bg-violet-100 dark:bg-violet-400/15",
    border: "border-violet-300 dark:border-violet-400/40",
    swatch: "bg-violet-300",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-400/15",
    border: "border-orange-300 dark:border-orange-400/40",
    swatch: "bg-orange-300",
  },
};
