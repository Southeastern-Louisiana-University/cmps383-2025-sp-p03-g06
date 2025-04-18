import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  Text,
  useMantineColorScheme,
  Flex,
  Badge,
  Group,
  Rating,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { movieApi, MovieDTO } from "../services/api";
import { IconClock, IconMovie, IconTicket } from "@tabler/icons-react";

// Map of movie titles to their ratings in the range of 0-10
const movieRatings: Record<string, number> = {
  "Snow White": 5.5,
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

const LandingPage = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<MovieDTO[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await movieApi.getAllMovies();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Failed to fetch movies", error);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movie: MovieDTO) => {
    navigate(`/movies/${movie.id}/showtimes`);
  };

  const handleJoinClick = () => {
    navigate("/signup");
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Convert 0-10 rating to 0-5 stars for the rating component
  const getRatingStars = (title: string) => {
    const rating = movieRatings[title] || 0;
    return rating / 2;
  };

  return (
    <Box>
      <Box
        style={{
          position: "relative",
          padding: "40px 0",
          overflow: "hidden",
          background: isDark ? "#1a1b1e" : "#f8f9fa",
          width: "100%",
        }}
      >
        <Carousel
          slideSize="33.333%"
          slidesToScroll={1}
          align="start"
          slideGap="md"
          controlsOffset="sm"
          loop
          withControls
          withIndicators
          styles={{
            root: {
              width: "100vw",
              maxWidth: "100%",
            },
            viewport: {
              padding: "5px 0",
            },
            container: {
              padding: "0 20px",
            },
            control: {
              width: "80px",
              height: "80px",
              backgroundColor: isDark
                ? "#ffffff" // Solid white background in dark mode
                : "#000000", // Solid black background in light mode
              color: isDark ? "#000000" : "#ffffff", // Contrasting icon color
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              border: isDark ? "3px solid #ffffff" : "3px solid #000000",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isDark
                  ? "#f0f0f0" // Slightly off-white on hover
                  : "#202020", // Dark gray on hover
                scale: "1.05",
                border: isDark ? "4px solid #ffffff" : "4px solid #000000",
              },
            },
            controls: {
              padding: "0 80px",
              justifyContent: "space-between",
              width: "100%",
            },
            indicators: {
              bottom: "-30px",
            },
            indicator: {
              width: "10px",
              height: "10px",
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(0, 0, 0, 0.3)",
              "&[data-active]": {
                backgroundColor: isDark ? "white" : "black",
              },
            },
          }}
        >
          {movies.map((movie) => (
            <Carousel.Slide key={movie.id}>
              <Flex direction="column" gap="xs" style={{ padding: "0 10px" }}>
                {/* Movie Poster - Clickable */}
                <Box
                  style={{
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    paddingBottom: "150%", // 2:3 aspect ratio typical for movie posters
                    overflow: "hidden",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    ":hover": {
                      transform: "scale(1.03)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                    },
                  }}
                  onClick={() => handleMovieClick(movie)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${
                        movie.posterImageUrl || "/images/default-movie.jpg"
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </Box>

                {/* Movie Info Below Poster */}
                <Flex
                  direction="column"
                  gap={8}
                  justify="center"
                  align="center"
                  style={{ padding: "10px", minHeight: "150px" }}
                >
                  <Text size="md" fw={700} lineClamp={1} ta="center">
                    {movie.title}
                  </Text>

                  <Group gap={10} style={{ justifyContent: "center" }}>
                    <Badge color={isDark ? "gray" : "dark"}>
                      <Group gap={5}>
                        <IconClock size={14} />
                        <Text size="xs">{movie.durationMinutes} min</Text>
                      </Group>
                    </Badge>

                    {movie.rating && (
                      <Badge color={isDark ? "blue" : "indigo"}>
                        {movie.rating}
                      </Badge>
                    )}
                  </Group>

                  {/* Movie Rating Stars */}
                  <Group gap={5} mt={5}>
                    <Rating
                      value={getRatingStars(movie.title)}
                      fractions={2}
                      readOnly
                      size="sm"
                    />
                    <Text size="xs" c="dimmed">
                      {movieRatings[movie.title]?.toFixed(1) || "N/A"}/10
                    </Text>
                  </Group>

                  <Text size="xs" c="dimmed" ta="center" mb={5}>
                    Released {formatReleaseDate(movie.releaseDate)}
                  </Text>

                  {/* Red button with white text */}
                  <Button
                    fullWidth
                    color="red"
                    onClick={() => handleMovieClick(movie)}
                    style={{
                      backgroundColor: "#e03131",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: "4px",
                      marginTop: "8px",
                    }}
                    styles={{
                      root: {
                        "&:hover": {
                          backgroundColor: "#c92a2a",
                        },
                      },
                      label: {
                        color: "white",
                      },
                    }}
                    leftSection={<IconTicket size={16} />}
                  >
                    GET TICKETS
                  </Button>
                </Flex>
              </Flex>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      {/* Membership Section - Only show if not authenticated */}
      {!isAuthenticated && (
        <Box
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: isDark ? "#141517" : "#f1f3f5",
          }}
        >
          <Text size="xl" fw={700} mb={10}>
            Become a Member
          </Text>
          <Text c="dimmed" mb={20}>
            Join the Den to receive special offers, early access to tickets, and
            more.
          </Text>
          <Button
            color="red"
            size="md"
            onClick={handleJoinClick}
            style={{
              backgroundColor: "#e03131",
              color: "white",
              fontWeight: 600,
            }}
            styles={{
              root: {
                "&:hover": {
                  backgroundColor: "#c92a2a",
                },
              },
              label: {
                color: "white",
              },
            }}
            leftSection={<IconMovie size={18} />}
          >
            JOIN NOW
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;
