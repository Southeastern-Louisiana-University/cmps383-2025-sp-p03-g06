// src/components/LandingPage.tsx
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
import { useDisclosure } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { movieApi, MovieDTO } from "../services/api";
import { IconClock, IconMovie, IconTicket } from "@tabler/icons-react";
import MovieRating from "./MovieRating";
import LoginSignupModal from "./LoginSignupModal";

const LandingPage = () => {
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [initialView, setInitialView] = useState<"login" | "signup">("signup");

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

  const handleSuccess = () => {
    closeModal();
  };

  const handleJoinNow = () => {
    setInitialView("signup");
    openModal();
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
  const getRatingStars = (score: number | undefined) => {
    if (typeof score !== "number") return 0;
    return Math.max(0, Math.min(5, score / 2));
  };

  // Format score for display
  const formatScore = (score: number | undefined) => {
    if (typeof score !== "number") return "N/A";
    return score.toFixed(1);
  };

  return (
    <Box
      style={{
        backgroundColor: "var(--background-darker)",
        minHeight: "100vh",
      }}
    >
      {/* Carousel section */}
      <Box
        style={{
          position: "relative",
          padding: "40px 0",
          overflow: "hidden",
          backgroundColor: "var(--background-darker)", // ← matched to footer/navbar
          width: "100%",
        }}
      >
        <Carousel
          slideSize="20%"
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
              width: 80,
              height: 80,
              backgroundColor: "#e03131",
              color: "white",
              borderRadius: "12px",
              border: "3px solid black",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              outline: "none",
              "& svg": {
                width: 40,
                height: 40,
              },
              "&:hover": {
                backgroundColor: "#c92a2a",
                color: "white",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
                transform: "scale(1.1)",
                border: "3px solid black",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            },
            controls: {
              padding: "0 40px",
              justifyContent: "space-between",
              width: "100%",
            },
            indicators: {
              bottom: "-30px",
            },
            indicator: {
              width: 16,
              height: 16,
              backgroundColor: "#e03131",
              borderRadius: "50%",
              transition: "all 0.2s ease",
              "&[data-active]": {
                backgroundColor: "#c92a2a",
                transform: "scale(1.2)",
              },
            },
          }}
        >
          {movies.map((movie) => (
            <Carousel.Slide key={movie.id}>
              <Flex direction="column" gap="xs" style={{ padding: "0 10px" }}>
                <Box
                  style={{
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    paddingBottom: "150%",
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

                    <MovieRating
                      rating={movie.rating}
                      score={movie.ratingScore}
                      size="sm"
                      showTooltip={true}
                    />
                  </Group>

                  <Text size="xs" c="dimmed" ta="center" mb={5}>
                    Released {formatReleaseDate(movie.releaseDate)}
                  </Text>

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

      {/* Membership Section */}
      {!isAuthenticated && (
        <Box
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "var(--background-darker)", // ← match footer/navbar
          }}
        >
          <Text
            size="xl"
            fw={700}
            mb={10}
            style={{ color: isDark ? "white" : "black" }}
          >
            Become a Member
          </Text>
          <Text c="dimmed" mb={20}>
            Join the Den to receive special offers, early access to tickets, and
            more.
          </Text>
          <Button
            color="red"
            size="md"
            onClick={handleJoinNow}
            style={{
              backgroundColor: "#e03131",
              color: "white",
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

      <LoginSignupModal
        opened={modalOpened}
        onClose={closeModal}
        onSuccess={handleSuccess}
        initialView={initialView}
      />
    </Box>
  );
};

export default LandingPage;
