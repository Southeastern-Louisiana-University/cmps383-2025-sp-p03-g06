import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  Card,
  Divider,
  Alert,
  Loader,
  Center,
  Tabs,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconTicket,
  IconCalendarEvent,
  IconClock,
  IconTheater,
  IconCurrencyDollar,
  IconQrcode,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";

// You'll need to add these types and API methods to your services/api.ts file
import { reservationApi, ReservationDTO } from "../services/api";

const MyReservations = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate("/login", { state: { redirectTo: "/my-reservations" } });
      return;
    }

    const fetchReservations = async () => {
      try {
        const data = await reservationApi.getMyReservations();
        setReservations(data);
      } catch (error) {
        setError("Failed to fetch your reservations");
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, navigate, loading]);

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          my="xl"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Filter reservations by status
  const upcomingReservations = reservations.filter(
    (r) =>
      r.status === "Confirmed" && new Date(r.showtimeStartTime) > new Date()
  );

  const pastReservations = reservations.filter(
    (r) =>
      (r.status === "Confirmed" &&
        new Date(r.showtimeStartTime) <= new Date()) ||
      r.status === "Cancelled"
  );

  const renderReservationCard = (reservation: ReservationDTO) => {
    const showtime = new Date(reservation.showtimeStartTime);
    const isPast = showtime <= new Date();
    const isCancelled = reservation.status === "Cancelled";

    return (
      <Card
        key={reservation.id}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        mb="md"
        style={{
          borderTop: `3px solid ${
            isCancelled
              ? "#e03131"
              : isPast
              ? "#868e96"
              : isDark
              ? "#d4af37"
              : "#0d6832"
          }`,
          opacity: isCancelled ? 0.7 : 1,
        }}
      >
        <Group justify="apart" mb="xs">
          <Title order={4}>{reservation.movieTitle}</Title>
          <Badge
            color={
              isCancelled
                ? "red"
                : isPast
                ? "gray"
                : isDark
                ? "yellow"
                : "green"
            }
          >
            {reservation.status}
          </Badge>
        </Group>

        <Group mb="xs">
          <IconCalendarEvent size={16} />
          <Text size="sm">
            {showtime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Group>

        <Group mb="xs">
          <IconClock size={16} />
          <Text size="sm">
            {showtime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Group>

        <Group mb="xs">
          <IconTheater size={16} />
          <Text size="sm">
            {reservation.theaterName} - {reservation.roomName}
          </Text>
        </Group>

        <Group mb="xs">
          <IconTicket size={16} />
          <Text size="sm">
            Seats:{" "}
            {reservation.seats
              .map((seat) => `${seat.row}${seat.number}`)
              .join(", ")}
          </Text>
        </Group>

        <Group mb="xs">
          <IconCurrencyDollar size={16} />
          <Text size="sm">Total: ${reservation.totalPrice.toFixed(2)}</Text>
        </Group>

        {!isCancelled && (
          <>
            <Divider my="md" />

            <Group justify="apart">
              {!isPast && (
                <Button
                  variant="outline"
                  color="red"
                  size="xs"
                  onClick={() => handleCancelReservation(reservation.id)}
                >
                  Cancel
                </Button>
              )}

              <Button
                variant="light"
                color={isDark ? "yellow" : "green"}
                rightSection={<IconQrcode size={16} />}
                size="xs"
                onClick={() => handleViewTicket(reservation.id)}
              >
                View Ticket
              </Button>
            </Group>
          </>
        )}
      </Card>
    );
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await reservationApi.cancelReservation(id);

      // Update reservation status locally
      setReservations((prevReservations) =>
        prevReservations.map((res) =>
          res.id === id ? { ...res, status: "Cancelled" } : res
        )
      );
    } catch (error) {
      setError("Failed to cancel reservation");
      console.error("Error cancelling reservation:", error);
    }
  };

  const handleViewTicket = (id: number) => {
    navigate(`/ticket/${id}`);
  };

  return (
    <Container size="lg" py="xl">
      <Title
        order={2}
        mb="xl"
        ta="center"
        style={{
          color: isDark ? "#fff" : "#0d6832",
        }}
      >
        My Tickets
      </Title>

      {reservations.length === 0 ? (
        <Paper p="xl" withBorder ta="center">
          <IconTicket size={40} style={{ opacity: 0.5 }} />
          <Text mt="md" size="lg" fw={500}>
            You don't have any reservations yet
          </Text>
          <Text size="sm" c="dimmed" mb="xl">
            Browse movies and book your first show!
          </Text>
          <Button
            onClick={() => navigate("/movies")}
            color={isDark ? "yellow" : "green"}
          >
            View Movies
          </Button>
        </Paper>
      ) : (
        <Tabs defaultValue="upcoming">
          <Tabs.List mb="md">
            <Tabs.Tab
              value="upcoming"
              leftSection={<IconCalendarEvent size={16} />}
            >
              Upcoming ({upcomingReservations.length})
            </Tabs.Tab>
            <Tabs.Tab value="past" leftSection={<IconClock size={16} />}>
              Past & Cancelled ({pastReservations.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upcoming">
            {upcomingReservations.length === 0 ? (
              <Text ta="center" c="dimmed">
                You don't have any upcoming reservations.
              </Text>
            ) : (
              upcomingReservations.map(renderReservationCard)
            )}
          </Tabs.Panel>

          <Tabs.Panel value="past">
            {pastReservations.length === 0 ? (
              <Text ta="center" c="dimmed">
                You don't have any past reservations.
              </Text>
            ) : (
              pastReservations.map(renderReservationCard)
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
};

export default MyReservations;
