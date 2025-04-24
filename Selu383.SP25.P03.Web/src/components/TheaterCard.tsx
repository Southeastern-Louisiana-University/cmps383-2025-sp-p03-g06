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
  ActionIcon,
  Tooltip,
  Box,
  Menu,
  ThemeIcon,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconMapPin,
  IconSofa,
  IconPencil,
  IconTrash,
  IconEye,
  IconDots,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";

interface TheaterCardProps {
  theater: TheaterDTO;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

// Memoized component to prevent unnecessary re-renders
const TheaterCard = memo(({ theater, onDelete, isAdmin }: TheaterCardProps) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMantineTheme();

  const confirmDelete = () => {
    modals.openConfirmModal({
      title: <Text fw={700}>Delete Theater</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{theater.name}</strong>? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => onDelete(theater.id),
    });
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="theater-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderTop: `3px solid #e03131`, // Changed from gold to red
        background: isDark
          ? "rgba(37, 38, 43, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
      }}
    >
      <Text
        fw={700}
        size="lg"
        mb="xs"
        style={{
          lineHeight: 1.3,
          color: isDark ? theme.colors.gray[1] : theme.colors.dark[7],
        }}
      >
        {theater.name}
      </Text>

      <Group gap="xs" mb="xs">
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

      <Group justify="space-between" mt="auto" className="card-actions">
        <Button
          component={Link}
          to={`/theaters/${theater.id}`}
          variant="dark"
          color={isDark ? "red" : "red"}
          size="sm"
          leftSection={<IconEye size={16} />}
        >
          View Details
        </Button>

        {isAdmin && (
          <Box pos="relative">
            <Menu position="bottom-end" shadow="md" width={150}>
              <Menu.Target>
                <Tooltip label="Options">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Theater options"
                  >
                    <IconDots size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Actions</Menu.Label>
                <Menu.Item
                  component={Link}
                  to={`/theaters/edit/${theater.id}`}
                  leftSection={<IconPencil size={16} />}
                >
                  Edit Theater
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={confirmDelete}
                >
                  Delete Theater
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        )}
      </Group>
    </Card>
  );
});

// Add display name for debugging
TheaterCard.displayName = "TheaterCard";

export default TheaterCard;
