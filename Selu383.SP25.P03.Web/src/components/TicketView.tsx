import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Box,
  Center,
  Loader,
  Alert,
  Divider,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarEvent,
  IconClock,
  IconTheater,
  IconTicket,
  IconPrinter,
  IconDeviceIpadHorizontal,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";

// You'll need to add these types and API methods to your services/api.ts file
import { reservationApi, ReservationDTO } from "../services/api";

const TicketView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const [reservation, setReservation] = useState<ReservationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate("/login");
      return;
    }

    const fetchReservation = async () => {
      if (!id) return;

      try {
        const data = await reservationApi.getReservationById(parseInt(id));
        setReservation(data);
      } catch (error) {
        setError("Failed to fetch ticket information");
        console.error("Error fetching reservation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservation();
    }
  }, [id, isAuthenticated, navigate, loading]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !reservation) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          my="xl"
        >
          {error || "Ticket not found"}
        </Alert>
        <Button
          onClick={() => navigate(-1)}
          leftSection={<IconArrowLeft size={16} />}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const showtime = new Date(reservation.showtimeStartTime);
  const isPast = showtime <= new Date();
  const isCancelled = reservation.status === "Cancelled";

  return (
    <Container size="md" py="xl" className="ticket-view">
      <Button
        variant="subtle"
        mb="lg"
        onClick={() => navigate("/my-reservations")}
        leftSection={<IconArrowLeft size={16} />}
      >
        Back to My Tickets
      </Button>

      <Paper
        withBorder
        p="xl"
        radius="md"
        className="ticket-container"
        style={{
          border: `2px dashed ${
            isCancelled
              ? "#e03131"
              : isPast
              ? "#868e96"
              : isDark
              ? "#d4af37"
              : "#0d6832"
          }`,
          background: isDark
            ? "rgba(37, 38, 43, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
        }}
      >
        {isCancelled && (
          <Alert color="red" mb="md">
            This ticket has been cancelled and is no longer valid.
          </Alert>
        )}

        {isPast && !isCancelled && (
          <Alert color="yellow" mb="md">
            This showtime has already passed.
          </Alert>
        )}

        <Box ta="center" mb="md">
          <Title order={2} mb="xs">
            LIONS DEN CINEMAS
          </Title>
          <Text c="dimmed">Your Movie Ticket</Text>
        </Box>

        <Box
          style={{
            background: isDark
              ? "rgba(26, 27, 30, 0.8)"
              : "rgba(245, 245, 245, 0.8)",
            borderRadius: "4px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <Center>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="200"
              height="200"
              viewBox="0 0 200 200"
              style={{ maxWidth: "100%" }}
            >
              {/* This is a simple representation of a QR code - in a real app, you would generate a proper QR code */}
              <rect x="0" y="0" width="200" height="200" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="160" y="10" width="30" height="30" fill="black" />
              <rect x="10" y="160" width="30" height="30" fill="black" />
              <rect x="50" y="50" width="100" height="100" fill="black" />
              <rect x="70" y="70" width="60" height="60" fill="white" />
              <text
                x="100"
                y="180"
                fontSize="12"
                textAnchor="middle"
                fill="black"
              >
                {reservation.ticketCode}
              </text>
            </svg>
          </Center>
        </Box>

        <Stack gap="md">
          <Group justify="apart">
            <Text size="lg" fw={700}>
              {reservation.movieTitle}
            </Text>
          </Group>

          <Group>
            <IconCalendarEvent size={20} />
            <Text>
              {showtime.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Group>

          <Group>
            <IconClock size={20} />
            <Text>
              {showtime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Group>

          <Group>
            <IconTheater size={20} />
            <Text>
              {reservation.theaterName} - {reservation.roomName}
            </Text>
          </Group>

          <Group>
            <IconTicket size={20} />
            <Text>
              Seats:{" "}
              {reservation.seats
                .map((seat) => `${seat.row}${seat.number}`)
                .join(", ")}
            </Text>
          </Group>

          <Divider my="md" />

          <Group justify="apart">
            <Text>Ticket Code:</Text>
            <Text fw={700}>{reservation.ticketCode}</Text>
          </Group>

          <Group justify="apart">
            <Text>Total:</Text>
            <Text fw={700}>${reservation.totalPrice.toFixed(2)}</Text>
          </Group>
        </Stack>

        <Box
          mt="xl"
          style={{
            borderTop: `1px dashed ${isDark ? "#555" : "#ddd"}`,
            paddingTop: "20px",
          }}
        >
          <Text ta="center" size="sm" c="dimmed" mb="md">
            Present this ticket at the theater entrance.
          </Text>

          <Group justify="center">
            <Button
              variant="outline"
              leftSection={<IconPrinter size={16} />}
              onClick={handlePrint}
            >
              Print Ticket
            </Button>
            <Button
              variant="outline"
              leftSection={<IconDeviceIpadHorizontal size={16} />}
              onClick={() => navigate(`/ticket/${id}/fullscreen`)}
            >
              Fullscreen
            </Button>
          </Group>
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketView;
