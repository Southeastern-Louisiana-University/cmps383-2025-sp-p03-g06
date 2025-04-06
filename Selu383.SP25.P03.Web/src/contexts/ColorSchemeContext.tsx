// src/contexts/ColorSchemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Define types for color scheme
type ColorScheme = "light" | "dark";

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

// Create context with undefined as default
const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

interface ColorSchemeProviderProps {
  children: ReactNode;
}

export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  // State initialization with null to prevent hydration mismatch
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to initialize color scheme based on user preference
  useEffect(() => {
    // Function to determine initial color scheme
    const getInitialColorScheme = (): ColorScheme => {
      // First check if user has explicitly set a preference in localStorage
      const savedScheme = localStorage.getItem("color-scheme");
      if (savedScheme === "dark" || savedScheme === "light") {
        return savedScheme as ColorScheme;
      }

      // Otherwise, respect system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    // Set the initial color scheme
    const initialScheme = getInitialColorScheme();
    setColorSchemeState(initialScheme);
    setIsInitialized(true);

    // Apply it to the document
    applyColorScheme(initialScheme);
  }, []);

  // Function to apply color scheme to document
  const applyColorScheme = (scheme: ColorScheme) => {
    document.documentElement.setAttribute("data-mantine-color-scheme", scheme);
    document.documentElement.setAttribute("data-color-scheme", scheme);

    if (scheme === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  };

  // Function to update color scheme
  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    localStorage.setItem("color-scheme", newScheme);
    applyColorScheme(newScheme);
  }, []);

  // Function to toggle between light and dark
  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if the user hasn't set an explicit preference
      if (!localStorage.getItem("color-scheme")) {
        setColorScheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isInitialized, setColorScheme]);

  // Don't render children until we've determined the color scheme
  // to prevent flash of wrong theme
  if (!isInitialized) {
    return null;
  }

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
