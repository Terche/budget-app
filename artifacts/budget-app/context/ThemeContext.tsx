import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

export interface ColorPalette {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  income: string;
  expense: string;
  border: string;
  input: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  light: ColorPalette;
  dark: ColorPalette;
  radius: number;
  gradient: [string, string];
}

export const THEMES: Theme[] = [
  {
    id: "blue",
    name: "Ocean Blue",
    emoji: "🔵",
    radius: 12,
    gradient: ["#1e40af", "#3b82f6"],
    light: {
      text: "#0f172a", tint: "#1e40af",
      background: "#f8fafc", foreground: "#0f172a",
      card: "#ffffff", cardForeground: "#0f172a",
      primary: "#1e40af", primaryForeground: "#ffffff",
      secondary: "#e2e8f0", secondaryForeground: "#1e293b",
      muted: "#f1f5f9", mutedForeground: "#64748b",
      accent: "#dbeafe", accentForeground: "#1e40af",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#10b981", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#10b981", expense: "#ef4444",
      border: "#e2e8f0", input: "#e2e8f0",
    },
    dark: {
      text: "#f1f5f9", tint: "#60a5fa",
      background: "#0f172a", foreground: "#f1f5f9",
      card: "#1e293b", cardForeground: "#f1f5f9",
      primary: "#3b82f6", primaryForeground: "#ffffff",
      secondary: "#1e293b", secondaryForeground: "#f1f5f9",
      muted: "#1e293b", mutedForeground: "#94a3b8",
      accent: "#1e3a5f", accentForeground: "#60a5fa",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#10b981", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#10b981", expense: "#f87171",
      border: "#334155", input: "#334155",
    },
  },
  {
    id: "dark",
    name: "Midnight",
    emoji: "🌑",
    radius: 12,
    gradient: ["#18181b", "#3f3f46"],
    light: {
      text: "#18181b", tint: "#27272a",
      background: "#fafafa", foreground: "#18181b",
      card: "#ffffff", cardForeground: "#18181b",
      primary: "#18181b", primaryForeground: "#fafafa",
      secondary: "#f4f4f5", secondaryForeground: "#18181b",
      muted: "#f4f4f5", mutedForeground: "#71717a",
      accent: "#f4f4f5", accentForeground: "#18181b",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#22c55e", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#22c55e", expense: "#ef4444",
      border: "#e4e4e7", input: "#e4e4e7",
    },
    dark: {
      text: "#fafafa", tint: "#a1a1aa",
      background: "#09090b", foreground: "#fafafa",
      card: "#18181b", cardForeground: "#fafafa",
      primary: "#fafafa", primaryForeground: "#18181b",
      secondary: "#27272a", secondaryForeground: "#fafafa",
      muted: "#27272a", mutedForeground: "#a1a1aa",
      accent: "#27272a", accentForeground: "#fafafa",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#22c55e", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#22c55e", expense: "#f87171",
      border: "#27272a", input: "#27272a",
    },
  },
  {
    id: "teal",
    name: "Teal Forest",
    emoji: "🌿",
    radius: 14,
    gradient: ["#0f766e", "#2dd4bf"],
    light: {
      text: "#042f2e", tint: "#0d9488",
      background: "#f0fdfa", foreground: "#042f2e",
      card: "#ffffff", cardForeground: "#042f2e",
      primary: "#0d9488", primaryForeground: "#ffffff",
      secondary: "#ccfbf1", secondaryForeground: "#134e4a",
      muted: "#f0fdfa", mutedForeground: "#5eead4",
      accent: "#ccfbf1", accentForeground: "#0d9488",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#16a34a", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#16a34a", expense: "#ef4444",
      border: "#99f6e4", input: "#99f6e4",
    },
    dark: {
      text: "#f0fdfa", tint: "#2dd4bf",
      background: "#042f2e", foreground: "#f0fdfa",
      card: "#0d3b38", cardForeground: "#f0fdfa",
      primary: "#2dd4bf", primaryForeground: "#042f2e",
      secondary: "#134e4a", secondaryForeground: "#f0fdfa",
      muted: "#134e4a", mutedForeground: "#5eead4",
      accent: "#0d4f4a", accentForeground: "#2dd4bf",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#4ade80", successForeground: "#ffffff",
      warning: "#fbbf24", warningForeground: "#ffffff",
      income: "#4ade80", expense: "#f87171",
      border: "#134e4a", input: "#134e4a",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    radius: 16,
    gradient: ["#7c3aed", "#c084fc"],
    light: {
      text: "#3b0764", tint: "#a855f7",
      background: "#fdf4ff", foreground: "#3b0764",
      card: "#ffffff", cardForeground: "#3b0764",
      primary: "#a855f7", primaryForeground: "#ffffff",
      secondary: "#f3e8ff", secondaryForeground: "#6b21a8",
      muted: "#faf5ff", mutedForeground: "#a78bfa",
      accent: "#f3e8ff", accentForeground: "#a855f7",
      destructive: "#f43f5e", destructiveForeground: "#ffffff",
      success: "#10b981", successForeground: "#ffffff",
      warning: "#fb923c", warningForeground: "#ffffff",
      income: "#10b981", expense: "#f43f5e",
      border: "#e9d5ff", input: "#e9d5ff",
    },
    dark: {
      text: "#faf5ff", tint: "#c084fc",
      background: "#1a0a2e", foreground: "#faf5ff",
      card: "#2e1055", cardForeground: "#faf5ff",
      primary: "#c084fc", primaryForeground: "#1a0a2e",
      secondary: "#3b1278", secondaryForeground: "#faf5ff",
      muted: "#2e1055", mutedForeground: "#a78bfa",
      accent: "#3b0764", accentForeground: "#c084fc",
      destructive: "#f43f5e", destructiveForeground: "#ffffff",
      success: "#34d399", successForeground: "#ffffff",
      warning: "#fb923c", warningForeground: "#ffffff",
      income: "#34d399", expense: "#fb7185",
      border: "#3b1278", input: "#3b1278",
    },
  },
  {
    id: "rose",
    name: "Rose Gold",
    emoji: "🌸",
    radius: 16,
    gradient: ["#be123c", "#fb7185"],
    light: {
      text: "#4c0519", tint: "#e11d48",
      background: "#fff1f2", foreground: "#4c0519",
      card: "#ffffff", cardForeground: "#4c0519",
      primary: "#e11d48", primaryForeground: "#ffffff",
      secondary: "#ffe4e6", secondaryForeground: "#9f1239",
      muted: "#fff1f2", mutedForeground: "#fb7185",
      accent: "#ffe4e6", accentForeground: "#e11d48",
      destructive: "#be123c", destructiveForeground: "#ffffff",
      success: "#10b981", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#10b981", expense: "#be123c",
      border: "#fecdd3", input: "#fecdd3",
    },
    dark: {
      text: "#fff1f2", tint: "#fb7185",
      background: "#1c0610", foreground: "#fff1f2",
      card: "#2d0a1a", cardForeground: "#fff1f2",
      primary: "#fb7185", primaryForeground: "#1c0610",
      secondary: "#4c0519", secondaryForeground: "#fff1f2",
      muted: "#2d0a1a", mutedForeground: "#fda4af",
      accent: "#3d0d1e", accentForeground: "#fb7185",
      destructive: "#e11d48", destructiveForeground: "#ffffff",
      success: "#34d399", successForeground: "#ffffff",
      warning: "#fbbf24", warningForeground: "#ffffff",
      income: "#34d399", expense: "#fb7185",
      border: "#4c0519", input: "#4c0519",
    },
  },
  {
    id: "amber",
    name: "Amber",
    emoji: "🟡",
    radius: 10,
    gradient: ["#b45309", "#fbbf24"],
    light: {
      text: "#451a03", tint: "#d97706",
      background: "#fffbeb", foreground: "#451a03",
      card: "#ffffff", cardForeground: "#451a03",
      primary: "#d97706", primaryForeground: "#ffffff",
      secondary: "#fef3c7", secondaryForeground: "#92400e",
      muted: "#fef9ee", mutedForeground: "#d97706",
      accent: "#fef3c7", accentForeground: "#d97706",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#16a34a", successForeground: "#ffffff",
      warning: "#f59e0b", warningForeground: "#ffffff",
      income: "#16a34a", expense: "#ef4444",
      border: "#fde68a", input: "#fde68a",
    },
    dark: {
      text: "#fef9ee", tint: "#fbbf24",
      background: "#1c0e00", foreground: "#fef9ee",
      card: "#2d1a00", cardForeground: "#fef9ee",
      primary: "#fbbf24", primaryForeground: "#1c0e00",
      secondary: "#451a03", secondaryForeground: "#fef9ee",
      muted: "#2d1a00", mutedForeground: "#fcd34d",
      accent: "#3d1800", accentForeground: "#fbbf24",
      destructive: "#ef4444", destructiveForeground: "#ffffff",
      success: "#4ade80", successForeground: "#ffffff",
      warning: "#fbbf24", warningForeground: "#000000",
      income: "#4ade80", expense: "#f87171",
      border: "#451a03", input: "#451a03",
    },
  },
];

interface ThemeContextType {
  themeId: string;
  mode: ThemeMode;
  setThemeId: (id: string) => void;
  setMode: (mode: ThemeMode) => void;
  colors: ColorPalette & { radius: number };
  currentTheme: Theme;
}

const THEME_STORAGE_KEY = "peso_tracker_theme_v1";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState("blue");
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const { themeId: tid, mode: m } = JSON.parse(raw);
          if (tid) setThemeIdState(tid);
          if (m === "light" || m === "dark") setModeState(m);
        } catch {
          // ignore
        }
      }
      setLoaded(true);
    });
  }, []);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((raw) => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prev, themeId: id }));
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((raw) => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ ...prev, mode: m }));
    });
  }, []);

  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const palette = mode === "dark" ? currentTheme.dark : currentTheme.light;
  const colors = { ...palette, radius: currentTheme.radius, gradient: currentTheme.gradient };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{ themeId, mode, setThemeId, setMode, colors, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
