// src/components/MovieTheaterAssignment.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  MultiSelect,
  Alert,
  Loader,
  Center,
  useMantineColorScheme,
} from "@mantine/core";
import { IconAlertCircle, IconX, IconDeviceFloppy } from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { movieApi, theaterApi, MovieDTO, TheaterDTO } from "../services/api";

const MovieTheaterAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [theaters, setTheaters] = useState<TheaterDTO[]>([]);
  const [selectedTheaterIds, setSelectedTheaterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin or manager
    if (!isAdmin && !isManager) {
      navigate("/movies");
      return;
    }

    const fetchData = async () => {
      try {
        if (!id) return;

        // Fetch movie details
        const movieData = await movieApi.getMovieById(parseInt(id));
        setMovie(movieData);

        // Fetch all theaters
        const theatersData = await theaterApi.getAllTheaters();
        setTheaters(theatersData);

        // Fetch theaters this movie is assigned to
        const assignedTheaterIds = await movieApi.getTheatersByMovie(
          parseInt(id)
        );
        setSelectedTheaterIds(assignedTheaterIds.map(String));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, isAdmin, isManager]);

  const handleSave = async () => {
    if (!movie) return;

    try {
      setSaving(true);
      setError(null);

      // Get current assignments to compare
      const currentAssignments = await movieApi.getTheatersByMovie(movie.id);
      const currentSet = new Set(currentAssignments);
      const selectedSet = new Set(selectedTheaterIds.map(Number));

      // Determine theaters to add and remove
      const theatersToAdd = [...selectedSet].filter(
        (id) => !currentSet.has(id)
      );
      const theatersToRemove = [...currentSet].filter(
        (id) => !selectedSet.has(id)
      );

      // Process assignments
      for (const theaterId of theatersToAdd) {
        await movieApi.assignTheaterToMovie(movie.id, theaterId);
      }

      for (const theaterId of theatersToRemove) {
        await movieApi.unassignTheaterFromMovie(movie.id, theaterId);
      }

      // Navigate back to movie details
      navigate(`/movies/${movie.id}/showtimes`);
    } catch (error) {
      console.error("Error saving theater assignments:", error);
      setError("Failed to save theater assignments. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          my="xl"
        >
          Movie not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Manage Theater Assignments - {movie.title}
        </Title>

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

        <Text mb="md">
          Select the theaters where this movie should be shown. If no theaters
          are selected, the movie can play at any theater.
        </Text>

        <MultiSelect
          label="Assigned Theaters"
          placeholder="Select theaters where this movie can play"
          data={theaters.map((theater) => ({
            value: theater.id.toString(),
            label: theater.name,
          }))}
          value={selectedTheaterIds}
          onChange={setSelectedTheaterIds}
          mb="xl"
          searchable
          nothingFoundMessage="No theaters found"
        />

        <Group mt="xl" justify="space-between">
          <Button
            variant="outline"
            color="red"
            onClick={() => navigate(`/movies/${movie.id}/showtimes`)}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>
          <Button
            color={isDark ? "yellow" : "green"}
            onClick={handleSave}
            loading={saving}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            Save Assignments
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default MovieTheaterAssignment;
