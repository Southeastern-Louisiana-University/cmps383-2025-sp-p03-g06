import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Grid,
  Card,
  Image,
  Text,
  Button,
  Group,
  Badge,
  Loader,
  Center,
  useMantineColorScheme,
  Divider,
  Paper,
  Select,
  TextInput,
  Box,
  Modal,
} from "@mantine/core";
import {
  IconClock,
  IconCalendar,
  IconTicket,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconPlayerPlay,
} from "@tabler/icons-react";

import { movieApi, MovieDTO } from "../services/api";
import MovieRating from "./MovieRating";

// Map of movie titles to their ratings in the range of 0-10
const movieRatings: Record<string, number> = {
  "Snow White": 1.5,
  "Death of a Unicorn": 6.4,
  Novocaine: 6.7,
  "Mickey 17": 7.0,
  "A Working Man": 6.2,
  "The Woman in the Yard": 5.6,
  "The Day the Earth Blew Up: A Looney Tunes Movie": 7.0,
  "Dog Man": 6.3,
  "The Monkey": 6.2,
  "Paddington in Peru": 6.7,
  "Captain America: Brave New World": 5.9,
  "Mufasa: The Lion King": 6.6,
  Locked: 6.3,
  "One of Them Days": 6.6,
};

const MovieList = () => {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<MovieDTO | null>(null);
  useMantineColorScheme();

  // Filtering/sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>("newest");

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieApi.getAllMovies();
        setMovies(data);
        setFilteredMovies(data);
      } catch (error) {
        setError("Failed to fetch movies");
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Filter and sort
  useEffect(() => {
    let result = [...movies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query)
      );
    }

    if (genreFilter) {
      result = result.filter((movie) =>
        movie.genres.some(
          (genre) => genre.toLowerCase() === genreFilter.toLowerCase()
        )
      );
    }

    if (ratingFilter) {
      result = result.filter((movie) => movie.rating === ratingFilter);
    }

    if (sortBy) {
      switch (sortBy) {
        case "newest":
          result.sort(
            (a, b) =>
              new Date(b.releaseDate).getTime() -
              new Date(a.releaseDate).getTime()
          );
          break;
        case "oldest":
          result.sort(
            (a, b) =>
              new Date(a.releaseDate).getTime() -
              new Date(b.releaseDate).getTime()
          );
          break;
        case "top-rated":
          result.sort(
            (a, b) =>
              (movieRatings[b.title] || 0) - (movieRatings[a.title] || 0)
          );
          break;
        case "title-az":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "title-za":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
      }
    }

    setFilteredMovies(result);
  }, [movies, searchQuery, genreFilter, ratingFilter, sortBy]);

  // Unique filters data
  const allGenres = Array.from(
    new Set(movies.flatMap((movie) => movie.genres))
  ).map((genre) => ({ value: genre.toLowerCase(), label: genre }));

  const allRatings = Array.from(new Set(movies.map((movie) => movie.rating)))
    .filter(Boolean)
    .map((rating) => ({ value: rating, label: rating }));

  // Convert YouTube URL to embed URL
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const id = match && match[7].length === 11 ? match[7] : null;
    return id ? `https://www.youtube.com/embed/${id}` : null;
  };

  if (loading)
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  if (error)
    return (
      <Container>
        <Text color="red" size="lg" ta="center" my="xl">
          {error}
        </Text>
      </Container>
    );

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Paper
        p="lg"
        radius="md"
        mb="xl"
        style={{
          background: "transparent",
          color: "white",
          textAlign: "center",
        }}
      >
        <Title order={1} style={{ fontWeight: 900 }}>
          Experience the Latest Movies at Lions Den Cinemas
        </Title>
      </Paper>

      {/* Filters */}
      <Paper shadow="sm" p="md" mb="xl" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              mb={{ base: "sm", md: 0 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Select
              placeholder="Filter by genre"
              data={[{ value: "", label: "All Genres" }, ...allGenres]}
              value={genreFilter}
              onChange={setGenreFilter}
              leftSection={<IconFilter size={16} />}
              clearable
              mb="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Select
              placeholder="Filter by rating"
              data={[{ value: "", label: "All Ratings" }, ...allRatings]}
              value={ratingFilter}
              onChange={setRatingFilter}
              leftSection={<IconFilter size={16} />}
              clearable
              mb="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Select
              placeholder="Sort by"
              data={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "top-rated", label: "Top Rated" },
                { value: "title-az", label: "Title (A-Z)" },
                { value: "title-za", label: "Title (Z-A)" },
              ]}
              value={sortBy}
              onChange={setSortBy}
              leftSection={<IconSortAscending size={16} />}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Movie Grid */}
      {filteredMovies.length === 0 ? (
        <Text ta="center" fz="lg" mt="xl">
          No movies match your search criteria. Try different filters.
        </Text>
      ) : (
        <Grid>
          {filteredMovies.map((movie) => (
            <Grid.Col key={movie.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderTop: `3px solid #e03131`,
                }}
              >
                <Card.Section>
                  <div style={{ position: "relative" }}>
                    <Image
                      src={movie.posterImageUrl || "/images/default-movie.jpg"}
                      height={250}
                      alt={movie.title}
                      fallbackSrc="https://placehold.co/400x600/gray/white?text=No+Poster"
                      fit="contain"
                    />
                    {movie.trailerUrl && (
                      <Button
                        size="xs"
                        variant="filled"
                        color="red"
                        leftSection={<IconPlayerPlay size={14} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTrailer(movie);
                        }}
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          zIndex: 2,
                        }}
                      >
                        Watch Trailer
                      </Button>
                    )}
                  </div>
                </Card.Section>

                <Group mt="md" mb="xs" justify="space-between">
                  <Text fw={500} size="lg" lineClamp={1}>
                    {movie.title}
                  </Text>
                </Group>
                <Box mb="sm">
                  <MovieRating
                    rating={movie.rating}
                    score={movieRatings[movie.title] || 0}
                  />
                </Box>
                <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                  {movie.description}
                </Text>

                <Group mt="auto">
                  <IconClock size={16} />
                  <Text size="sm">{movie.durationMinutes} minutes</Text>
                </Group>
                <Group my="xs">
                  <IconCalendar size={16} />
                  <Text size="sm">
                    Released: {new Date(movie.releaseDate).toLocaleDateString()}
                  </Text>
                </Group>
                <Group gap="xs" mt="md">
                  {movie.genres.map((g, i) => (
                    <Badge key={i} size="sm" variant="light">
                      {g}
                    </Badge>
                  ))}
                </Group>
                <Divider my="md" />
                <Button
                  fullWidth
                  mt="md"
                  component={Link}
                  to={`/movies/${movie.id}/showtimes`}
                  styles={{
                    root: {
                      backgroundColor: "#c70036",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#a00029" },
                    },
                  }}
                  leftSection={<IconTicket size={20} />}
                >
                  View Showtimes
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Trailer Modal */}
      <Modal
        opened={!!selectedTrailer}
        onClose={() => setSelectedTrailer(null)}
        title={
          selectedTrailer ? `${selectedTrailer.title} - Official Trailer` : ""
        }
        size="xl"
        centered
      >
        {selectedTrailer &&
        selectedTrailer.trailerUrl &&
        getYoutubeEmbedUrl(selectedTrailer.trailerUrl) ? (
          <div
            style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
          >
            <iframe
              src={getYoutubeEmbedUrl(selectedTrailer.trailerUrl)!}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${selectedTrailer.title} Trailer`}
            />
          </div>
        ) : (
          <Text ta="center" c="dimmed">
            Trailer not available or URL is invalid.
          </Text>
        )}
      </Modal>
    </Container>
  );
};

export default MovieList;
