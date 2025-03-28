// src/components/MovieShowtimes.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconClock,
  IconCalendar,
  IconTicket,
  IconTheater,
} from "@tabler/icons-react";

import { movieApi, showtimeApi, MovieDTO, ShowtimeDTO } from "../services/api";

const MovieShowtimes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      if (!id) return;

      try {
        const movieData = await movieApi.getMovieById(parseInt(id));
        setMovie(movieData);

        const showtimesData = await showtimeApi.getShowtimesByMovie(
          parseInt(id)
        );
        setShowtimes(showtimesData);
      } catch (error) {
        setError("Failed to fetch movie information");
        console.error("Error fetching movie/showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

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
  const showtimesByDate = showtimes.reduce((acc, showtime) => {
    const date = new Date(showtime.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, ShowtimeDTO[]>);

  // Group showtimes by theater
  const showtimesByTheater = showtimes.reduce((acc, showtime) => {
    const theater = showtime.theaterName;
    if (!acc[theater]) {
      acc[theater] = [];
    }
    acc[theater].push(showtime);
    return acc;
  }, {} as Record<string, ShowtimeDTO[]>);

  const handleSelectShowtime = (showtimeId: number) => {
    navigate(`/reservations/create/${showtimeId}`);
  };

  // Sort the dates for display
  const sortedDates = Object.keys(showtimesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

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
              borderTop: `3px solid ${isDark ? "#d4af37" : "#0d6832"}`,
            }}
          >
            <Card.Section>
              <Image
                src={movie.posterImageUrl || "/images/default-movie.jpg"}
                height={350}
                alt={movie.title}
                fallbackSrc="https://placehold.co/400x600/gray/white?text=No+Poster"
              />
            </Card.Section>

            <Title order={3} mt="md" mb="xs">
              {movie.title}
            </Title>

            <Group mb="md">
              <Badge color={isDark ? "yellow" : "green"}>{movie.rating}</Badge>
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
                <Badge key={index} size="sm" variant="light">
                  {genre}
                </Badge>
              ))}
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            shadow="sm"
            p="lg"
            withBorder
            style={{
              borderTop: `3px solid ${isDark ? "#d4af37" : "#0d6832"}`,
            }}
          >
            <Title order={3} mb="md">
              Showtimes for {movie.title}
            </Title>

            <Tabs defaultValue="by-date">
              <Tabs.List mb="md">
                <Tabs.Tab
                  value="by-date"
                  leftSection={<IconCalendar size={16} />}
                >
                  By Date
                </Tabs.Tab>
                <Tabs.Tab
                  value="by-theater"
                  leftSection={<IconTheater size={16} />}
                >
                  By Theater
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="by-date">
                {sortedDates.length === 0 ? (
                  <Text c="dimmed">No showtimes available for this movie.</Text>
                ) : (
                  sortedDates.map((date) => (
                    <Paper withBorder p="md" radius="md" mb="md" key={date}>
                      <Group mb="sm">
                        <IconCalendar size={20} />
                        <Text fw={600}>
                          {new Date(date).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                      </Group>

                      <Divider mb="md" />

                      {/* Group showtimes by theater */}
                      {Object.entries(
                        showtimesByDate[date].reduce((acc, st) => {
                          if (!acc[st.theaterName]) acc[st.theaterName] = [];
                          acc[st.theaterName].push(st);
                          return acc;
                        }, {} as Record<string, ShowtimeDTO[]>)
                      ).map(([theater, theaterShowtimes]) => (
                        <div
                          key={`${date}-${theater}`}
                          style={{ marginBottom: "20px" }}
                        >
                          <Group mb="xs">
                            <IconTheater size={16} />
                            <Text fw={500}>{theater}</Text>
                          </Group>

                          <Group gap="sm" wrap="wrap">
                            {theaterShowtimes
                              .sort(
                                (a, b) =>
                                  new Date(a.startTime).getTime() -
                                  new Date(b.startTime).getTime()
                              )
                              .map((showtime) => (
                                <Button
                                  key={showtime.id}
                                  variant="outline"
                                  color={isDark ? "yellow" : "green"}
                                  onClick={() =>
                                    handleSelectShowtime(showtime.id)
                                  }
                                  leftSection={<IconTicket size={16} />}
                                  rightSection={
                                    <Badge size="sm" variant="light">
                                      ${showtime.baseTicketPrice.toFixed(2)}
                                    </Badge>
                                  }
                                >
                                  {new Date(
                                    showtime.startTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Button>
                              ))}
                          </Group>
                        </div>
                      ))}
                    </Paper>
                  ))
                )}
              </Tabs.Panel>

              <Tabs.Panel value="by-theater">
                {Object.keys(showtimesByTheater).length === 0 ? (
                  <Text c="dimmed">No showtimes available for this movie.</Text>
                ) : (
                  Object.entries(showtimesByTheater).map(
                    ([theater, theaterShowtimes]) => (
                      <Paper
                        withBorder
                        p="md"
                        radius="md"
                        mb="md"
                        key={theater}
                      >
                        <Group mb="sm">
                          <IconTheater size={20} />
                          <Text fw={600}>{theater}</Text>
                        </Group>

                        <Divider mb="md" />

                        {/* Group showtimes by date */}
                        {Object.entries(
                          theaterShowtimes.reduce((acc, st) => {
                            const date = new Date(
                              st.startTime
                            ).toLocaleDateString();
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(st);
                            return acc;
                          }, {} as Record<string, ShowtimeDTO[]>)
                        )
                          .sort(
                            (a, b) =>
                              new Date(a[0]).getTime() -
                              new Date(b[0]).getTime()
                          )
                          .map(([date, dateShowtimes]) => (
                            <div
                              key={`${theater}-${date}`}
                              style={{ marginBottom: "20px" }}
                            >
                              <Group mb="xs">
                                <IconCalendar size={16} />
                                <Text fw={500}>
                                  {new Date(date).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </Text>
                              </Group>

                              <Group gap="sm" wrap="wrap">
                                {dateShowtimes
                                  .sort(
                                    (a, b) =>
                                      new Date(a.startTime).getTime() -
                                      new Date(b.startTime).getTime()
                                  )
                                  .map((showtime) => (
                                    <Button
                                      key={showtime.id}
                                      variant="outline"
                                      color={isDark ? "yellow" : "green"}
                                      onClick={() =>
                                        handleSelectShowtime(showtime.id)
                                      }
                                      leftSection={<IconClock size={16} />}
                                      rightSection={
                                        <Group gap={4}>
                                          <Badge size="sm" variant="light">
                                            {showtime.theaterRoomName}
                                          </Badge>
                                          <Badge
                                            size="sm"
                                            variant="filled"
                                            color="blue"
                                          >
                                            $
                                            {showtime.baseTicketPrice.toFixed(
                                              2
                                            )}
                                          </Badge>
                                        </Group>
                                      }
                                    >
                                      {new Date(
                                        showtime.startTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </Button>
                                  ))}
                              </Group>
                            </div>
                          ))}
                      </Paper>
                    )
                  )
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MovieShowtimes;
