// src/components/ThemeToggle.tsx - Updated with new color theme
import { useState, useEffect, memo } from "react";
import {
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
  Button,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

interface ThemeToggleProps {
  fullWidth?: boolean;
}

const ThemeToggle = ({ fullWidth = false }: ThemeToggleProps) => {
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

  if (fullWidth) {
    return (
      <Button
        variant={isDark ? "filled" : "filled"}
        color={isDark ? "yellow" : "brand"}
        leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
        onClick={toggleColorScheme}
        fullWidth
        className="theme-toggle-button"
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

  return (
    <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <ActionIcon
        variant={isDark ? "outline" : "filled"}
        color={isDark ? "#C49102" : "brand"}
        onClick={toggleColorScheme}
        aria-label="Toggle color scheme"
        size="lg"
        radius="md"
        className="theme-toggle-button"
        style={{
          borderWidth: isDark ? "1px" : "0",
          boxShadow: isDark ? "none" : "0 2px 5px rgba(199, 0, 54, 0.3)",
        }}
      >
        {isDark ? (
          <IconSun size={20} stroke={1.5} />
        ) : (
          <IconMoon size={20} stroke={1.5} color="white" />
        )}
      </ActionIcon>
    </Tooltip>
  );
};

export default ThemeToggle;
