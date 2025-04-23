// src/components/MovieShowtimes.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Added Link
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
  Tabs,
  Paper,
  Divider,
  Modal,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconCalendar,
  IconPlayerPlay,
  IconBuilding, // Added IconBuilding
} from "@tabler/icons-react";

import { movieApi, showtimeApi, MovieDTO, ShowtimeDTO } from "../services/api";

const MovieShowtimes = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Added isAdmin state
  useMantineColorScheme();

  // Define main ticket color and lighter price color
  const mainTicketColor = "#c70036"; // Specified ticket color

  useEffect(() => {
    // Check if user is admin - this would typically come from your auth context
    // For example:
    // const { isAdmin } = useAuth();
    // setIsAdmin(isAdmin);

    // For testing, you could set this to true
    setIsAdmin(true); // You'd replace this with actual auth logic
  }, []);

  useEffect(() => {
    const fetchShowtimesAndAssignments = async () => {
      if (!id) return;
      try {
        const movieData = await movieApi.getMovieById(parseInt(id));
        setMovie(movieData);

        // Fetch all showtimes for this movie
        const allShowtimes = await showtimeApi.getShowtimesByMovie(
          parseInt(id)
        );

        // Check if this movie has theater restrictions
        const theaterRestrictions = await movieApi.getTheatersByMovie(
          parseInt(id)
        );

        // If there are theater restrictions, filter showtimes
        if (theaterRestrictions.length > 0) {
          // Create a Set for faster lookups
          const allowedTheaterIds = new Set(theaterRestrictions);

          // Filter showtimes to only include those at allowed theaters
          const filteredShowtimes = allShowtimes.filter((showtime) =>
            allowedTheaterIds.has(showtime.theaterId)
          );

          setShowtimes(filteredShowtimes);
        } else {
          // No restrictions, show all showtimes
          setShowtimes(allShowtimes);
        }
      } catch (error) {
        setError("Failed to fetch movie information");
        console.error("Error fetching movie/showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimesAndAssignments();
  }, [id]);

  // Rest of your component code remains the same...

  // Safely parse YouTube ID from URL - fixed return type to string | undefined

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !movie) {
    return (
      <Container>
        <Text color="red" size="lg" ta="center" my="xl">
          {error || "Movie not found"}
        </Text>
      </Container>
    );
  }

  // Group showtimes by date

  // Group showtimes by theater

  // Sort the dates for display

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              borderTop: `3px solid ${mainTicketColor}`,
            }}
          >
            <Card.Section>
              <div style={{ position: "relative" }}>
                <Image
                  src={movie.posterImageUrl || "/images/default-movie.jpg"}
                  height={350}
                  alt={movie.title}
                  fallbackSrc="https://placehold.co/400x600/gray/white?text=No+Poster"
                />
                {movie.trailerUrl && (
                  <Button
                    size="sm"
                    variant="filled"
                    color="red"
                    leftSection={<IconPlayerPlay size={16} />}
                    onClick={() => setTrailerOpen(true)}
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

            <Title order={3} mt="md" mb="xs">
              {movie.title}
            </Title>

            <Group mb="md">
              <Badge color="red">{movie.rating}</Badge>
              <Text size="sm">{movie.durationMinutes} minutes</Text>
            </Group>

            <Text size="sm" mb="md">
              {movie.description}
            </Text>

            <Divider my="md" />

            <Group mb="xs">
              <IconCalendar size={16} />
              <Text size="sm">
                Released: {new Date(movie.releaseDate).toLocaleDateString()}
              </Text>
            </Group>

            <Group gap="xs" mb="md">
              {movie.genres.map((genre, index) => (
                <Badge key={index} size="sm" variant="light" color="red">
                  {genre}
                </Badge>
              ))}
            </Group>

            {/* Admin Button for Theater Management */}
            {isAdmin && (
              <Button
                variant="outline"
                component={Link}
                to={`/movies/${movie.id}/theaters`}
                leftSection={<IconBuilding size={16} />}
                mb="md"
                fullWidth
                style={{
                  borderColor: mainTicketColor,
                  color: mainTicketColor,
                }}
              >
                Manage Theater Assignments
              </Button>
            )}
          </Card>
        </Grid.Col>

        {/* Rest of your component remains the same... */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {/* Existing showtimes display code */}
          <Paper
            shadow="sm"
            p="lg"
            withBorder
            style={{
              borderTop: `3px solid ${mainTicketColor}`,
            }}
          >
            {/* Existing Tabs and showtimes content */}
            {/* ... */}
            <Title order={3} mb="md">
              Showtimes for {movie.title}
            </Title>

            <Tabs defaultValue="by-date">
              {/* Existing tabs content */}
              {/* ... */}
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Trailer Modal */}
      <Modal
        opened={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={`${movie.title} - Official Trailer`}
        size="xl"
        centered
      >
        {/* Existing modal content */}
        {/* ... */}
      </Modal>
    </Container>
  );
};

export default MovieShowtimes;
