import {
  Box,
  Button,
  Container,
  Group,
  Image,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css"; // Import carousel styles
import { IconTicket, IconTheater } from "@tabler/icons-react";

const LandingPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const movies = [
    { image: "/images/now_showing/LooneyTunes.avif", title: "Looney Tunes" },
    {
      image: "/images/now_showing/CaptainAmerica.avif",
      title: "Captain America",
    },
    {
      image: "/images/now_showing/PaddingtonBear.avif",
      title: "Paddington Bear",
    },
    {
      image: "/images/now_showing/Mickey17.jpg",
      title: "Mickey17",
    },
    {
      image: "/images/now_showing/Mufasa.avif",
      title: "Mufasa: The Lion King",
    },
    {
      image: "/images/now_showing/Novocaine.avif",
      title: "Novocaine",
    },
    {
      image: "/images/now_showing/Gundam.avif",
      title: "Gundam",
    },
  ];

  return (
    <>
      <Box
        style={{
          backgroundImage: `url('/images/tickets_stock.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "100px 20px",
          textAlign: "center",
          color: "#ffffff",
          boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.6)",
          marginTop: "-16px", // This negative margin will pull the image up to meet the navbar
          paddingTop: "116px", // Increased padding to compensate for the negative margin
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
        }}
      >
        <Container size="lg">
          {" "}
          {/* Content container for proper alignment */}
          <Title order={1} size="48px" mb="md" style={{ color: "#fff" }}>
            Welcome to Lion's Den Cinema
          </Title>
          <Text size="lg" mb="xl" style={{ color: "#ddd" }}>
            Enjoy blockbuster movies, ultimate comfort, and unforgettable
            experiences.
          </Text>
          <Button size="lg">Get Tickets Now</Button>
        </Container>
      </Box>

      {/* Full-width carousel section */}
      <Box
        py="xl"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          backgroundColor: isDark ? "#1A1B1E" : "#f8f9fa",
        }}
      >
        <Container size="xl" mb="xl">
          <Title order={2} ta="center">
            Now Showing
          </Title>
        </Container>

        <Carousel
          withIndicators
          height={450} // Increase height a bit
          slideSize={{ base: "100%", sm: "40%", md: "25%", lg: "20%" }} // Show more slides on larger screens
          slideGap="md"
          align="start"
          loop
          containScroll="trimSnaps"
          px="xl"
        >
          {movies.map((movie, idx) => (
            <Carousel.Slide key={idx}>
              <Box
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Image
                  src={movie.image}
                  radius="md"
                  height={320}
                  fit="cover" // Use 'cover' to maintain aspect ratio without stretching
                  mb="sm"
                />
                <Text fw={600} ta="center" mt="sm">
                  {movie.title}
                </Text>
                <Button className="location-button" mt="auto" mb="md">
                  Buy Tickets
                </Button>
              </Box>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      <Box py="xl" bg={isDark ? "dark.8" : "gray.0"}>
        <Container>
          <Title order={2} ta="center" mb="lg">
            Visit Our Theaters
          </Title>
          <Text ta="center" mb="xl">
            Find your nearest Lion's Den Cinema and enjoy our state-of-the-art
            facilities.
          </Text>
          <Group justify="center">
            <Box mt="xl" mb="xl" ta="center">
              <Button
                className="location-button"
                size="md"
                color="brand"
                variant="filled"
                leftSection={<IconTheater size={18} />}
              >
                View Locations
              </Button>
            </Box>
          </Group>
        </Container>
      </Box>

      <Box bg={isDark ? "gray.9" : "gray.1"} py="xl">
        <Container ta="center">
          <Title order={2} mb="lg">
            Become a Member
          </Title>
          <Text mb="lg">
            Join the Den to receive special offers, early access to tickets, and
            more.
          </Text>
          <Button
            leftSection={<IconTicket size={18} />}
            className="location-button"
          >
            Join Now
          </Button>
        </Container>
      </Box>

      <Box
        component="footer"
        h={60}
        mt="lg"
        px="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Text size="sm" ta="center">
          © {new Date().getFullYear()} Lion's Den Cinema. All rights reserved.
        </Text>
      </Box>
    </>
  );
};

export default LandingPage;
