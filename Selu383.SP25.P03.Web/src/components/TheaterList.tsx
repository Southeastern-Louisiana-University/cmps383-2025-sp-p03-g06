// src/components/TheaterList.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { theaterApi, TheaterDTO } from "../services/api";

import {
  Box,
  Container,
  Title,
  Text,
  Loader,
  Alert,
  TextInput,
  Select,
  Button,
  SimpleGrid,
  Card,
  Badge,
  ScrollArea,
  Table,
  Paper,
  Group,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconSearch,
  IconArrowsSort,
  IconTheater,
  IconLayoutGrid,
  IconTable as IconTableView,
  IconMapPin,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const TheaterList = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [filtered, setFiltered] = useState<TheaterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filtersVisible, { toggle: toggleFilters }] = useDisclosure(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    (async () => {
      try {
        const data = await theaterApi.getAllTheaters();
        setTheaters(data);
        setFiltered(data);
      } catch {
        setError("Failed to fetch theaters");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let result = theaters.filter((t) =>
      `${t.name} ${t.address}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const [field, dir] = sortBy.split("-");
    result = result.sort((a, b) => {
      const cmp =
        field === "seats"
          ? a.seatCount - b.seatCount
          : a.name.localeCompare(b.name);
      return dir === "asc" ? cmp : -cmp;
    });
    setFiltered(result);
  }, [theaters, searchQuery, sortBy]);

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
          paddingTop: 48,
          textAlign: "center",
        }}
      >
        <Loader size="md" />
        <Text style={{ marginTop: 16 }}>Loading theaters…</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: "var(--background-darker)",
        minHeight: "100vh",
      }}
    >
      <Container size="xl" style={{ paddingTop: 48, paddingBottom: 48 }}>
        {/* ——— Section Header ——— */}
        <Paper
          withBorder
          style={{
            borderLeft: `4px solid ${theme.colors.red[6]}`,
            backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Group style={{ alignItems: "center", gap: theme.spacing.sm }}>
            <IconTheater size={32} color={theme.colors.red[6]} />
            <Title order={2}>Our Theaters</Title>
          </Group>
        </Paper>

        {/* ——— Search & Filters ——— */}
        <Paper
          withBorder
          style={{
            backgroundColor: isDark
              ? theme.colors.dark[7]
              : theme.colors.gray[1],
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Group style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconSearch size={16} />
            <TextInput
              placeholder="Search theaters…"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.currentTarget.value)
              }
              style={{ flex: 1 }}
            />
            <Button variant="subtle" size="xs" onClick={toggleFilters}>
              {filtersVisible ? "Hide filters" : "Show filters"}
            </Button>
          </Group>

          {filtersVisible && (
            <Group
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
              }}
            >
              <IconArrowsSort size={16} />
              <Select
                placeholder="Sort by"
                data={[
                  { value: "name-asc", label: "Name A→Z" },
                  { value: "name-desc", label: "Name Z→A" },
                  { value: "seats-asc", label: "Seats ↑" },
                  { value: "seats-desc", label: "Seats ↓" },
                ]}
                value={sortBy}
                onChange={(v) => setSortBy(v || "name-asc")}
                style={{ minWidth: 200 }}
              />
            </Group>
          )}
        </Paper>

        {/* ——— View Mode Toggle ——— */}
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <Button
            variant={viewMode === "grid" ? "filled" : "outline"}
            size="xs"
            onClick={() => setViewMode("grid")}
          >
            <IconLayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === "table" ? "filled" : "outline"}
            size="xs"
            style={{ marginLeft: 8 }}
            onClick={() => setViewMode("table")}
          >
            <IconTableView size={16} />
          </Button>
        </Box>

        {/* ——— Error Banner ——— */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            style={{ marginBottom: 24 }}
          >
            {error}
          </Alert>
        )}

        {/* ——— Grid View ——— */}
        {viewMode === "grid" && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} style={{ gap: 24 }}>
            {filtered.map((t) => (
              <Card key={t.id} shadow="md" p="lg" radius="md" withBorder>
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Text fw={500}>{t.name}</Text>
                  <Badge color="red" variant="light">
                    {t.seatCount} seats
                  </Badge>
                </Box>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <IconMapPin size={14} />
                  <Text size="sm" style={{ marginLeft: 4 }}>
                    {t.address}
                  </Text>
                </Box>
                <Box
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Button
                    component={Link}
                    to={`/theaters/${t.id}/movies`}
                    size="xs"
                  >
                    View Movies
                  </Button>
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* ——— Table view ——— */}
        {viewMode === "table" && (
          <Paper
            withBorder
            style={{
              padding: 16,
              marginBottom: 24,
              overflowX: "auto",
              backgroundColor: isDark
                ? theme.colors.dark[7]
                : theme.colors.gray[1],
            }}
          >
            <ScrollArea>
              <Table
                highlightOnHover
                striped
                verticalSpacing="md"
                style={{ minWidth: 900 }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Address</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Seats</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((t) => (
                    <Table.Tr key={t.id}>
                      <Table.Td>{t.name}</Table.Td>
                      <Table.Td>
                        <Group style={{ alignItems: "center", gap: 8 }}>
                          <IconMapPin size={18} />
                          <Text size="md">{t.address}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge size="lg" color="red" variant="filled">
                          {t.seatCount}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Button
                          component={Link}
                          to={`/theaters/${t.id}/movies`}
                          size="sm"
                          variant="light"
                        >
                          View Movies
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TheaterList;
