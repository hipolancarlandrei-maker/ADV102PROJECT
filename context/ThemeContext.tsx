import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";
export type BackgroundType = "none" | "static" | "gif";

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  inputBg: string;
  placeholder: string;
  button: string;
  buttonText: string;
  accent: string;
  accentSecondary: string;
  modalOverlay: string;
}

export interface ThemeContextType {
  mode: ThemeMode;
  theme: { colors: ThemeColors };
  toggleTheme: () => void;
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
  backgroundUri: string;
  customBackgroundUri: string;
  setCustomBackgroundUri: (uri: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: ThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B",
  border: "#E2E8F0",
  inputBg: "#F1F5F9",
  placeholder: "#94A3B8",
  button: "#2563EB",
  buttonText: "#FFFFFF",
  accent: "#3B82F6",
  accentSecondary: "#10B981",
  modalOverlay: "rgba(15, 23, 42, 0.08)",
};

const darkColors: ThemeColors = {
  background: "#050816",
  card: "#0B1120",
  text: "#E2E8F0",
  subtext: "#94A3B8",
  border: "#1E293B",
  inputBg: "#111827",
  placeholder: "#94A3B8",
  button: "#F97316",
  buttonText: "#F8FAFC",
  accent: "#38BDF8",
  accentSecondary: "#34D399",
  modalOverlay: "rgba(0, 0, 0, 0.75)",
};

const THEME_STORAGE_KEY = "themeMode";
const BACKGROUND_STORAGE_KEY = "backgroundType";
const CUSTOM_BACKGROUND_URI_KEY = "customBackgroundUri";

const BACKGROUND_URIS: Record<BackgroundType, string> = {
  none: "",
  static: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  gif: "https://media.giphy.com/media/l0HlQ7LRal9fZomkg/giphy.gif",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("none");
  const [customBackgroundUri, setCustomBackgroundUri] = useState<string>("");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === "light" || value === "dark") {
        setMode(value);
      }
    });
    AsyncStorage.getItem(BACKGROUND_STORAGE_KEY).then((value) => {
      if (value === "none" || value === "static" || value === "gif") {
        setBackgroundType(value);
      }
    });
    AsyncStorage.getItem(CUSTOM_BACKGROUND_URI_KEY).then((value) => {
      if (value) {
        setCustomBackgroundUri(value);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => null);
  }, [mode]);

  useEffect(() => {
    AsyncStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundType).catch(() => null);
  }, [backgroundType]);

  useEffect(() => {
    AsyncStorage.setItem(CUSTOM_BACKGROUND_URI_KEY, customBackgroundUri).catch(() => null);
  }, [customBackgroundUri]);

  const toggleTheme = () => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  };

  const theme = useMemo(
    () => ({ colors: mode === "dark" ? darkColors : lightColors }),
    [mode]
  );

  const backgroundUri =
    backgroundType !== "none" && customBackgroundUri
      ? customBackgroundUri
      : BACKGROUND_URIS[backgroundType];

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme,
        toggleTheme,
        backgroundType,
        setBackgroundType,
        backgroundUri,
        customBackgroundUri,
        setCustomBackgroundUri,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
