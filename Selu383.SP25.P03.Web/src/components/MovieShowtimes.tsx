// src/components/MovieShowtimes.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  IconBuilding,
} from "@tabler/icons-react";

import { movieApi, showtimeApi, MovieDTO, ShowtimeDTO } from "../services/api";

const MovieShowtimes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  useMantineColorScheme();

  const mainTicketColor = "#c70036";

  // stub admin-check → replace with real auth/context
  useEffect(() => {
    setIsAdmin(true);
  }, []);

  // fetch movie + showtimes (no auth check)
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const movieData = await movieApi.getMovieById(+id);
        setMovie(movieData);

        const allShowtimes = await showtimeApi.getShowtimesByMovie(+id);
        const theaterRestrictions = await movieApi.getTheatersByMovie(+id);

        if (theaterRestrictions.length > 0) {
          const allowed = new Set(theaterRestrictions);
          setShowtimes(allShowtimes.filter((st) => allowed.has(st.theaterId)));
        } else {
          setShowtimes(allShowtimes);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load movie information");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // send both guests & logged-in users down to seat selection
  const handleSelectShowtime = (showtimeId: number) => {
    navigate(`/reservations/create/${showtimeId}`);
  };

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

  return (
    <Container size="xl" py="xl">
      <Grid>
        {/* Movie poster & details */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            style={{ borderTop: `3px solid ${mainTicketColor}` }}
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
                      bottom: 10,
                      right: 10,
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
              {movie.genres.map((g, i) => (
                <Badge key={i} size="sm" variant="light" color="red">
                  {g}
                </Badge>
              ))}
            </Group>

            {isAdmin && (
              <Button
                variant="outline"
                component={Link}
                to={`/movies/${movie.id}/theaters`}
                leftSection={<IconBuilding size={16} />}
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

        {/* Showtimes listing */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            shadow="sm"
            p="lg"
            withBorder
            style={{ borderTop: `3px solid ${mainTicketColor}` }}
          >
            <Title order={3} mb="md">
              Showtimes for {movie.title}
            </Title>

            <Tabs defaultValue="by-date">
              <Tabs.List>
                <Tabs.Tab value="by-date">By Date</Tabs.Tab>
                <Tabs.Tab value="by-theater">By Theater</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="by-date" pt="xs">
                {showtimes.map((st) => (
                  <Button
                    key={st.id}
                    variant="subtle"
                    onClick={() => handleSelectShowtime(st.id)}
                    style={{ margin: 4 }}
                  >
                    {new Date(st.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </Tabs.Panel>

              <Tabs.Panel value="by-theater" pt="xs">
                {showtimes.map((st) => (
                  <Button
                    key={st.id}
                    variant="subtle"
                    onClick={() => handleSelectShowtime(st.id)}
                    style={{ margin: 4 }}
                  >
                    {st.theaterName} –{" "}
                    {new Date(st.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Button>
                ))}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Trailer modal */}
      <Modal
        opened={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={`${movie.title} — Official Trailer`}
        size="xl"
        centered
      >
        {/* embed your video player here */}
      </Modal>
    </Container>
  );
};

export default MovieShowtimes;
