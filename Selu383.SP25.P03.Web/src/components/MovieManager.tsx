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
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
} from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { movieApi, MovieDTO, theaterApi } from "../services/api";

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
      genres: movie.genres,
      ratingScore: movie.ratingScore,
      theaters: movie.theaters.map((theater) => ({
        id: theater.id,
        name: theater.name,
      })),
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
      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.durationMinutes ||
        !formData.rating ||
        !formData.releaseDate ||
        !formData.genres.length
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setLoading(true);
      console.log("Saving movie with data:", {
        isEditing,
        movieId: currentMovie?.id,
        formData,
      });

      let savedMovie;
      if (isEditing && currentMovie) {
        // When updating, make sure to include all required fields and the ID
        const updateData = {
          ...formData,
          id: currentMovie.id,
          // Ensure all required fields are included
          title: formData.title,
          description: formData.description,
          durationMinutes: formData.durationMinutes,
          rating: formData.rating,
          releaseDate: formData.releaseDate,
          genres: formData.genres,
          // Optional fields - use undefined instead of null
          posterImageUrl: formData.posterImageUrl || undefined,
          trailerUrl: formData.trailerUrl || undefined,
          ratingScore: formData.ratingScore,
        };
        console.log("Updating movie:", updateData);
        savedMovie = await movieApi.updateMovie(currentMovie.id, updateData);
      } else {
        // When creating, send all required fields
        const createData = {
          title: formData.title,
          description: formData.description,
          durationMinutes: formData.durationMinutes,
          rating: formData.rating,
          releaseDate: formData.releaseDate,
          genres: formData.genres,
          // Optional fields - use empty string instead of null
          posterImageUrl: formData.posterImageUrl || "",
          trailerUrl: formData.trailerUrl || "",
          ratingScore: formData.ratingScore,
        };
        // Add empty theaters array for create
        const movieData = {
          ...createData,
          theaters: [],
        };
        console.log("Creating new movie:", movieData);
        savedMovie = await movieApi.createMovie(movieData);
      }

      // After saving the movie, update theater assignments if theaters were selected
      if (savedMovie) {
        const selectedTheaters = formData.theaters || [];
        await Promise.all([
          // First, unassign from all theaters
          ...theaters.map((theater) =>
            theaterApi.unassignMovieFromTheater({
              movieId: savedMovie.id,
              theaterId: parseInt(theater.value),
            })
          ),
          // Then, assign to selected theaters
          ...selectedTheaters.map((theaterId) =>
            theaterApi.assignMovieToTheater({
              movieId: savedMovie.id,
              theaterId: parseInt(theaterId.toString()),
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
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Movie Management</Title>
        <Button leftSection={<IconPlus />} onClick={handleCreateMovie}>
          Add Movie
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <TextInput
        placeholder="Search movies..."
        mb="md"
        leftSection={<IconSearch />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Duration</th>
            <th>Rating</th>
            <th>Genres</th>
            <th>Release Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies
            .filter((m) =>
              m.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((movie) => (
              <tr key={movie.id}>
                <td>
                  <Image
                    src={movie.posterImageUrl || "/images/default-movie.jpg"}
                    h={60}
                    w={40}
                    fit="cover"
                    alt={movie.title}
                  />
                </td>
                <td>
                  <Text fw={500}>{movie.title}</Text>
                </td>
                <td>{movie.durationMinutes} min</td>
                <td>
                  <Badge>{movie.rating}</Badge>
                </td>
                <td>
                  <Group gap={4}>
                    {movie.genres.map((genre) => (
                      <Badge key={genre} size="sm">
                        {genre}
                      </Badge>
                    ))}
                  </Group>
                </td>
                <td>{new Date(movie.releaseDate).toLocaleDateString()}</td>
                <td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      onClick={() => handleEditMovie(movie)}
                    >
                      <IconEdit />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDeleteMovie(movie)}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
        </tbody>
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
            onChange={(e) => handleInputChange("title", e.currentTarget.value)}
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
            value={formData.theaters?.map((t) => t.id.toString()) || []}
            onChange={(val) => handleInputChange("theaters", val)}
            placeholder="Select theaters where this movie will be shown"
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
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDeleteMovie}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
};

export default MovieManager;
