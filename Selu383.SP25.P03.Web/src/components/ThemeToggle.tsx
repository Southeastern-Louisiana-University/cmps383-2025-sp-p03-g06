// src/components/ThemeToggle.tsx - Enhanced with brand color
import { useState, useEffect } from "react";
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

  if (!mounted) {
    return null;
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
        {isDark ? "Light mode" : "Dark mode"}
      </Button>
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
