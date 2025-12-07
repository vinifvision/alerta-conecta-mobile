// src/contexts/ThemeContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definição das cores padrão e alto contraste
const defaultColors = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#333333",
  textSecondary: "#666666",
  primary: "#1650A7",
  tint: "#E3F2FD",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

const highContrastColors = {
  background: "#000000",
  card: "#1C1C1C",
  text: "#FFFFFF",
  textSecondary: "#FFFF00", // Amarelo para destaque
  primary: "#00FFFF", // Ciano forte
  tint: "#333333",
  border: "#FFFFFF",
  white: "#000000",
};

interface ThemeContextData {
  isLargeText: boolean;
  isHighContrast: boolean;
  isDarkMode: boolean; // Mantido caso queira usar no futuro
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  toggleDarkMode: () => void;
  theme: {
    colors: typeof defaultColors;
    fontScale: number; // 1.0 (normal) ou 1.3 (grande)
    sizes: {
      title: number;
      body: number;
      small: number;
    };
  };
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isLargeText, setIsLargeText] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const largeText = await AsyncStorage.getItem("@App:settings:largeText");
      const highContrast = await AsyncStorage.getItem(
        "@App:settings:highContrast",
      );
      const darkMode = await AsyncStorage.getItem("@App:settings:darkMode");

      if (largeText) setIsLargeText(JSON.parse(largeText));
      if (highContrast) setIsHighContrast(JSON.parse(highContrast));
      if (darkMode) setIsDarkMode(JSON.parse(darkMode));
    }
    loadSettings();
  }, []);

  const toggleLargeText = async () => {
    const newVal = !isLargeText;
    setIsLargeText(newVal);
    await AsyncStorage.setItem(
      "@App:settings:largeText",
      JSON.stringify(newVal),
    );
  };

  const toggleHighContrast = async () => {
    const newVal = !isHighContrast;
    setIsHighContrast(newVal);
    await AsyncStorage.setItem(
      "@App:settings:highContrast",
      JSON.stringify(newVal),
    );
  };

  const toggleDarkMode = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem(
      "@App:settings:darkMode",
      JSON.stringify(newVal),
    );
  };

  // Lógica para montar o tema atual
  const currentColors = isHighContrast ? highContrastColors : defaultColors;
  const fontScale = isLargeText ? 1.3 : 1.0;

  const theme = {
    colors: currentColors,
    fontScale,
    sizes: {
      title: 20 * fontScale,
      body: 16 * fontScale,
      small: 12 * fontScale,
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        isLargeText,
        isHighContrast,
        isDarkMode,
        toggleLargeText,
        toggleHighContrast,
        toggleDarkMode,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
