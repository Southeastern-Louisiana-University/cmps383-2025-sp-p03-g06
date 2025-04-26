// src/components/MovieList.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
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
  Skeleton,
  Box,
  Paper,
  Select,
  TextInput,
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

interface FilterOption {
  value: string;
  label: string;
}

interface MovieCardProps {
  movie: MovieDTO;
  onTrailerClick: (movie: MovieDTO) => void;
}

const MovieCard = React.forwardRef<HTMLDivElement, MovieCardProps>(
  ({ movie, onTrailerClick }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });

    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          p="lg"
          radius="md"
          withBorder={false}
          style={{
            display: "flex",
            flexDirection: "column",
            background: "var(--background-darker)",
            transition: "transform 150ms ease, box-shadow 150ms ease",
            height: "100%",
            minHeight: "600px",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
          }}
          className="hover:scale-[1.03] hover:shadow-md"
        >
          <Card.Section style={{ position: "relative", height: "450px" }}>
            <Image
              src={movie.posterImageUrl || "/images/default-movie.jpg"}
              alt={movie.title}
              style={{
                width: "100%",
                height: "100%",
                aspectRatio: "2 / 3",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
            {movie.trailerUrl && (
              <Button
                size="md"
                variant="gradient"
                gradient={{ from: "red", to: "darkred", deg: 45 }}
                leftSection={<IconPlayerPlay size={18} />}
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTrailerClick(movie);
                }}
              >
                Watch Trailer
              </Button>
            )}
          </Card.Section>

          <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Group mt="md" mb="xs" justify="apart" style={{ height: "40px" }}>
              <Text fw={700} size="lg" lineClamp={1} style={{ width: "100%" }}>
                {movie.title}
              </Text>
            </Group>

            <MovieRating rating={movie.rating} score={movie.ratingScore} />

            <Text
              size="sm"
              c="dimmed"
              lineClamp={3}
              my="md"
              style={{
                height: "60px",
                overflow: "hidden",
              }}
            >
              {movie.description}
            </Text>

            <Box style={{ marginTop: "auto" }}>
              <Group gap="xs" style={{ height: "24px" }}>
                <IconClock size={16} />
                <Text size="sm">{movie.durationMinutes} minutes</Text>
              </Group>

              <Group gap="xs" mt="xs" style={{ height: "24px" }}>
                <IconCalendar size={16} />
                <Text size="sm">
                  Released: {new Date(movie.releaseDate).toLocaleDateString()}
                </Text>
              </Group>

              <Group
                gap="xs"
                mt="md"
                style={{ height: "32px", flexWrap: "wrap", overflow: "hidden" }}
              >
                {movie.genres.map((g, i) => (
                  <Badge key={i} size="sm" variant="light">
                    {g}
                  </Badge>
                ))}
              </Group>

              <Button
                fullWidth
                mt="md"
                component={Link}
                to={`/movies/${movie.id}/showtimes`}
                color="red"
                radius="xl"
                size="md"
                leftSection={<IconTicket size={18} />}
              >
                View Showtimes
              </Button>
            </Box>
          </Box>
        </Card>
      </motion.div>
    );
  }
);

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [filtered, setFiltered] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<MovieDTO | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieApi.getAllMovies();
        console.log("Fetched movies:", data); // Debug log
        setMovies(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    let result = [...movies];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }
    if (genreFilter) {
      result = result.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === genreFilter.toLowerCase())
      );
    }
    if (ratingFilter) {
      result = result.filter((m) => m.rating === ratingFilter);
    }
    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime()
        );
        break;
      case "top-rated":
        result.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
        break;
      case "title-az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
    }
    setFiltered(result);
  }, [movies, searchQuery, genreFilter, ratingFilter, sortBy]);

  const allGenres: FilterOption[] = Array.from(
    new Set(movies.flatMap((m) => m.genres))
  ).map((g) => ({ value: g.toLowerCase(), label: g }));

  const allRatings: FilterOption[] = Array.from(
    new Set(movies.map((m) => m.rating))
  )
    .filter(Boolean)
    .map((r) => ({ value: r!, label: r! }));

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return;
    const reg =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const m = url.match(reg);
    const id = m && m[7].length === 11 ? m[7] : null;
    return id ? `https://www.youtube.com/embed/${id}` : undefined;
  };

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
        }}
      >
        <Container size="xl" py="xl">
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                <Skeleton height={460} radius="md" animate />
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
        }}
      >
        <Container size="xl" py="xl">
          <Text color="red" size="lg" ta="center" my="xl">
            {error}
          </Text>
        </Container>
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
      <Container size="xl" py="xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            p="xl"
            radius="md"
            mb="xl"
            style={{
              background: "var(--background-darker)",
              textAlign: "center",
            }}
          >
            <Title order={1} fw={900} size="2.5rem">
              Experience the Latest Movies at Lions Den Cinemas
            </Title>
          </Paper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            mb="xl"
            p="md"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              background: "var(--background-darker)",
              borderRadius: "var(--mantine-radius-md)",
              boxShadow: "var(--mantine-shadow-sm)",
              position: "sticky",
              top: "0.5rem",
              zIndex: 10,
            }}
          >
            <TextInput
              leftSection={<IconSearch size={18} />}
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              styles={(t) => ({
                input: { borderRadius: t.radius.xl, height: 42 },
              })}
            />

            <Select
              leftSection={<IconFilter size={18} />}
              placeholder="All Genres"
              data={[{ value: "", label: "All Genres" }, ...allGenres]}
              value={genreFilter}
              onChange={setGenreFilter}
              clearable
              styles={(t) => ({
                input: { borderRadius: t.radius.xl, height: 42 },
              })}
            />

            <Select
              leftSection={<IconFilter size={18} />}
              placeholder="All Ratings"
              data={[{ value: "", label: "All Ratings" }, ...allRatings]}
              value={ratingFilter}
              onChange={setRatingFilter}
              clearable
              styles={(t) => ({
                input: { borderRadius: t.radius.xl, height: 42 },
              })}
            />

            <Select
              leftSection={<IconSortAscending size={18} />}
              placeholder="Newest First"
              data={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "top-rated", label: "Top Rated" },
                { value: "title-az", label: "Title (A–Z)" },
                { value: "title-za", label: "Title (Z–A)" },
              ]}
              value={sortBy}
              onChange={(v) => setSortBy(v || "newest")}
              styles={(t) => ({
                input: { borderRadius: t.radius.xl, height: 42 },
              })}
            />
          </Box>
        </motion.div>

        {filtered.length === 0 ? (
          <Text ta="center" size="lg" mt="xl">
            No movies match your search criteria. Try different filters.
          </Text>
        ) : (
          <Grid>
            {filtered.map((movie, index) => (
              <Grid.Col key={movie.id} span={{ base: 12, sm: 6, md: 4 }}>
                <MovieCard movie={movie} onTrailerClick={setSelectedTrailer} />
              </Grid.Col>
            ))}
          </Grid>
        )}

        <Modal
          opened={!!selectedTrailer}
          onClose={() => setSelectedTrailer(null)}
          title={selectedTrailer ? `${selectedTrailer.title} — Trailer` : ""}
          size="xl"
          centered
        >
          {selectedTrailer && selectedTrailer.trailerUrl ? (
            <Box
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              {(() => {
                const url = getYoutubeEmbedUrl(selectedTrailer.trailerUrl);
                return url ? (
                  <iframe
                    src={url}
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
                ) : (
                  <Text ta="center" c="dimmed">
                    Unable to load trailer.
                  </Text>
                );
              })()}
            </Box>
          ) : (
            <Text ta="center" c="dimmed">
              Trailer not available.
            </Text>
          )}
        </Modal>
      </Container>
    </Box>
  );
};

export default MovieList;
