// src/components/ThemeToggle.tsx - Simplified design
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
        variant={isDark ? "filled" : "outline"}
        color={isDark ? "yellow" : "blue"}
        leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
        onClick={toggleColorScheme}
        fullWidth
      >
        {isDark ? "Light mode" : "Dark mode"}
      </Button>
    );
  }

  return (
    <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <ActionIcon
        variant="outline"
        color={isDark ? "yellow" : "blue"}
        onClick={toggleColorScheme}
        aria-label="Toggle color scheme"
        size="lg"
        radius="md"
        style={{
          borderWidth: "1px",
        }}
      >
        {isDark ? (
          <IconSun size={20} stroke={1.5} />
        ) : (
          <IconMoon size={20} stroke={1.5} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};

export default ThemeToggle;
