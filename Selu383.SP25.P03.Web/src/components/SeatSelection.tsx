import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Grid,
  Box,
  Divider,
  Alert,
  Loader,
  Center,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconTicket,
  IconClock,
  IconMovie,
  IconTheater,
  IconArmchair,
  IconArmchair2,
  IconWheelchair,
  IconInfoCircle,
  IconCheckbox,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { modals } from "@mantine/modals";

// You'll need to add these types and API methods to your services/api.ts file
import {
  showtimeApi,
  reservationApi,
  seatApi,
  ShowtimeDTO,
  SeatDTO,
} from "../services/api";

// Main color for the application
const MAIN_COLOR = "#c70036";

// Helper function to group seats by row
const groupSeatsByRow = (seats: SeatDTO[]) => {
  return seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, SeatDTO[]>);
};

// Component for the seating map legend
const SeatLegend = () => {
  return (
    <Paper p="md" withBorder>
      <Text fw={500} mb="sm">
        Seat Legend
      </Text>
      <Group mb="xs">
        <IconArmchair color="#aaa" size={20} />
        <Text size="sm">Available</Text>
      </Group>
      <Group mb="xs">
        <IconArmchair color={MAIN_COLOR} size={20} />
        <Text size="sm">Selected</Text>
      </Group>
      <Group mb="xs">
        <IconArmchair color="#d4af37" size={20} />
        <Text size="sm">Premium</Text>
      </Group>
      <Group mb="xs">
        <IconArmchair2 color="#7a5af5" size={20} />
        <Text size="sm">VIP</Text>
      </Group>
      <Group mb="xs">
        <IconWheelchair color="#e03131" size={20} />
        <Text size="sm">Accessible</Text>
      </Group>
      <Group mb="xs">
        <IconArmchair color="#555" size={20} />
        <Text size="sm">Unavailable</Text>
      </Group>
    </Paper>
  );
};

