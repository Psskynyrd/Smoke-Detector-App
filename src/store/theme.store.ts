// themeStore.ts
import { Appearance } from "react-native";

import { create } from "zustand";

import { darkTheme, lightTheme } from "@/constants/theme";

type ThemeMode = "light" | "dark";
const colorScheme = Appearance.getColorScheme();
let isDarkMode = colorScheme === "dark";

interface ThemeState {
  mode: ThemeMode;
  theme: typeof lightTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: "light",
  theme: lightTheme,
  setMode: (mode) =>
    set({
      mode,
      theme: mode === "dark" ? darkTheme : lightTheme,
    }),
  toggle: () =>
    set((state) => ({
      mode: state.mode === "light" ? "dark" : "light",
      theme: state.mode === "light" ? darkTheme : lightTheme,
    })),
}));

export default useThemeStore;
