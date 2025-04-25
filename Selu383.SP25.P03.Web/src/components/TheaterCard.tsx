// src/components/TheaterCard.tsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { TheaterDTO } from "../services/api";
import {
  Card,
  Text,
  Group,
  Button,
  Divider,
  ThemeIcon,
  Box,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMapPin, IconSofa, IconMovie } from "@tabler/icons-react";

interface TheaterCardProps {
  theater: TheaterDTO;
}

const TheaterCard = memo(({ theater }: TheaterCardProps) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={700} size="lg" mb="xs">
        {theater.name}
      </Text>

      <Group gap="xs" mb="md">
        <ThemeIcon
          color={isDark ? "red" : "red"}
          variant="light"
          size="sm"
          radius="xl"
        >
          <IconMapPin size={14} />
        </ThemeIcon>
        <Text
          size="sm"
          style={{
            color: isDark ? theme.colors.gray[4] : theme.colors.gray[7],
          }}
        >
          {theater.address}
        </Text>
      </Group>

      <Group gap="xs" mb="md">
        <ThemeIcon
          color={isDark ? "red" : "red"}
          variant="light"
          size="sm"
          radius="xl"
        >
          <IconSofa size={14} />
        </ThemeIcon>
        <Text
          size="sm"
          style={{
            color: isDark ? theme.colors.gray[4] : theme.colors.gray[7],
          }}
        >
          <Text span fw={600}>
            {theater.seatCount}
          </Text>{" "}
          seats available
        </Text>
      </Group>

      <Divider my="md" />

      <Group justify="center" mt="auto">
        <Button
          component={Link}
          to={`/movies`}
          variant="dark"
          color={isDark ? "red" : "red"}
          size="sm"
          leftSection={<IconMovie size={16} />}
        >
          View Movies
        </Button>
      </Group>
    </Card>
  );
});

// Add display name for debugging
TheaterCard.displayName = "TheaterCard";

export default TheaterCard;
