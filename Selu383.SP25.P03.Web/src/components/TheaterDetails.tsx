import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Group,
  Text,
  Title,
  Badge,
  Center,
  Container,
  Loader,
  SimpleGrid,
} from "@mantine/core";
import {
  theaterApi,
  movieApi,
  type TheaterDTO,
  type MovieDTO,
  type TheaterRoomDTO,
} from "../services/api";
import MovieRating from "./MovieRating";

export default function TheaterDetails() {
  const { id } = useParams<{ id: string }>();
  const [theater, setTheater] = useState<TheaterDTO | null>(null);
  const [rooms, setRooms] = useState<TheaterRoomDTO[]>([]);
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheaterDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const theaterId = parseInt(id);

        // Fetch theater details
        const theaterData = await theaterApi.getTheaterById(theaterId);
        setTheater(theaterData);

        // Fetch theater rooms
        const roomsData = await theaterApi.getTheaterRoomsById(theaterId);
        setRooms(roomsData);

        // Fetch movies for this theater
        const movieIds = await theaterApi.getMoviesByTheater(theaterId);
        const moviePromises = movieIds.map((movieId) =>
          movieApi.getMovieById(movieId)
        );
        const moviesData = await Promise.all(moviePromises);
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching theater details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaterDetails();
  }, [id]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error || !theater) {
    return (
      <Center h="100vh">
        <Text color="red.500">{error || "Theater not found"}</Text>
      </Center>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>{theater.name}</Title>
          <Text size="lg">{theater.address}</Text>
          <Text size="md">Total Seats: {theater.seatCount}</Text>
        </div>

        <div>
          <Title order={2} mb="md">
            Theater Rooms
          </Title>
          <SimpleGrid cols={3} spacing="md">
            {rooms.map((room) => (
              <Box
                key={room.id}
                p="md"
                style={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                }}
              >
                <Text fw={500}>{room.name}</Text>
                <Text>Seats: {room.seatCount}</Text>
                <Text>Screen: {room.screenType}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </div>

        <div>
          <Title order={2} mb="md">
            Movies Playing
          </Title>
          <SimpleGrid cols={4} spacing="md">
            {movies.map((movie) => (
              <Box
                key={movie.id}
                p="md"
                style={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                }}
              >
                <Stack gap="sm">
                  {movie.posterImageUrl && (
                    <img
                      src={movie.posterImageUrl}
                      alt={movie.title}
                      style={{ width: "100%", height: "auto" }}
                    />
                  )}
                  <Text fw={500}>{movie.title}</Text>
                  <MovieRating rating={movie.rating} />
                  <Text size="sm">{movie.durationMinutes} minutes</Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
}
