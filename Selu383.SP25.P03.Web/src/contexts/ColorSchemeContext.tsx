// src/contexts/ColorSchemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Define types for clarity and type safety
type ColorScheme = "light" | "dark";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

// Create context with default values
const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

interface ColorSchemeProviderProps {
  children: ReactNode;
}

export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  // Get initial color scheme
  const getInitialColorScheme = (): ColorScheme => {
    if (typeof window !== "undefined") {
      // First check local storage
      const savedScheme = localStorage.getItem("color-scheme");
      if (savedScheme === "dark" || savedScheme === "light") {
        return savedScheme as ColorScheme;
      }
      // Then check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    // Default fallback
    return "light";
  };

  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    getInitialColorScheme
  );

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleColorScheme = useCallback(() => {
    setColorScheme((prevScheme: ColorScheme) => {
      const newScheme = prevScheme === "dark" ? "light" : "dark";
      localStorage.setItem("color-scheme", newScheme);
      return newScheme;
    });
  }, []);

  // Update DOM when color scheme changes
  useEffect(() => {
    // Apply the color scheme to the HTML element
    if (document.documentElement) {
      if (colorScheme === "dark") {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.setAttribute(
          "data-mantine-color-scheme",
          "dark"
        );
        document.documentElement.setAttribute("data-color-scheme", "dark");
      } else {
        document.documentElement.classList.remove("dark-mode");
        document.documentElement.setAttribute(
          "data-mantine-color-scheme",
          "light"
        );
        document.documentElement.setAttribute("data-color-scheme", "light");
      }
    }

    // Store the user preference in localStorage
    localStorage.setItem("color-scheme", colorScheme);
  }, [colorScheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (localStorage.getItem("color-scheme") === null) {
        setColorScheme(e.matches ? "dark" : "light");
      }
    };

    // Add event listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ColorSchemeContext.Provider
      value={{ colorScheme, setColorScheme, toggleColorScheme }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}

// Custom hook for consuming the context
export function useColorScheme(): ColorSchemeContextType {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
}
