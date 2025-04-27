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
  Modal,
  useMantineColorScheme,
  Box,
  Alert,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import {
  IconCalendar,
  IconPlayerPlay,
  IconBuilding,
  IconTicket,
  IconCurrentLocation,
  IconBuildingEstate,
} from "@tabler/icons-react";
import {
  movieApi,
  showtimeApi,
  theaterApi,
  MovieDTO,
  ShowtimeDTO,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import MovieRating from "./MovieRating";

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

interface TheaterShowtimes {
  theater: TheaterWithLocation;
  showtimes: ShowtimeDTO[];
}

const MovieShowtimes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth();
  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [theaters, setTheaters] = useState<Record<number, TheaterWithLocation>>(
    {}
  );
  const [userLocation, setUserLocation] = useState<UserLocation>(undefined);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [, setLocationLoading] = useState(false);
  const [] = useState<TheaterShowtimes[]>([]);

  useMantineColorScheme();

  useEffect(() => {
    getUserLocation();
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
        setSortByDistance(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getCoordinatesForAddress = (address: string) => {
    const addressMap: Record<string, { lat: number; lng: number }> = {
      "New York": { lat: 40.7489, lng: -73.968 },
      "New Orleans": { lat: 29.9647, lng: -90.0758 },
      "Los Angeles": { lat: 34.0118, lng: -118.3373 },
    };

    for (const city in addressMap) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return addressMap[city];
      }
    }
    return null; // Return null instead of default coordinates if no match is found
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
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details and showtimes
        const movieData = await movieApi.getMovieById(+id);
        const showtimeData = await showtimeApi.getShowtimesByMovie(+id);

        // Get current date/time
        const now = new Date();
        const releaseDate = new Date(movieData.releaseDate);

        // Check if movie is a future release
        if (releaseDate > now) {
          setMovie(movieData);
          setShowtimes([]);
          setLoading(false);
          return;
        }

        // Filter out any past showtimes
        const nowUtc = Date.now();
        const futureShowtimes = showtimeData.filter(
          (st) => Date.parse(st.startTime) > nowUtc
        );

        if (futureShowtimes.length === 0) {
          console.log("No future showtimes found");
        }

        // Get all unique theater IDs from showtimes
        const theaterIds = [
          ...new Set(futureShowtimes.map((st) => st.theaterId)),
        ];

        // Fetch theater details
        const theaterInfo: Record<number, TheaterWithLocation> = {};
        await Promise.all(
          theaterIds.map(async (theaterId) => {
            try {
              const theaterData = await theaterApi.getTheaterById(theaterId);
              const coordinates = getCoordinatesForAddress(theaterData.address);

              let distance = undefined;
              if (userLocation && coordinates) {
                distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  coordinates.lat,
                  coordinates.lng
                );
              }

              theaterInfo[theaterId] = {
                id: theaterData.id,
                name: theaterData.name,
                address: theaterData.address,
                coordinates,
                distance,
              };
            } catch (error) {
              console.error(`Error fetching theater ${theaterId}:`, error);
            }
          })
        );

        setMovie(movieData);
        setTheaters(theaterInfo);
        setShowtimes(futureShowtimes);
        setLoading(false);
      } catch (error) {
        console.error("Error loading movie data:", error);
        setError("Failed to load movie information");
        setLoading(false);
      }
    })();
  }, [id, userLocation]);

  const getShowtimeStatus = () => {
    if (!movie) return null;

    const now = new Date();
    const releaseDate = new Date(movie.releaseDate);

    if (releaseDate > now) {
      const formattedDate = releaseDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return {
        message: `Coming soon! Releases on ${formattedDate}`,
        type: "future" as const,
      };
    }

    if (showtimes.length === 0) {
      return {
        message: "Not currently showing in any theaters",
        type: "no-showtimes" as const,
      };
    }

    return {
      type: "has-showtimes" as const,
    };
  };

  // Filter showtimes based on view type
  const getFilteredShowtimes = (viewType: "by-theater" | "by-date") => {
    const nowUtc = Date.now();
    // Start of today (UTC)
    const now = new Date();
    const todayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(todayUtc.getUTCDate() + 1);
    const dayAfterTomorrowUtc = new Date(todayUtc);
    dayAfterTomorrowUtc.setUTCDate(todayUtc.getUTCDate() + 2);

    if (viewType === "by-date") {
      // All future showtimes
      return showtimes.filter((st) => Date.parse(st.startTime) > nowUtc);
    } else {
      // Today's remaining showtimes (from now to midnight UTC)
      const todayShowtimes = showtimes.filter((st) => {
        const showtime = new Date(st.startTime);
        return (
          showtime.getTime() >= nowUtc &&
          showtime.getTime() < tomorrowUtc.getTime()
        );
      });

      const isPastThreePM = now.getUTCHours() >= 15;
      const fewShowtimesLeft = todayShowtimes.length <= 2;

      if (isPastThreePM && fewShowtimesLeft) {
        // Show today's and tomorrow's showtimes
        return showtimes.filter((st) => {
          const showtime = new Date(st.startTime);
          return (
            showtime.getTime() >= nowUtc &&
            showtime.getTime() < dayAfterTomorrowUtc.getTime()
          );
        });
      }

      return todayShowtimes;
    }
  };

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
      const date = new Date(s.startTime);
      const localDateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      if (!acc[localDateString]) {
        acc[localDateString] = [];
      }
      acc[localDateString].push(s);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(showtimesByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !movie) {
    return (
      <Alert color="red" title="Error">
        {error || "Movie not found"}
      </Alert>
    );
  }

  const status = getShowtimeStatus();

  return (
    <Container size="xl" py="xl">
      <Paper p="md" radius="md" withBorder>
        <Grid>
          {/* Left Column - Movie Information */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              <Card withBorder radius="md" p={0}>
                <Card.Section>
                  <Image
                    src={movie.posterImageUrl}
                    height={600}
                    alt={movie.title}
                  />
                </Card.Section>
              </Card>

              <Stack gap="md">
                <Title order={1} size="h1" style={{ fontSize: "2.5rem" }}>
                  {movie.title}
                </Title>

                <Group gap="xs">
                  <MovieRating
                    rating={movie.rating}
                    score={movie.ratingScore}
                    size="md"
                  />
                  <Text fw={500}>{movie.durationMinutes} minutes</Text>
                </Group>

                <Text>{movie.description}</Text>

                {movie.trailerUrl && (
                  <Button
                    fullWidth
                    variant="light"
                    color="red"
                    onClick={() => setTrailerOpen(true)}
                    leftSection={<IconPlayerPlay size={18} />}
                  >
                    WATCH TRAILER
                  </Button>
                )}

                {status?.type === "future" && (
                  <Alert
                    icon={<IconCalendar size={16} />}
                    color="blue"
                    title="Release Date"
                  >
                    {status.message}
                  </Alert>
                )}
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Right Column - Showtimes */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box>
              <Title order={2} mb="xl">
                Showtimes
              </Title>

              {status?.type === "has-showtimes" && (
                <>
                  {locationError && (
                    <Alert color="yellow" title="Location Error" mb="md">
                      {locationError}
                    </Alert>
                  )}

                  <Tabs defaultValue="by-theater">
                    <Tabs.List>
                      <Tabs.Tab
                        value="by-theater"
                        leftSection={<IconBuildingEstate size={16} />}
                      >
                        By Theater
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="by-date"
                        leftSection={<IconCalendar size={16} />}
                      >
                        By Date
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="by-theater" pt="xs">
                      {Object.keys(theaters).length === 0 ? (
                        <Text size="md" c="dimmed">
                          No showtimes available for this movie.
                        </Text>
                      ) : (
                        Array.from(
                          getFilteredShowtimes("by-theater").reduce(
                            (acc, st) => {
                              const dateKey = new Date(st.startTime)
                                .toISOString()
                                .slice(0, 10); // 'YYYY-MM-DD'
                              if (!acc.has(dateKey)) acc.set(dateKey, []);
                              acc.get(dateKey)?.push(st);
                              return acc;
                            },
                            new Map<string, ShowtimeDTO[]>()
                          )
                        )
                          .sort(
                            ([a], [b]) =>
                              new Date(a).getTime() - new Date(b).getTime()
                          )
                          .map(([dateKey, dateShowtimes]) => (
                            <Paper
                              withBorder
                              p="lg"
                              radius="md"
                              mb="lg"
                              key={dateKey}
                            >
                              <Group mb="md">
                                <IconCalendar size={22} />
                                <Text fw={600} size="lg">
                                  {new Date(dateKey).toLocaleDateString(
                                    undefined,
                                    {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </Text>
                              </Group>
                              <Divider mb="lg" />
                              {Array.from(
                                dateShowtimes.reduce((acc, st) => {
                                  if (!theaters[st.theaterId]) return acc;
                                  if (!acc.has(st.theaterId))
                                    acc.set(st.theaterId, []);
                                  acc.get(st.theaterId)?.push(st);
                                  return acc;
                                }, new Map<number, ShowtimeDTO[]>())
                              )
                                .sort(([idA, _a], [idB, _b]) => {
                                  const theaterA = theaters[idA];
                                  const theaterB = theaters[idB];
                                  if (
                                    sortByDistance &&
                                    theaterA?.distance != null &&
                                    theaterB?.distance != null
                                  ) {
                                    return (
                                      theaterA.distance - theaterB.distance
                                    );
                                  }
                                  return (
                                    theaterA?.name.localeCompare(
                                      theaterB?.name || ""
                                    ) || 0
                                  );
                                })
                                .map(([theaterId, theaterShowtimes]) => {
                                  const theater = theaters[theaterId];
                                  if (!theater) return null;
                                  return (
                                    <Box key={theaterId} mb="md">
                                      <Group>
                                        <IconBuilding size={20} />
                                        <Text fw={500}>{theater.name}</Text>
                                        {theater.distance !== undefined && (
                                          <Badge color="blue" variant="light">
                                            {formatDistance(theater.distance)}
                                          </Badge>
                                        )}
                                      </Group>
                                      <Text size="sm" c="dimmed" mb="md">
                                        <IconCurrentLocation
                                          size={16}
                                          style={{
                                            display: "inline",
                                            verticalAlign: "text-bottom",
                                          }}
                                        />{" "}
                                        {theater.address}
                                      </Text>
                                      {Array.from(
                                        theaterShowtimes.reduce((acc, st) => {
                                          if (!acc.has(st.theaterRoomId))
                                            acc.set(st.theaterRoomId, []);
                                          acc.get(st.theaterRoomId)?.push(st);
                                          return acc;
                                        }, new Map<number, ShowtimeDTO[]>())
                                      )
                                        .sort(
                                          ([roomA], [roomB]) => roomA - roomB
                                        )
                                        .map(([roomId, roomShowtimes]) => (
                                          <Box key={roomId} mb="md">
                                            <Text size="sm" c="dimmed" mb="xs">
                                              Room {roomId}
                                            </Text>
                                            <SimpleGrid cols={4} spacing="xs">
                                              {roomShowtimes
                                                .sort(
                                                  (a, b) =>
                                                    new Date(
                                                      a.startTime
                                                    ).getTime() -
                                                    new Date(
                                                      b.startTime
                                                    ).getTime()
                                                )
                                                .map((showtime) => (
                                                  <Button
                                                    key={showtime.id}
                                                    variant="light"
                                                    color="red"
                                                    onClick={() =>
                                                      handleSelectShowtime(
                                                        showtime.id
                                                      )
                                                    }
                                                    leftSection={
                                                      <IconTicket size={16} />
                                                    }
                                                    title={`Room ${showtime.theaterRoomId}`}
                                                  >
                                                    {new Date(
                                                      showtime.startTime
                                                    ).toLocaleTimeString([], {
                                                      hour: "numeric",
                                                      minute: "2-digit",
                                                    })}
                                                  </Button>
                                                ))}
                                            </SimpleGrid>
                                          </Box>
                                        ))}
                                    </Box>
                                  );
                                })}
                            </Paper>
                          ))
                      )}
                    </Tabs.Panel>

                    <Tabs.Panel value="by-date" pt="xs">
                      {sortedDates.length === 0 ? (
                        <Text size="md" c="dimmed">
                          No showtimes available for this movie.
                        </Text>
                      ) : (
                        Array.from(
                          getFilteredShowtimes("by-date").reduce((acc, st) => {
                            const dateKey = new Date(st.startTime)
                              .toISOString()
                              .slice(0, 10); // 'YYYY-MM-DD'
                            if (!acc.has(dateKey)) {
                              acc.set(dateKey, []);
                            }
                            acc.get(dateKey)?.push(st);
                            return acc;
                          }, new Map<string, ShowtimeDTO[]>())
                        ).map(([dateKey, dateShowtimes]) => (
                          <Paper
                            withBorder
                            p="lg"
                            radius="md"
                            mb="lg"
                            key={dateKey}
                          >
                            <Group mb="md">
                              <IconCalendar size={22} />
                              <Text fw={600} size="lg">
                                {new Date(dateKey).toLocaleDateString(
                                  undefined,
                                  {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </Text>
                            </Group>
                            <Divider mb="lg" />
                            {Array.from(
                              dateShowtimes.reduce((acc, st) => {
                                if (!theaters[st.theaterId]) return acc;
                                if (!acc.has(st.theaterId)) {
                                  acc.set(st.theaterId, []);
                                }
                                acc.get(st.theaterId)?.push(st);
                                return acc;
                              }, new Map<number, ShowtimeDTO[]>())
                            )
                              .sort(([idA, _a], [idB, _b]) => {
                                const theaterA = theaters[idA];
                                const theaterB = theaters[idB];
                                if (
                                  sortByDistance &&
                                  theaterA?.distance != null &&
                                  theaterB?.distance != null
                                ) {
                                  return theaterA.distance - theaterB.distance;
                                }
                                return (
                                  theaterA?.name.localeCompare(
                                    theaterB?.name || ""
                                  ) || 0
                                );
                              })
                              .map(([theaterId, theaterShowtimes]) => {
                                const theater = theaters[theaterId];
                                console.log("By Date tab theater:", theater); // Debug log
                                if (!theater) return null;
                                return (
                                  <Box key={theaterId} mb="md">
                                    <Group>
                                      <IconBuilding size={20} />
                                      <Text fw={500}>{theater.name}</Text>
                                      {theater.distance !== undefined && (
                                        <Badge color="blue" variant="light">
                                          {formatDistance(theater.distance)}
                                        </Badge>
                                      )}
                                    </Group>
                                    <Text size="sm" c="dimmed" mb="md">
                                      <IconCurrentLocation
                                        size={16}
                                        style={{
                                          display: "inline",
                                          verticalAlign: "text-bottom",
                                        }}
                                      />{" "}
                                      {theater.address}
                                    </Text>
                                    {Array.from(
                                      theaterShowtimes.reduce((acc, st) => {
                                        if (!acc.has(st.theaterRoomId)) {
                                          acc.set(st.theaterRoomId, []);
                                        }
                                        acc.get(st.theaterRoomId)?.push(st);
                                        return acc;
                                      }, new Map<number, ShowtimeDTO[]>())
                                    )
                                      .sort(([roomA], [roomB]) => roomA - roomB)
                                      .map(([roomId, roomShowtimes]) => (
                                        <Box key={roomId} mb="md">
                                          <Text size="sm" c="dimmed" mb="xs">
                                            Room {roomId}
                                          </Text>
                                          <SimpleGrid cols={4} spacing="xs">
                                            {roomShowtimes
                                              .sort(
                                                (a, b) =>
                                                  new Date(
                                                    a.startTime
                                                  ).getTime() -
                                                  new Date(
                                                    b.startTime
                                                  ).getTime()
                                              )
                                              .map((showtime) => (
                                                <Button
                                                  key={showtime.id}
                                                  variant="light"
                                                  color="red"
                                                  onClick={() =>
                                                    handleSelectShowtime(
                                                      showtime.id
                                                    )
                                                  }
                                                  leftSection={
                                                    <IconTicket size={16} />
                                                  }
                                                  title={`Room ${showtime.theaterRoomId}`}
                                                >
                                                  {new Date(
                                                    showtime.startTime
                                                  ).toLocaleTimeString([], {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                  })}
                                                </Button>
                                              ))}
                                          </SimpleGrid>
                                        </Box>
                                      ))}
                                  </Box>
                                );
                              })}
                          </Paper>
                        ))
                      )}
                    </Tabs.Panel>
                  </Tabs>
                </>
              )}

              {status?.type === "no-showtimes" && (
                <Box mt="md">
                  <Text size="lg" c="dimmed">
                    Not currently showing in any theaters
                  </Text>
                </Box>
              )}
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Trailer Modal */}
      {movie.trailerUrl && (
        <Modal
          opened={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          size="xl"
          centered
          padding="xl"
          styles={{
            header: {
              display: "none",
            },
            content: {
              backgroundColor: "var(--mantine-color-dark-7)",
              borderRadius: "12px",
            },
          }}
        >
          <Stack gap="xl">
            <Title order={2} c="white" ta="center">
              Watch Trailer
            </Title>
            <Box
              component="iframe"
              src={getYoutubeEmbedUrl(movie.trailerUrl)}
              height={500}
              style={{
                border: 0,
                width: "100%",
                borderRadius: "8px",
              }}
              allowFullScreen
            />
          </Stack>
        </Modal>
      )}
    </Container>
  );
};

export default MovieShowtimes;
