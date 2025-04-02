import {
  Box,
  Button,
  Container,
  Group,
  Image,
  Text,
  Title,
  useMantineColorScheme,
  Paper,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Add this import
import { Carousel } from "@mantine/carousel";
import { featuredMovies } from "../components/FeaturedMovies";
import "@mantine/carousel/styles.css"; // Import carousel styles
import {
  IconTicket,
  IconTheater,
  IconMovie,
  IconStar,
  IconDiscount2,
  IconUsers,
  IconBrandTiktok,
} from "@tabler/icons-react";

const LandingPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth(); // Add this line to use the auth context

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

  const features = [
    {
      icon: <IconMovie size={32} />,
      title: "Latest Movies",
      description:
        "Enjoy the newest releases in stunning picture and sound quality.",
    },
    {
      icon: <IconStar size={32} />,
      title: "Premium Experience",
      description: "Choose from standard, premium, or VIP seating options.",
    },
    {
      icon: <IconDiscount2 size={32} />,
      title: "Special Discounts",
      description: "Get special deals on matinee shows and weekday screenings.",
    },
    {
      icon: <IconUsers size={32} />,
      title: "Family Friendly",
      description:
        "Special screenings and events for the whole family to enjoy.",
    },
  ];

    return (
        <>
         {}
         <Box
           style={{
           position: "relative",
           height: "500px",
           margin: 0,
           overflow: "hidden",
           width: '100vw'
                }}
            >
           <Carousel
            withIndicators
            withControls
            loop
            height="100%"
            styles={{
            root: { height: "100%" },
            slide: { height: "100%" },
            controls: {
            color: "#fff",
            backgroundColor: "transparent",
            border: "none",
              },
              indicator: {
                width: "10px",
                height: "10px",
                transition: "width 250ms ease",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                "&[data-active]": {
                backgroundColor: "#fff",
                     },
                   },
                }}
             >
             {featuredMovies.map((movie, idx) => (
               <Carousel.Slide key={idx}>
                 <Box
                   style={{
                   backgroundImage: `url('${movie.image}')`,
                   backgroundSize: "cover",
                   backgroundPosition: "center",
                   height: "100%",
                   display: "flex",
                   flexDirection: "column",
                   justifyContent: "flex-end",
                   padding: "2rem",
                       }}
                >
                  <Box style={{ maxWidth: "800px", margin: "0 auto", width: "100%", textAlign: "center" }}>
                    <Title order={1} size="48px" mb="xs" style={{ color: "#fff" }}>
                      {movie.title}
                     </Title>
                     <Text size="xl" mb="xl" style={{ color: "#ddd" }}>
                      {movie.description}
                     </Text>
                      <Group justify="center" gap="md">
                                    
                                       
                      </Group>
                      </Box>
                      </Box>
                      </Carousel.Slide>
                    ))}
                </Carousel>
            </Box>

      <Container size="lg" py="xl">
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
                component={Link}
                to="/movies"
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
          <Title order={2} ta="center" mb="xl">
            A Premium Movie Experience
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {features.map((feature, index) => (
              <Paper
                key={index}
                p="md"
                radius="md"
                withBorder
                shadow="sm"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  background: isDark
                    ? "rgba(37, 38, 43, 0.5)"
                    : "rgba(255, 255, 255, 0.7)",
                }}
              >
                <Box
                  mb="md"
                  style={{
                    color: isDark ? "#d4af37" : "#0d6832",
                  }}
                >
                  {feature.icon}
                </Box>
                <Text fw={600} mb="xs">
                  {feature.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>

          <Group justify="center" mt="xl">
            <Button
              component={Link}
              to="/theaters"
              variant="outline"
              leftSection={<IconTheater size={18} />}
            >
              View Locations
            </Button>
          </Group>
        </Container>
      </Box>

      <Box bg={isDark ? "gray.9" : "gray.1"} py="xl">
        <Container>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} mb="lg">
                Download Our App
              </Title>
              <Text mb="md">
                Get the most out of your cinema experience with our mobile app.
                Book tickets, choose seats, and unlock exclusive offers - all
                from your smartphone.
              </Text>
              <Group mb="xl">
                <Button
                  variant="filled"
                  color={isDark ? "yellow" : "green"}
                  leftSection={<IconBrandTiktok size={18} />}
                >
                  App Store
                </Button>
                <Button variant="outline" color={isDark ? "yellow" : "green"}>
                  Google Play
                </Button>
              </Group>
            </Grid.Col>
            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div style={{ maxWidth: "250px" }}>
                <Image
                  src="/images/app-mockup.png"
                  alt="App Mockup"
                  style={{ maxWidth: "100%" }}
                  fallbackSrc="https://placehold.co/300x500/gray/white?text=App+Screenshot"
                />
              </div>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box py="xl">
        <Container ta="center">
          <Title order={2} mb="lg">
            Become a Member
          </Title>
          <Text mb="lg">
            Join the Den to receive special offers, early access to tickets, and
            more.
          </Text>
          <Button
            component={Link}
            to="/signup"
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
