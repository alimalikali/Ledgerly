export type PaletteId = "indigo" | "emerald" | "sunset" | "ocean" | "grape" | "monochrome";
export type ThemeMode = "light" | "dark" | "system";

export interface PaletteColors {
  primary: string;
  primaryHover: string;
  accent: string;
  income: string;
  expense: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface PaletteDef {
  id: PaletteId;
  name: string;
  swatches: string[]; // 4-5 preview swatches
  light: PaletteColors;
  dark: PaletteColors;
}

// Palettes are defined in oklch so they compose cleanly with the base tokens.
export const palettes: Record<PaletteId, PaletteDef> = {
  indigo: {
    id: "indigo",
    name: "Indigo",
    swatches: ["#6366f1", "#818cf8", "#c7d2fe", "#22c55e", "#ef4444"],
    light: {
      primary: "oklch(0.55 0.19 275)",
      primaryHover: "oklch(0.48 0.19 275)",
      accent: "oklch(0.72 0.15 275)",
      income: "oklch(0.62 0.17 155)",
      expense: "oklch(0.62 0.22 25)",
      chart1: "oklch(0.55 0.19 275)",
      chart2: "oklch(0.68 0.15 200)",
      chart3: "oklch(0.72 0.17 330)",
      chart4: "oklch(0.78 0.15 90)",
      chart5: "oklch(0.62 0.17 155)",
    },
    dark: {
      primary: "oklch(0.72 0.17 275)",
      primaryHover: "oklch(0.80 0.15 275)",
      accent: "oklch(0.78 0.15 275)",
      income: "oklch(0.75 0.17 155)",
      expense: "oklch(0.72 0.19 25)",
      chart1: "oklch(0.72 0.17 275)",
      chart2: "oklch(0.75 0.14 200)",
      chart3: "oklch(0.78 0.16 330)",
      chart4: "oklch(0.82 0.14 90)",
      chart5: "oklch(0.75 0.17 155)",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    swatches: ["#059669", "#10b981", "#a7f3d0", "#0ea5e9", "#f43f5e"],
    light: {
      primary: "oklch(0.55 0.15 160)",
      primaryHover: "oklch(0.48 0.15 160)",
      accent: "oklch(0.72 0.14 160)",
      income: "oklch(0.55 0.15 160)",
      expense: "oklch(0.62 0.22 20)",
      chart1: "oklch(0.55 0.15 160)",
      chart2: "oklch(0.70 0.14 195)",
      chart3: "oklch(0.75 0.14 120)",
      chart4: "oklch(0.72 0.17 60)",
      chart5: "oklch(0.62 0.22 20)",
    },
    dark: {
      primary: "oklch(0.72 0.15 160)",
      primaryHover: "oklch(0.80 0.13 160)",
      accent: "oklch(0.78 0.14 160)",
      income: "oklch(0.75 0.15 160)",
      expense: "oklch(0.72 0.19 20)",
      chart1: "oklch(0.72 0.15 160)",
      chart2: "oklch(0.78 0.13 195)",
      chart3: "oklch(0.80 0.14 120)",
      chart4: "oklch(0.80 0.15 60)",
      chart5: "oklch(0.72 0.19 20)",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    swatches: ["#f97316", "#fb7185", "#fbbf24", "#f472b6", "#fde68a"],
    light: {
      primary: "oklch(0.65 0.20 40)",
      primaryHover: "oklch(0.58 0.20 40)",
      accent: "oklch(0.72 0.18 15)",
      income: "oklch(0.62 0.17 155)",
      expense: "oklch(0.62 0.22 20)",
      chart1: "oklch(0.65 0.20 40)",
      chart2: "oklch(0.72 0.18 15)",
      chart3: "oklch(0.78 0.15 80)",
      chart4: "oklch(0.70 0.18 340)",
      chart5: "oklch(0.60 0.19 350)",
    },
    dark: {
      primary: "oklch(0.75 0.17 40)",
      primaryHover: "oklch(0.82 0.15 40)",
      accent: "oklch(0.78 0.16 15)",
      income: "oklch(0.75 0.17 155)",
      expense: "oklch(0.72 0.19 20)",
      chart1: "oklch(0.75 0.17 40)",
      chart2: "oklch(0.78 0.16 15)",
      chart3: "oklch(0.82 0.14 80)",
      chart4: "oklch(0.78 0.16 340)",
      chart5: "oklch(0.72 0.17 350)",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    swatches: ["#0891b2", "#0ea5e9", "#22d3ee", "#67e8f9", "#0369a1"],
    light: {
      primary: "oklch(0.58 0.13 220)",
      primaryHover: "oklch(0.50 0.13 220)",
      accent: "oklch(0.72 0.12 200)",
      income: "oklch(0.62 0.17 155)",
      expense: "oklch(0.62 0.22 25)",
      chart1: "oklch(0.58 0.13 220)",
      chart2: "oklch(0.72 0.12 200)",
      chart3: "oklch(0.68 0.13 240)",
      chart4: "oklch(0.75 0.11 180)",
      chart5: "oklch(0.62 0.17 155)",
    },
    dark: {
      primary: "oklch(0.75 0.13 220)",
      primaryHover: "oklch(0.82 0.11 220)",
      accent: "oklch(0.78 0.12 200)",
      income: "oklch(0.75 0.17 155)",
      expense: "oklch(0.72 0.19 25)",
      chart1: "oklch(0.75 0.13 220)",
      chart2: "oklch(0.78 0.12 200)",
      chart3: "oklch(0.75 0.13 240)",
      chart4: "oklch(0.80 0.11 180)",
      chart5: "oklch(0.75 0.17 155)",
    },
  },
  grape: {
    id: "grape",
    name: "Grape",
    swatches: ["#7c3aed", "#a855f7", "#d8b4fe", "#c084fc", "#6d28d9"],
    light: {
      primary: "oklch(0.55 0.22 300)",
      primaryHover: "oklch(0.48 0.22 300)",
      accent: "oklch(0.72 0.17 320)",
      income: "oklch(0.62 0.17 155)",
      expense: "oklch(0.62 0.22 20)",
      chart1: "oklch(0.55 0.22 300)",
      chart2: "oklch(0.72 0.17 320)",
      chart3: "oklch(0.68 0.19 280)",
      chart4: "oklch(0.75 0.15 340)",
      chart5: "oklch(0.62 0.20 260)",
    },
    dark: {
      primary: "oklch(0.75 0.18 300)",
      primaryHover: "oklch(0.82 0.15 300)",
      accent: "oklch(0.78 0.16 320)",
      income: "oklch(0.75 0.17 155)",
      expense: "oklch(0.72 0.19 20)",
      chart1: "oklch(0.75 0.18 300)",
      chart2: "oklch(0.78 0.16 320)",
      chart3: "oklch(0.75 0.17 280)",
      chart4: "oklch(0.80 0.14 340)",
      chart5: "oklch(0.75 0.17 260)",
    },
  },
  monochrome: {
    id: "monochrome",
    name: "Monochrome",
    swatches: ["#171717", "#525252", "#a3a3a3", "#e5e5e5", "#f5f5f5"],
    light: {
      primary: "oklch(0.25 0 0)",
      primaryHover: "oklch(0.15 0 0)",
      accent: "oklch(0.55 0 0)",
      income: "oklch(0.55 0.14 155)",
      expense: "oklch(0.55 0.19 25)",
      chart1: "oklch(0.25 0 0)",
      chart2: "oklch(0.45 0 0)",
      chart3: "oklch(0.65 0 0)",
      chart4: "oklch(0.80 0 0)",
      chart5: "oklch(0.55 0.14 155)",
    },
    dark: {
      primary: "oklch(0.92 0 0)",
      primaryHover: "oklch(0.98 0 0)",
      accent: "oklch(0.72 0 0)",
      income: "oklch(0.75 0.14 155)",
      expense: "oklch(0.72 0.17 25)",
      chart1: "oklch(0.92 0 0)",
      chart2: "oklch(0.75 0 0)",
      chart3: "oklch(0.58 0 0)",
      chart4: "oklch(0.42 0 0)",
      chart5: "oklch(0.75 0.14 155)",
    },
  },
};

export const paletteList = Object.values(palettes);
