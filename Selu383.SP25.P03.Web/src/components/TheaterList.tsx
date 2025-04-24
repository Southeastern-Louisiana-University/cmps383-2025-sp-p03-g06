// src/components/TheaterList.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { theaterApi, TheaterDTO } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
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
  Box,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconPlus,
  IconSearch,
  IconArrowsSort,
  IconTheater,
  IconLayoutGrid,
  IconTable as IconTableView,
  IconMapPin,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

const TheaterList = () => {
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [filtered, setFiltered] = useState<TheaterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
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

  const handleDelete = async (id: number) => {
    try {
      await theaterApi.deleteTheater(id);
      setTheaters((t) => t.filter((x) => x.id !== id));
    } catch {
      setError("Failed to delete theater");
    }
  };

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
          paddingTop: 48,
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
      <Container size="xl" style={{ marginTop: 48 }}>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Box style={{ display: "flex", alignItems: "center" }}>
            <IconTheater size={32} color="#e03131" />
            <Title
              order={2}
              style={{ color: "#fff", marginLeft: 8, fontSize: "1.8rem" }}
            >
              Our Theaters
            </Title>
          </Box>

          <Box style={{ display: "flex" }}>
            <Button
              variant={viewMode === "grid" ? "filled" : "outline"}
              onClick={() => setViewMode("grid")}
              size="xs"
            >
              <IconLayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "table" ? "filled" : "outline"}
              onClick={() => setViewMode("table")}
              size="xs"
              style={{ marginLeft: 8 }}
            >
              <IconTableView size={16} />
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            style={{ marginBottom: 16 }}
          >
            {error}
          </Alert>
        )}

        <Box style={{ marginBottom: 24 }}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: filtersVisible ? 16 : 0,
            }}
          >
            <IconSearch size={16} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search theaters…"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.currentTarget.value)
              }
              style={{ flex: 1 }}
            />
            <Button
              variant="subtle"
              onClick={toggleFilters}
              size="xs"
              style={{ marginLeft: 8 }}
            >
              {filtersVisible ? "Hide filters" : "Show filters"}
            </Button>
          </Box>

          {filtersVisible && (
            <Box style={{ display: "flex", alignItems: "center" }}>
              <IconArrowsSort size={16} style={{ marginRight: 8 }} />
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
            </Box>
          )}
        </Box>

        {isAdmin && (
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 24,
            }}
          >
            <Button
              component={Link}
              to="/theaters/new"
              color="green"
              size="sm"
              style={{ display: "flex", alignItems: "center" }}
            >
              <IconPlus size={16} style={{ marginRight: 8 }} />
              Add Theater
            </Button>
          </Box>
        )}

        {viewMode === "grid" && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={24}>
            {filtered.map((t) => (
              <Card
                key={t.id}
                shadow="md"
                p="lg"
                radius="md"
                withBorder
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ fontWeight: 500 }}>{t.name}</Text>
                  <Badge variant="light" color="red">
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
                  {isAdmin && (
                    <Button
                      variant="outline"
                      color="red"
                      size="xs"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {viewMode === "table" && (
          <ScrollArea style={{ marginBottom: 24 }}>
            <Table highlightOnHover verticalSpacing="sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Seats</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>
                      <Box style={{ display: "flex", alignItems: "center" }}>
                        <IconMapPin size={14} />
                        <Text size="sm" style={{ marginLeft: 4 }}>
                          {t.address}
                        </Text>
                      </Box>
                    </td>
                    <td>
                      <Badge variant="light" color="red">
                        {t.seatCount}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td>
                        <Box style={{ display: "flex", alignItems: "center" }}>
                          <Button
                            component={Link}
                            to={`/theaters/${t.id}/movies`}
                            size="xs"
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            color="red"
                            size="xs"
                            style={{ marginLeft: 8 }}
                            onClick={() => handleDelete(t.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        )}
      </Container>
    </Box>
  );
};

export default TheaterList;