const SeatSelection = () => {
  const { id } = useParams<{ id: string }>(); // ID of the showtime
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const [showtime, setShowtime] = useState<ShowtimeDTO | null>(null);
  const [seats, setSeats] = useState<SeatDTO[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationInProgress, setReservationInProgress] = useState(false);

  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      if (!id) return;

      try {
        // Fetch showtime details
        const showtimeData = await showtimeApi.getShowtimeById(parseInt(id));
        setShowtime(showtimeData);

        // Fetch seats for the theater room
        const seatsData = await seatApi.getSeatsByRoomId(
          showtimeData.theaterRoomId
        );
        setSeats(seatsData);
      } catch (error) {
        setError("Failed to fetch showtime information");
        console.error("Error fetching showtimes/seats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeAndSeats();
  }, [id]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate("/login", {
        state: { redirectTo: `/reservations/create/${id}` },
      });
    }
  }, [isAuthenticated, loading, navigate, id]);

  const handleSeatClick = (seat: SeatDTO) => {
    if (!seat.isAvailable) return;

    setSelectedSeats((prevSelectedSeats) => {
      const isSeatSelected = prevSelectedSeats.some((s) => s.id === seat.id);
      if (isSeatSelected) {
        return prevSelectedSeats.filter((s) => s.id !== seat.id);
      } else {
        return [...prevSelectedSeats, seat];
      }
    });
  };

  const handleCreateReservation = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    if (!showtime) return;

    try {
      setReservationInProgress(true);

      // Create a reservation with the selected seats
      const reservationData = {
        showtimeId: showtime.id,
        seatIds: selectedSeats.map((seat) => seat.id),
      };

      const createdReservation = await reservationApi.createReservation(
        reservationData
      );

      // Show confirmation modal
      modals.open({
        title: <Text fw={700}>Reservation Confirmed!</Text>,
        centered: true,
        children: (
          <>
            <Text mb="md">
              Your seats have been reserved successfully! Would you like to add
              concessions to your order?
            </Text>
            <Group justify="center" mt="md">
              <Button
                variant="outline"
                color={MAIN_COLOR}
                onClick={() => {
                  modals.closeAll();
                  navigate("/my-reservations");
                }}
              >
                Skip
              </Button>
              <Button
                color={MAIN_COLOR}
                onClick={() => {
                  modals.closeAll();
                  navigate(`/concessions/${createdReservation.id}`);
                }}
              >
                Add Food & Drinks
              </Button>
            </Group>
          </>
        ),
        onClose: () => {
          navigate(`/concessions/${createdReservation.id}`);
        },
      });
    } catch (error) {
      console.error("Error creating reservation:", error);
      setError("Failed to create reservation. Please try again.");
    } finally {
      setReservationInProgress(false);
    }
  };

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" color={MAIN_COLOR} />
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

  if (!showtime) {
    return (
      <Container>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Not Found"
          color="red"
          my="xl"
        >
          Showtime not found
        </Alert>
      </Container>
    );
  }

  // Group seats by row for display
  const seatsByRow = groupSeatsByRow(seats);
  const sortedRows = Object.keys(seatsByRow)
    .sort() // ["A","B","C",…]
    .reverse(); // […,"C","B","A"]

  // Calculate total price
  const basePrice = showtime.baseTicketPrice;
  const totalPrice = selectedSeats.reduce((total, seat) => {
    let seatPrice = basePrice;
    if (seat.seatType === "Premium") {
      seatPrice *= 1.5;
    } else if (seat.seatType === "VIP") {
      seatPrice *= 2;
    }
    return total + seatPrice;
  }, 0);

  return (
    <Container size="xl" py="xl">
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        mb="xl"
        style={{
          borderTop: `3px solid ${MAIN_COLOR}`,
        }}
      >
        <Title order={3} mb="md">
          Select Your Seats
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Group mb="md">
              <IconMovie size={20} style={{ color: MAIN_COLOR }} />
              <Text fw={500}>{showtime.movieTitle}</Text>
            </Group>

            <Group mb="md">
              <IconTheater size={20} style={{ color: MAIN_COLOR }} />
              <Text>
                {showtime.theaterName} - {showtime.theaterRoomName}
              </Text>
            </Group>

            <Group mb="md">
              <IconClock size={20} style={{ color: MAIN_COLOR }} />
              <Text>
                {new Date(showtime.startTime).toLocaleDateString()}{" "}
                {new Date(showtime.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(showtime.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Group>

            <Group mb="md">
              <IconTicket size={20} style={{ color: MAIN_COLOR }} />
              <Text>Base Price: ${showtime.baseTicketPrice.toFixed(2)}</Text>
              <Tooltip label="Premium seats cost 1.5x base price. VIP seats cost 2x base price.">
                <IconInfoCircle
                  size={16}
                  style={{ cursor: "pointer", color: MAIN_COLOR }}
                />
              </Tooltip>
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <SeatLegend />
          </Grid.Col>
        </Grid>

        <Divider my="md" />

        {selectedSeats.length > 0 && (
          <Alert color={MAIN_COLOR} mb="md">
            <Group justify="space-between">
              <Text>
                {selectedSeats.length} seat{selectedSeats.length !== 1 && "s"}{" "}
                selected
              </Text>
              <Text fw={700}>Total: ${totalPrice.toFixed(2)}</Text>
            </Group>
          </Alert>
        )}

        <Paper
          withBorder
          p="xl"
          radius="md"
          bg={isDark ? "dark.7" : "gray.0"}
          ta="center"
          mb="xl"
        >
          <Box mt="xl" mb="xl">
            {sortedRows.map((row) => (
              <Group key={row} gap="xs" mb="xs" justify="center">
                <Text fw={500} size="sm" w={20}>
                  {row}
                </Text>
                {seatsByRow[row]
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selectedSeats.some(
                      (s) => s.id === seat.id
                    );
                    let seatIcon;
                    let color = seat.isAvailable ? "#aaa" : "#555";

                    if (seat.seatType === "Premium") {
                      color = isSelected ? MAIN_COLOR : "#d4af37";
                      seatIcon = <IconArmchair size={24} />;
                    } else if (seat.seatType === "VIP") {
                      color = isSelected ? MAIN_COLOR : "#7a5af5";
                      seatIcon = <IconArmchair2 size={24} />;
                    } else if (seat.seatType === "Accessible") {
                      color = isSelected ? MAIN_COLOR : "#e03131";
                      seatIcon = <IconWheelchair size={24} />;
                    } else {
                      seatIcon = <IconArmchair size={24} />;
                      if (isSelected) color = MAIN_COLOR;
                    }

                    let price = basePrice;
                    if (seat.seatType === "Premium") price *= 1.5;
                    if (seat.seatType === "VIP") price *= 2;

                    return (
                      <Tooltip
                        key={seat.id}
                        label={
                          seat.isAvailable
                            ? `${seat.row}${seat.number} - ${
                                seat.seatType || "Standard"
                              } - $${price.toFixed(2)}`
                            : "Seat not available"
                        }
                        position="top"
                      >
                        <Box
                          onClick={() =>
                            seat.isAvailable ? handleSeatClick(seat) : null
                          }
                          style={{
                            cursor: seat.isAvailable
                              ? "pointer"
                              : "not-allowed",
                            color,
                            transition: "all 0.2s ease",
                            transform: isSelected ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          {seatIcon}
                        </Box>
                      </Tooltip>
                    );
                  })}
              </Group>
            ))}
          </Box>

          <Text
            fw={500}
            mt="xl"
            px="xl"
            py="sm"
            bg={MAIN_COLOR}
            style={{
              borderRadius: "4px",
              color: "white",
            }}
          >
            SCREEN
          </Text>
        </Paper>

        <Group justify="apart">
          <Button
            variant="outline"
            color={MAIN_COLOR}
            onClick={() => navigate(-1)}
            leftSection={<IconAlertCircle size={16} />}
          >
            Go Back
          </Button>
          <Button
            onClick={handleCreateReservation}
            color={MAIN_COLOR}
            leftSection={<IconCheckbox size={16} />}
            loading={reservationInProgress}
            disabled={selectedSeats.length === 0}
          >
            Complete Reservation
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default SeatSelection;
