// src/components/MovieList.tsx
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
  Rating,
  Flex,
  Paper,
} from "@mantine/core";
import { IconClock, IconCalendar, IconTicket } from "@tabler/icons-react";

import { movieApi, MovieDTO } from "../services/api";

const MovieList = () => {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await movieApi.getAllMovies();
        setMovies(data);
      } catch (error) {
        setError("Failed to fetch movies");
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container>
        <Text color="red" size="lg" ta="center" my="xl">
          {error}
        </Text>
      </Container>
    );
  }

  // Function to get star rating based on the MPAA rating
  const getStarRating = (mpaaRating: string) => {
    const ratings: Record<string, number> = {
      G: 5,
      PG: 4.5,
      "PG-13": 4,
      R: 3.5,
      "NC-17": 3,
    };
    return ratings[mpaaRating] || 4;
  };

  return (
    <Container size="xl" py="xl">
      <Paper
        p="lg"
        radius="md"
        mb="xl"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/theater-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <Title order={1} ta="center" mb="md">
          Now Showing
        </Title>
        <Text ta="center" size="lg" mb="lg">
          Book your tickets for the latest movies at Lions Den Cinemas
        </Text>
      </Paper>

      {movies.length === 0 ? (
        <Text ta="center" fz="lg" mt="xl">
          No movies are currently available. Check back soon!
        </Text>
      ) : (
        <Grid>
          {movies.map((movie) => (
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
                  borderTop: `3px solid ${isDark ? "#d4af37" : "#0d6832"}`,
                }}
              >
                <Card.Section>
                  <Image
                    src={movie.posterImageUrl || "/images/default-movie.jpg"}
                    height={250}
                    alt={movie.title}
                    fallbackSrc="https://placehold.co/400x600/gray/white?text=No+Poster"
                  />
                </Card.Section>

                <Group mt="md" mb="xs" justify="space-between">
                  <Text fw={500} size="lg">
                    {movie.title}
                  </Text>
                  <Badge color={isDark ? "yellow" : "green"}>
                    {movie.rating}
                  </Badge>
                </Group>

                <Flex align="center" mb="sm">
                  <Rating
                    value={getStarRating(movie.rating)}
                    readOnly
                    fractions={2}
                  />
                  <Text size="sm" ml="xs">
                    ({(Math.random() * 300 + 100).toFixed(0)} reviews)
                  </Text>
                </Flex>

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
                  {movie.genres.map((genre, index) => (
                    <Badge key={index} size="sm" variant="light">
                      {genre}
                    </Badge>
                  ))}
                </Group>

                <Divider my="md" />

                <Button
                  fullWidth
                  mt="md"
                  component={Link}
                  to={`/movies/${movie.id}/showtimes`}
                  color={isDark ? "yellow" : "green"}
                  leftSection={<IconTicket size={20} />}
                >
                  View Showtimes
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MovieList;
