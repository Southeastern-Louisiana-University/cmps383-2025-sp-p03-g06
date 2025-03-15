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
        }}
      >
        <Title order={1} size="48px" mb="md" style={{ color: "#fff" }}>
          Welcome to Lion's Den Cinema
        </Title>
        <Text size="lg" mb="xl" style={{ color: "#ddd" }}>
          Enjoy blockbuster movies, ultimate comfort, and unforgettable
          experiences.
        </Text>
        <Button size="lg" color={isDark ? "yellow" : "green"}>
          Get Tickets Now
        </Button>
      </Box>

      <Container py="xl">
        <Title order={2} mb="lg" ta="center">
          Now Showing
        </Title>
        <Carousel
          withIndicators
          height={400}
          slideSize={{ base: "100%", sm: "50%", md: "33.3333%" }}
          slideGap="md"
          align="start"
          loop
        >
          {movies.map((movie, idx) => (
            <Carousel.Slide key={idx}>
              <Image
                src={movie.image}
                radius="md"
                height={300}
                fit="cover"
                mb="sm"
              />
              <Text fw={600} ta="center" mt="md">
                {movie.title}
              </Text>
              <Button
                mt="sm"
                fullWidth
                color={colorScheme === "dark" ? "yellow" : "green"}
              >
                Buy Tickets
              </Button>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Container>

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
            <Button variant="outline" leftSection={<IconTheater size={18} />}>
              View Locations
            </Button>
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
            color={isDark ? "yellow" : "green"}
            leftSection={<IconTicket size={18} />}
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
