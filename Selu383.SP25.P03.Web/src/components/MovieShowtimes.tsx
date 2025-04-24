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
  Box,
  Switch,
  Alert,
} from "@mantine/core";
import {
  IconCalendar,
  IconPlayerPlay,
  IconBuilding,
  IconTheater,
  IconTicket,
  IconClock,
  IconCurrentLocation,
} from "@tabler/icons-react";
import {
  movieApi,
  showtimeApi,
  theaterApi,
  MovieDTO,
  ShowtimeDTO,
} from "../services/api";

interface TheaterWithLocation {
  id: number;
  name: string;
  address: string;
  distance?: number;
  coordinates?: { lat: number; lng: number } | null;
}

type UserLocation = { lat: number; lng: number } | undefined;

interface GeolocationPosition {
  coords: { latitude: number; longitude: number };
}

interface GeolocationError {
  message: string;
}

const MovieShowtimes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theaters, setTheaters] = useState<Record<number, TheaterWithLocation>>(
    {}
  );
  const [userLocation, setUserLocation] = useState<UserLocation>(undefined);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const mainTicketColor = "#c70036";

  useEffect(() => {
    setIsAdmin(true);
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortByDistance(true);
        setLocationLoading(false);
      },
      (err: GeolocationError) => {
        setLocationError(`Unable to get your location: ${err.message}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getCoordinatesForAddress = (address: string) => {
    const addressMap: Record<string, { lat: number; lng: number }> = {
      "New York:": { lat: 40.7489, lng: -73.968 },
      "New Orleans:": { lat: 29.9647, lng: -90.0758 },
      "Los Angeles:": { lat: 34.0118, lng: -118.3373 },
    };
    for (const key in addressMap) {
      if (address.includes(key)) return addressMap[key];
    }
    return { lat: 39.8283, lng: -98.5795 };
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 3958.8; // miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (userLocation && Object.keys(theaters).length) {
      const updated = { ...theaters };
      for (const id in updated) {
        const t = updated[+id];
        if (t.coordinates) {
          updated[+id] = {
            ...t,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              t.coordinates.lat,
              t.coordinates.lng
            ),
          };
        }
      }
      setTheaters(updated);
    }
  }, [userLocation, theaters]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const m = await movieApi.getMovieById(+id);
        setMovie(m);
        const all = await showtimeApi.getShowtimesByMovie(+id);
        const allowedIds = new Set(await movieApi.getTheatersByMovie(+id));
        const theaterInfo: Record<number, TheaterWithLocation> = {};
        for (const st of all) {
          if (!theaterInfo[st.theaterId]) {
            try {
              const td = await theaterApi.getTheaterById(st.theaterId);
              theaterInfo[st.theaterId] = {
                id: td.id,
                name: td.name,
                address: td.address,
                coordinates: getCoordinatesForAddress(td.address),
              };
            } catch {
              theaterInfo[st.theaterId] = {
                id: st.theaterId,
                name: "Unknown Theater",
                address: "N/A",
              };
            }
          }
        }
        setTheaters(theaterInfo);
        setShowtimes(
          all.filter(
            (st) => allowedIds.size === 0 || allowedIds.has(st.theaterId)
          )
        );
      } catch {
        setError("Failed to load movie information");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSelectShowtime = (sid: number) =>
    navigate(`/reservations/create/${sid}`);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return undefined;
    const m = url.match(
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    );
    return m && m[7].length === 11
      ? `https://www.youtube.com/embed/${m[7]}`
      : undefined;
  };

  const formatDistance = (d?: number) => {
    if (d === undefined) return "";
    return d < 1
      ? `${(d * 5280).toFixed(0)} ft away`
      : `${d.toFixed(1)} mi away`;
  };

  const showtimesByDate = showtimes.reduce<Record<string, ShowtimeDTO[]>>(
    (acc, s) => {
      const date = new Date(s.startTime).toLocaleDateString();
      (acc[date] ||= []).push(s);
      return acc;
    },
    {}
  );

  const showtimesByTheater = showtimes.reduce<Record<string, ShowtimeDTO[]>>(
    (acc, s) => {
      (acc[s.theaterName] ||= []).push(s);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(showtimesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const sortEntries = (entries: [string, ShowtimeDTO[]][]) => {
    if (sortByDistance && userLocation) {
      return entries.sort((a, b) => {
        const da = theaters[a[1][0].theaterId].distance ?? Infinity;
        const db = theaters[b[1][0].theaterId].distance ?? Infinity;
        return da - db;
      });
    }
    return entries;
  };

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
        }}
      >
        <Center my="xl">
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Box
        style={{
          backgroundColor: "var(--background-darker)",
          minHeight: "100vh",
        }}
      >
        <Container>
          <Text color="red" size="lg" ta="center" my="xl">
            {error || "Movie not found"}
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
        <Grid>
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
                    fit="contain"
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
                        border: "2px solid rgba(255, 255, 255, 0.8)",
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

              <Group mb="md" gap="xs">
                <Badge color="red">{movie.rating}</Badge>
                <Text size="sm">{movie.durationMinutes} minutes</Text>
              </Group>

              <Text size="sm" mb="md">
                {movie.description}
              </Text>

              <Divider my="md" />

              <Group mb="xs" gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">
                  Released: {new Date(movie.releaseDate).toLocaleDateString()}
                </Text>
              </Group>

              <Group gap="xs" mb="md" wrap="wrap">
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

              <Group mb="md" justify="space-between">
                <Group gap="xs">
                  <Switch
                    label="Sort by distance"
                    checked={sortByDistance}
                    onChange={(e) => setSortByDistance(e.currentTarget.checked)}
                    disabled={!userLocation}
                  />
                  <Button
                    size="xs"
                    variant={userLocation ? "filled" : "outline"}
                    color={userLocation ? "green" : "blue"}
                    onClick={getUserLocation}
                    loading={locationLoading}
                    leftSection={<IconCurrentLocation size={16} />}
                  >
                    {userLocation ? "Location Updated" : "Use My Location"}
                  </Button>
                </Group>
              </Group>

              {locationError && (
                <Alert color="red" mb="md" title="Location Error">
                  {locationError}
                </Alert>
              )}

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
                    <Text c="dimmed">
                      No showtimes available for this movie.
                    </Text>
                  ) : (
                    sortedDates.map((date) => (
                      <Paper withBorder p="md" radius="md" mb="md" key={date}>
                        <Group mb="sm">
                          <IconCalendar size={20} />
                          <Text fw={500}>
                            {new Date(date).toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Text>
                        </Group>
                        <Divider mb="md" />
                        {sortEntries(
                          Object.entries(
                            showtimesByDate[date].reduce((acc, st) => {
                              (acc[st.theaterName] ||= []).push(st);
                              return acc;
                            }, {} as Record<string, ShowtimeDTO[]>)
                          )
                        ).map(([theater, sts]) => (
                          <div
                            key={`${date}-${theater}`}
                            style={{ marginBottom: 20 }}
                          >
                            <Group mb="xs" align="flex-start">
                              <IconTheater size={16} style={{ marginTop: 4 }} />
                              <Box>
                                <Group gap={8}>
                                  <Text fw={500}>{theater}</Text>
                                  {sortByDistance && userLocation && (
                                    <Badge size="xs" color="blue">
                                      {formatDistance(
                                        theaters[sts[0].theaterId]?.distance
                                      )}
                                    </Badge>
                                  )}
                                </Group>
                                <Text size="xs" c="dimmed" mt="-2px">
                                  {theaters[sts[0].theaterId]?.address}
                                </Text>
                              </Box>
                            </Group>
                            <Group gap="sm" wrap="wrap">
                              {sts
                                .sort(
                                  (a, b) =>
                                    new Date(a.startTime).getTime() -
                                    new Date(b.startTime).getTime()
                                )
                                .map((st) => (
                                  <Button
                                    key={st.id}
                                    variant="outline"
                                    color={isDark ? "yellow" : "green"}
                                    onClick={() => handleSelectShowtime(st.id)}
                                    leftSection={<IconTicket size={16} />}
                                    rightSection={
                                      <Badge size="sm" variant="light">
                                        ${st.baseTicketPrice.toFixed(2)}
                                      </Badge>
                                    }
                                  >
                                    {new Date(st.startTime).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
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
                    <Text c="dimmed">
                      No showtimes available for this movie.
                    </Text>
                  ) : (
                    sortEntries(Object.entries(showtimesByTheater)).map(
                      ([theater, sts]) => (
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          mb="md"
                          key={theater}
                        >
                          <Group mb="sm" align="flex-start">
                            <IconTheater size={20} style={{ marginTop: 4 }} />
                            <Box>
                              <Group gap={8}>
                                <Text fw={500}>{theater}</Text>
                                {sortByDistance && userLocation && (
                                  <Badge size="xs" color="blue">
                                    {formatDistance(
                                      theaters[sts[0].theaterId]?.distance
                                    )}
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" mt="-2px">
                                {theaters[sts[0].theaterId]?.address}
                              </Text>
                            </Box>
                          </Group>
                          <Divider mb="md" />
                          {Object.entries(
                            sts.reduce((acc, st) => {
                              const d = new Date(
                                st.startTime
                              ).toLocaleDateString();
                              (acc[d] ||= []).push(st);
                              return acc;
                            }, {} as Record<string, ShowtimeDTO[]>)
                          )
                            .sort(
                              (a, b) =>
                                new Date(a[0]).getTime() -
                                new Date(b[0]).getTime()
                            )
                            .map(([date, ds]) => (
                              <div
                                key={`${theater}-${date}`}
                                style={{ marginBottom: 20 }}
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
                                  {ds
                                    .sort(
                                      (a, b) =>
                                        new Date(a.startTime).getTime() -
                                        new Date(b.startTime).getTime()
                                    )
                                    .map((st) => (
                                      <Button
                                        key={st.id}
                                        variant="outline"
                                        color={isDark ? "yellow" : "green"}
                                        onClick={() =>
                                          handleSelectShowtime(st.id)
                                        }
                                        leftSection={<IconClock size={16} />}
                                        rightSection={
                                          <Badge
                                            size="sm"
                                            variant="filled"
                                            color="blue"
                                          >
                                            ${st.baseTicketPrice.toFixed(2)}
                                          </Badge>
                                        }
                                      >
                                        {new Date(
                                          st.startTime
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

        <Modal
          opened={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={movie ? `${movie.title} - Official Trailer` : ""}
          size="xl"
          centered
        >
          {movie && movie.trailerUrl ? (
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              <iframe
                src={getYoutubeEmbedUrl(movie.trailerUrl)}
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
                title={`${movie.title} Trailer`}
              />
            </div>
          ) : (
            <Text ta="center" c="dimmed">
              Trailer not available or URL is invalid.
            </Text>
          )}
        </Modal>
      </Container>
    </Box>
  );
};

export default MovieShowtimes;
