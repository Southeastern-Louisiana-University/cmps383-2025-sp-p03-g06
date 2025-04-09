import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, Button, Text, useMantineColorScheme, Flex } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { movieApi, MovieDTO } from "../services/api";


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


  return (
    <Box>
      <Box
        style={{

          position: "relative",
          padding: "30px 0",
          overflow: "hidden",
          background: isDark ? "#1a1b1e" : "#f8f9fa",
        }}
      >
        <Carousel
          slideSize={{ base: "70%", sm: "40%", md: "30%", lg: "20%" }}

          slideGap="md"
          containScroll="trimSnaps"
          slidesToScroll={1}
          withControls
          loop

          controlsOffset="xs"
          styles={{
            container: {
              gap: "10px",
              padding: "0 20px",
            },
            slide: {
              // Transition applied directly in CSS
              transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
              "&:hover": {
                transform: "scale(1.05)",
                zIndex: 10,
              },
            },
            control: {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
              color: isDark ? "white" : "black",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
              },
            },
          }}
        >
          {movies.map((movie) => (
            <Carousel.Slide key={movie.id}>
              <Flex direction="column" gap="xs">
                {/* Movie Poster */}
                <Box
                  style={{
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    paddingBottom: "150%", // 2:3 aspect ratio typical for movie posters
                    overflow: "hidden",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${movie.posterImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </Box>

                {/* Movie Info Below Poster */}
                <Flex
                  direction="column"
                  gap={4}
                  justify="center"
                  align="center"
                >
                  <Text size="md" fw={700} lineClamp={1} ta="center">
                    {movie.title}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center">
                    {movie.durationMinutes} MIN{" "}
                    {movie.rating && `| ${movie.rating}`}
                  </Text>
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
                      marginTop: "4px",
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

          >
            JOIN NOW
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;
