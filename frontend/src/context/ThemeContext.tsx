import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { palettes, type PaletteId, type ThemeMode } from "@/lib/palettes";
import type { Currency } from "@/lib/currency";

interface ThemeState {
  mode: ThemeMode;
  palette: PaletteId;
  currency: Currency;
  setMode: (m: ThemeMode) => void;
  setPalette: (p: PaletteId) => void;
  setCurrency: (c: Currency) => void;
  resolvedMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeState | null>(null);

const STORAGE_KEY = "expense-tracker:theme";

interface StoredTheme {
  mode: ThemeMode;
  palette: PaletteId;
  currency: Currency;
}

function readStored(): StoredTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTheme) : null;
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyTheme(mode: ThemeMode, palette: PaletteId): "light" | "dark" {
  const resolved: "light" | "dark" =
    mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;

  const root = document.documentElement;
  root.dataset.palette = palette;
  root.classList.toggle("dark", resolved === "dark");

  const p = palettes[palette];
  const colors = resolved === "dark" ? p.dark : p.light;
  root.style.setProperty("--palette-primary", colors.primary);
  root.style.setProperty("--palette-primary-hover", colors.primaryHover);
  root.style.setProperty("--palette-accent", colors.accent);
  root.style.setProperty("--palette-income", colors.income);
  root.style.setProperty("--palette-expense", colors.expense);
  root.style.setProperty("--chart-1", colors.chart1);
  root.style.setProperty("--chart-2", colors.chart2);
  root.style.setProperty("--chart-3", colors.chart3);
  root.style.setProperty("--chart-4", colors.chart4);
  root.style.setProperty("--chart-5", colors.chart5);
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [palette, setPaletteState] = useState<PaletteId>("indigo");
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  // Hydrate from storage on mount.
  useEffect(() => {
    const stored = readStored();
    const nextMode = stored?.mode ?? "system";
    const nextPalette = stored?.palette ?? "indigo";
    const nextCurrency = stored?.currency ?? "USD";
    setModeState(nextMode);
    setPaletteState(nextPalette);
    setCurrencyState(nextCurrency);
    setResolvedMode(applyTheme(nextMode, nextPalette));
  }, []);

  // Re-apply whenever mode/palette changes.
  useEffect(() => {
    setResolvedMode(applyTheme(mode, palette));
  }, [mode, palette]);

  // Watch system pref if in system mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolvedMode(applyTheme("system", palette));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, palette]);

  const persist = (next: Partial<StoredTheme>) => {
    const current: StoredTheme = { mode, palette, currency, ...next };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  const value = useMemo<ThemeState>(
    () => ({
      mode,
      palette,
      currency,
      resolvedMode,
      setMode: (m) => {
        setModeState(m);
        persist({ mode: m });
      },
      setPalette: (p) => {
        setPaletteState(p);
        persist({ palette: p });
      },
      setCurrency: (c) => {
        setCurrencyState(c);
        persist({ currency: c });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, palette, currency, resolvedMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
