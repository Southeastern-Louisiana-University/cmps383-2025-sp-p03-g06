// src/components/managers/MovieManager.tsx
import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Group,
  Button,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  MultiSelect,
  Image,
  Text,
  Badge,
  Stack,
  Loader,
  Center,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconStar,
  IconStarFilled,
  IconStarHalfFilled,
} from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { movieApi, MovieDTO, theaterApi } from "../services/api";
import MovieRating from "./MovieRating";

const MovieManager: React.FC = () => {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theaters, setTheaters] = useState<{ value: string; label: string }[]>(
    []
  );

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<MovieDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<MovieDTO, "id">>({
    title: "",
    description: "",
    durationMinutes: 90,
    rating: "PG",
    posterImageUrl: "",
    trailerUrl: "",
    releaseDate: new Date().toISOString(),
    genres: [],
    ratingScore: undefined,
    theaters: [],
  });

  // Available ratings and genres
  const availableRatings = ["G", "PG", "PG-13", "R", "NC-17"];
  const availableGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Drama",
    "Family",
    "Horror",
    "Musical",
    "Science Fiction",
    "Thriller",
  ];

  // Load movies and theaters on component mount
  useEffect(() => {
    Promise.all([
      fetchMovies(),
      theaterApi.getAllTheaters().then((theaters) => {
        setTheaters(
          theaters.map((theater) => ({
            value: theater.id.toString(),
            label: theater.name,
          }))
        );
      }),
    ]).catch((err) => {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    });
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieApi.getAllMovies();
      setMovies(data);
      setError(null);
    } catch (err) {
      setError("Failed to load movies");
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      durationMinutes: 90,
      rating: "PG",
      posterImageUrl: "",
      trailerUrl: "",
      releaseDate: new Date().toISOString(),
      genres: [],
      ratingScore: undefined,
      theaters: [],
    });
    setIsModalOpen(true);
  };

  const handleEditMovie = (movie: MovieDTO) => {
    setIsEditing(true);
    setCurrentMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      posterImageUrl: movie.posterImageUrl || "",
      trailerUrl: movie.trailerUrl || "",
      releaseDate: movie.releaseDate,
      genres: movie.genres || [],
      ratingScore: movie.ratingScore,
      theaters: movie.theaters || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteMovie = (movie: MovieDTO) => {
    setCurrentMovie(movie);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMovie = async () => {
    if (!currentMovie) return;

    try {
      setLoading(true);
      await movieApi.deleteMovie(currentMovie.id);
      await fetchMovies();
      setIsDeleteModalOpen(false);
      setCurrentMovie(null);
    } catch (err) {
      setError("Failed to delete movie");
      console.error("Error deleting movie:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMovie = async () => {
    try {
      setLoading(true);
      setError(null);

      // First save the movie
      const savedMovie = isEditing
        ? await movieApi.updateMovie(currentMovie!.id, formData)
        : await movieApi.createMovie(formData);

      // After saving the movie, update theater assignments if theaters were selected
      if (savedMovie) {
        const selectedTheaterIds = (formData.theaters || []).map((t) => t.id);
        const currentTheaterIds = await movieApi.getTheatersByMovie(
          savedMovie.id
        );

        // Determine which theaters to add and remove
        const theatersToAdd = selectedTheaterIds.filter(
          (id) => !currentTheaterIds.includes(id)
        );
        const theatersToRemove = currentTheaterIds.filter(
          (id) => !selectedTheaterIds.includes(id)
        );

        // Process assignments in parallel
        await Promise.all([
          // Remove from unselected theaters
          ...theatersToRemove.map((theaterId) =>
            theaterApi.unassignMovieFromTheater({
              movieId: savedMovie.id,
              theaterId: theaterId,
            })
          ),
          // Add to selected theaters
          ...theatersToAdd.map((theaterId) =>
            theaterApi.assignMovieToTheater({
              movieId: savedMovie.id,
              theaterId: theaterId,
            })
          ),
        ]);
      }

      await fetchMovies();
      setIsModalOpen(false);
      setCurrentMovie(null);
      setError(null);
    } catch (err: any) {
      console.error("Error in handleSaveMovie:", err);
      setError(
        err.message ||
          "Failed to save movie. Please check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    console.log(`Updating form field "${name}" with value:`, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !movies.length) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Box p="xl">
      <Paper p="xl" radius="md">
        <Group justify="space-between" mb="xl">
          <Title order={2}>Movie Management</Title>
          <Button
            onClick={() => {
              setIsEditing(false);
              setCurrentMovie(null);
              setFormData({
                title: "",
                description: "",
                durationMinutes: 90,
                rating: "PG",
                posterImageUrl: "",
                trailerUrl: "",
                releaseDate: new Date().toISOString(),
                genres: [],
                ratingScore: undefined,
                theaters: [],
              });
              setIsModalOpen(true);
            }}
            leftSection={<IconPlus size={18} />}
            color="red"
          >
            Add Movie
          </Button>
        </Group>

        <TextInput
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="lg"
          leftSection={<IconSearch size={18} />}
        />

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "80px" }}></Table.Th>
              <Table.Th style={{ width: "25%" }}>Title</Table.Th>
              <Table.Th style={{ width: "100px", textAlign: "center" }}>
                Duration
              </Table.Th>
              <Table.Th style={{ width: "100px", textAlign: "center" }}>
                Rating
              </Table.Th>
              <Table.Th style={{ width: "150px", textAlign: "center" }}>
                Stars
              </Table.Th>
              <Table.Th style={{ width: "25%", textAlign: "center" }}>
                Genres
              </Table.Th>
              <Table.Th style={{ width: "120px", textAlign: "center" }}>
                Release Date
              </Table.Th>
              <Table.Th style={{ width: "120px", textAlign: "center" }}>
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {movies
              .filter((m) =>
                m.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((movie) => (
                <Table.Tr key={movie.id}>
                  <Table.Td style={{ textAlign: "center", padding: "8px" }}>
                    <Image
                      src={movie.posterImageUrl || "/images/default-movie.jpg"}
                      h={60}
                      w={40}
                      fit="cover"
                      alt={movie.title}
                    />
                  </Table.Td>
                  <Table.Td style={{ padding: "16px" }}>
                    <Text fw={500}>{movie.title}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {movie.durationMinutes} min
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <MovieRating
                      rating={movie.rating}
                      size="sm"
                      showTooltip={false}
                    />
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <MovieRating
                      score={movie.ratingScore}
                      size="sm"
                      showTooltip={false}
                    />
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Group gap={4} justify="center" wrap="wrap">
                      {movie.genres.map((genre, index) => (
                        <Badge
                          key={index}
                          size="sm"
                          variant="light"
                          color="red"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Group gap={8} justify="center">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEditMovie(movie)}
                        title="Edit"
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteMovie(movie)}
                        title="Delete"
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>

        {/* Movie Form Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? "Edit Movie" : "New Movie"}
          size="lg"
        >
          <Stack>
            <TextInput
              label="Title"
              value={formData.title}
              onChange={(e) =>
                handleInputChange("title", e.currentTarget.value)
              }
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.currentTarget.value)
              }
              required
            />
            <NumberInput
              label="Duration (minutes)"
              value={formData.durationMinutes}
              onChange={(val) => handleInputChange("durationMinutes", val)}
              min={1}
              required
            />
            <Select
              label="Rating"
              data={availableRatings}
              value={formData.rating}
              onChange={(val) => handleInputChange("rating", val)}
              required
            />
            <TextInput
              label="Poster Image URL"
              value={formData.posterImageUrl}
              onChange={(e) =>
                handleInputChange("posterImageUrl", e.currentTarget.value)
              }
            />
            <TextInput
              label="Trailer URL"
              value={formData.trailerUrl}
              onChange={(e) =>
                handleInputChange("trailerUrl", e.currentTarget.value)
              }
            />
            <DateInput
              label="Release Date"
              value={new Date(formData.releaseDate)}
              onChange={(val) =>
                handleInputChange(
                  "releaseDate",
                  val ? val.toISOString() : new Date().toISOString()
                )
              }
              required
            />
            <NumberInput
              label="Stars"
              description="Rate the movie from 0 to 10 stars"
              value={formData.ratingScore}
              onChange={(val) =>
                handleInputChange(
                  "ratingScore",
                  typeof val === "number" ? val : null
                )
              }
              min={0}
              max={10}
              step={0.1}
              decimalScale={1}
              placeholder="e.g., 7.5"
              rightSection={<IconStar size={16} style={{ color: "#FFD700" }} />}
              allowDecimal
              hideControls={false}
            />
            <MultiSelect
              label="Genres"
              data={availableGenres}
              value={formData.genres}
              onChange={(val) => handleInputChange("genres", val)}
              required
            />
            <MultiSelect
              label="Theaters"
              data={theaters}
              value={(formData.theaters || []).map((t) => t.id.toString())}
              onChange={(values) => {
                const selectedTheaters = values.map((value) => {
                  const theater = theaters.find((t) => t.value === value);
                  return {
                    id: parseInt(value),
                    name: theater?.label || "",
                  };
                });
                handleInputChange("theaters", selectedTheaters);
              }}
              placeholder="Select theaters where this movie will be shown"
              searchable
              clearable
            />
            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMovie}>
                {isEditing ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Movie"
          size="sm"
        >
          <Text>
            Are you sure you want to delete "{currentMovie?.title}"? This action
            cannot be undone.
          </Text>
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteMovie}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Box>
  );
};

export default MovieManager;
