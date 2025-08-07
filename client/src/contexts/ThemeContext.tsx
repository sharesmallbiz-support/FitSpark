import React, { createContext, useContext, useState, useEffect } from "react";
import type { Theme } from "@/lib/themes";
import { getThemeConfig } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeConfig: ReturnType<typeof getThemeConfig>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("fun");
  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", themeConfig.primary);
    root.style.setProperty("--theme-accent", themeConfig.accent);
    root.style.setProperty("--theme-background", themeConfig.background);
  }, [theme, themeConfig]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
