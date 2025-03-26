// src/components/TheaterList.tsx - Simplified for better legibility
import { useState, useEffect } from "react";
import { theaterApi, TheaterDTO } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import TheaterCard from "./TheaterCard";
import {
  Container,
  Title,
  Group,
  Button,
  Alert,
  Text,
  Loader,
  SimpleGrid,
  Paper,
  Box,
  TextInput,
  Select,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPlus,
  IconSearch,
  IconFilter,
  IconArrowsSort,
  IconEye,
  IconMovie,
  IconTheater,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const TheaterList = () => {
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [filteredTheaters, setFilteredTheaters] = useState<TheaterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [filtersVisible, { toggle: toggleFilters }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useMantineTheme();

  const fetchTheaters = async () => {
    try {
      const data = await theaterApi.getAllTheaters();
      setTheaters(data);
      setFilteredTheaters(data);
    } catch (error) {
      setError("Failed to fetch theaters");
      console.error("Error fetching theaters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  // Filter and sort theaters
  useEffect(() => {
    let result = [...theaters];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (theater) =>
          theater.name.toLowerCase().includes(query) ||
          theater.address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy) {
      const [field, direction] = sortBy.split("-");
      result = result.sort((a, b) => {
        let comparison = 0;

        if (field === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (field === "seats") {
          comparison = a.seatCount - b.seatCount;
        }

        return direction === "asc" ? comparison : -comparison;
      });
    }

    setFilteredTheaters(result);
  }, [theaters, searchQuery, sortBy]);

  const handleDelete = async (id: number) => {
    try {
      await theaterApi.deleteTheater(id);
      setTheaters(theaters.filter((theater) => theater.id !== id));
    } catch (error) {
      setError("Failed to delete theater");
      console.error("Error deleting theater:", error);
    }
  };

  if (loading) {
    return (
      <Container
        mt="xl"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
        }}
      >
        <Loader size="md" />
        <Text mt="md">Loading theaters...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Box mt="xl">
        <Group justify="center" mb="lg">
          <IconTheater
            size={32}
            stroke={1.5}
            color={isDark ? "#d4af37" : "#0d6832"}
          />
          <Title
            order={2}
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: isDark ? "#ffffff" : "#0d6832",
            }}
          >
            Our Theaters
          </Title>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            mb="md"
          >
            {error}
          </Alert>
        )}

        <Paper
          shadow="xs"
          p="md"
          withBorder
          mb="xl"
          radius="md"
          style={{
            background: isDark
              ? "rgba(37, 38, 43, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Group justify="apart" mb={filtersVisible ? "md" : 0}>
            <TextInput
              placeholder="Search theaters..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flexGrow: 1 }}
            />

            <Button
              variant="subtle"
              onClick={toggleFilters}
              leftSection={<IconFilter size={16} />}
              color={isDark ? "gray" : "dark"}
            >
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </Button>
          </Group>

          {filtersVisible && (
            <Box mt="md">
              <Group>
                <Select
                  label="Sort by"
                  placeholder="Sort theaters"
                  leftSection={<IconArrowsSort size={16} />}
                  value={sortBy}
                  onChange={(value) => setSortBy(value || "name-asc")}
                  data={[
                    { value: "name-asc", label: "Name (A-Z)" },
                    { value: "name-desc", label: "Name (Z-A)" },
                    { value: "seats-asc", label: "Seats (Low to High)" },
                    { value: "seats-desc", label: "Seats (High to Low)" },
                  ]}
                  style={{ minWidth: "200px" }}
                />
              </Group>
            </Box>
          )}
        </Paper>

        {isAdmin && (
          <Group justify="flex-end" mb="xl">
            <Button
              component={Link}
              to="/theaters/new"
              color={isDark ? "yellow" : "green"}
              leftSection={<IconPlus size={18} />}
            >
              Add New Theater
            </Button>
          </Group>
        )}

        {filteredTheaters.length === 0 ? (
          <Paper
            p="xl"
            withBorder
            ta="center"
            style={{
              background: isDark
                ? "rgba(37, 38, 43, 0.95)"
                : "rgba(248, 249, 250, 0.95)",
              borderStyle: "dashed",
              borderColor: isDark ? "#d4af37" : "#0d6832",
            }}
          >
            {searchQuery ? (
              <>
                <IconEye
                  size={32}
                  stroke={1.5}
                  color={isDark ? "#d4af37" : "#0d6832"}
                />
                <Text fw={500} c={isDark ? "white" : "dark"} mb="xs" mt="md">
                  No theaters match your search.
                </Text>
                <Text c={isDark ? "gray.4" : "gray.7"}>
                  Try a different search term or clear the filters.
                </Text>
              </>
            ) : (
              <>
                <IconMovie
                  size={32}
                  stroke={1.5}
                  color={isDark ? "#d4af37" : "#0d6832"}
                />
                <Text fw={500} c={isDark ? "white" : "dark"} mb="xs" mt="md">
                  No theaters found.
                </Text>
                {isAdmin && (
                  <Text c={isDark ? "gray.4" : "gray.7"}>
                    Click the "Add New Theater" button to create one.
                  </Text>
                )}
              </>
            )}
          </Paper>
        ) : (
          <SimpleGrid
            cols={{ base: 1, xs: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="xl"
          >
            {filteredTheaters.map((theater) => (
              <TheaterCard
                key={theater.id}
                theater={theater}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
};

export default TheaterList;
