// src/contexts/ColorSchemeContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ColorSchemeContextType {
  isDark: boolean;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

interface ColorSchemeProviderProps {
  children: ReactNode;
}

export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  // Check if user has a preference stored in localStorage
  const getInitialColorScheme = (): boolean => {
    const savedScheme = localStorage.getItem("color-scheme");
    if (savedScheme) {
      return savedScheme === "dark";
    }
    // If no preference, use system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDark, setIsDark] = useState<boolean>(getInitialColorScheme);

  // Update DOM and localStorage when color scheme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        "light"
      );
    }
    localStorage.setItem("color-scheme", isDark ? "dark" : "light");
  }, [isDark]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("color-scheme") === null) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleColorScheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ColorSchemeContext.Provider value={{ isDark, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextType {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
}
