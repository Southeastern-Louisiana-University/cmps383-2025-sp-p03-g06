// src/components/ThemeToggle.tsx - Updated with new color theme
import { useState, useEffect, memo } from "react";
import {
  ActionIcon,
  Tooltip,
  Button,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

interface ThemeToggleProps {
  fullWidth?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

// Memoize the component to prevent unnecessary re-renders
const ThemeToggle = memo(
  ({ fullWidth = false, size = "md" }: ThemeToggleProps) => {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";
    const [mounted, setMounted] = useState(false);

    // Only show the toggle after mounting to avoid hydration mismatch
    useEffect(() => {
      setMounted(true);
    }, []);

    const toggleColorScheme = () => {
      setColorScheme(isDark ? "light" : "dark");
    };

    if (!mounted) {
      return null;
    }

    if (fullWidth) {
      return (
        <Button
          variant={isDark ? "filled" : "outline"}
          color={isDark ? "accent" : "primary"}
          leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          onClick={toggleColorScheme}
          fullWidth
        >
          {isDark ? "Light mode" : "Dark mode"}
        </Button>
      );
    }

    return (
      <Tooltip
        label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        position="bottom"
        withArrow
      >
        <ActionIcon
          variant="outline"
          color={isDark ? "accent" : "primary"}
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
          size={size}
          radius="md"
          className="theme-toggle-button"
          style={{
            borderWidth: "1px",
            boxShadow: isDark
              ? "0 0 10px 1px rgba(255, 192, 28, 0.3)"
              : "0 0 10px 1px rgba(199, 0, 54, 0.2)",
          }}
        >
          {isDark ? (
            <IconSun
              size={
                size === "xs"
                  ? 12
                  : size === "sm"
                  ? 16
                  : size === "md"
                  ? 20
                  : size === "lg"
                  ? 24
                  : 28
              }
              stroke={1.5}
            />
          ) : (
            <IconMoon
              size={
                size === "xs"
                  ? 12
                  : size === "sm"
                  ? 16
                  : size === "md"
                  ? 20
                  : size === "lg"
                  ? 24
                  : 28
              }
              stroke={1.5}
            />
          )}
        </ActionIcon>
      </Tooltip>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
