// src/components/SeatSelection.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Modal,
  TextInput,
  Checkbox,
  Stack,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconMovie,
  IconTheater,
  IconClock,
  IconTicket,
  IconArmchair,
  IconArmchair2,
  IconWheelchair,
  IconInfoCircle,
  IconCheckbox,
  IconArrowLeft,
  IconX,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { modals } from "@mantine/modals";
import LoginSignupModal from "./LoginSignupModal";
import {
  showtimeApi,
  reservationApi,
  seatApi,
  ShowtimeDTO,
  SeatDTO,
  GuestUserInfo,
  CreateReservationRequest,
  ApiError,
} from "../services/api";

// Main color for the application
const MAIN_COLOR = "#c70036";

// Add the XOverlay component
const XOverlay = () => (
  <Box
    style={{
      position: "absolute",
      top: "-2px",
      left: "-2px",
      width: "calc(100% + 4px)",
      height: "calc(100% + 4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
    }}
  >
    <IconX size={28} color="#e03131" stroke={2.5} />
  </Box>
);

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
const SeatLegend = () => (
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

const SeatSelection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, createGuestSession } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [initialView, setInitialView] = useState<"login" | "signup">("login");

  const [showtime, setShowtime] = useState<ShowtimeDTO | null>(null);
  const [seats, setSeats] = useState<SeatDTO[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationInProgress, setReservationInProgress] = useState(false);

  // Guest checkout state
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [processingGuest, setProcessingGuest] = useState(false);

  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      if (!id) return;

      try {
        const showtimeData = await showtimeApi.getShowtimeById(parseInt(id));
        setShowtime(showtimeData);
        console.log("Fetched showtime:", showtimeData);

        const seatsData = await seatApi.getSeatsByRoomId(
          showtimeData.theaterRoomId
        );
        console.log("Fetched seats:", seatsData);

        // Seed some seats as unavailable for demonstration
        const seededSeats = seatsData.map((seat) => {
          // Make specific seats unavailable
          if (
            // Middle section of row C
            (seat.row === "C" && seat.number >= 4 && seat.number <= 8) ||
            // A couple of VIP seats in row A
            (seat.row === "A" && (seat.number === 3 || seat.number === 4)) ||
            // Some premium seats in row B
            (seat.row === "B" && (seat.number === 5 || seat.number === 6)) ||
            // One accessible seat
            (seat.seatType === "Accessible" && seat.row === "D")
          ) {
            return { ...seat, isAvailable: false };
          }
          return seat;
        });
        console.log("Seeded seats:", seededSeats);

        // Add different seat types for demonstration
        const enhancedSeats = seededSeats.map((seat) => {
          if (seat.row === "A") {
            return { ...seat, seatType: "VIP" };
          }
          if (seat.row === "B") {
            return { ...seat, seatType: "Premium" };
          }
          if (seat.row === "D" && (seat.number === 1 || seat.number === 12)) {
            return { ...seat, seatType: "Accessible" };
          }
          return seat;
        });
        console.log("Enhanced seats:", enhancedSeats);

        setSeats(enhancedSeats);
      } catch (error) {
        console.error("Error fetching showtime/seats:", error);
        setError("Failed to fetch showtime information");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeAndSeats();
  }, [id]);

  const handleSeatClick = (seat: SeatDTO) => {
    if (!seat.isAvailable) return;
    console.log("Clicked seat:", seat);

    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      const newSeats = exists
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat];
      console.log("Updated selected seats:", newSeats);
      return newSeats;
    });
  };

  const processReservation = async (guestInfo?: GuestUserInfo) => {
    try {
      setReservationInProgress(true);
      setError(null);

      if (!showtime) {
        throw new Error("Showtime information is missing");
      }

      const reservationData: CreateReservationRequest = {
        showtimeId: showtime.id,
        seatIds: selectedSeats.map((seat) => seat.id),
        ...(guestInfo && { guestInfo }),
      };

      const created = await reservationApi.createReservation(reservationData);

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
                  navigate(`/concessions/${created.id}`);
                }}
              >
                Add Food & Drinks
              </Button>
            </Group>
          </>
        ),
        onClose: () => {
          navigate(`/concessions/${created.id}`);
        },
      });
    } catch (error) {
      console.error("Error creating reservation:", error);

      if (error instanceof ApiError && error.message) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create reservation. Please try again.");
      }
    } finally {
      setReservationInProgress(false);
    }
  };

  const handleCompleteReservation = () => {
    if (isAuthenticated) {
      processReservation();
    } else {
      modals.open({
        title: <Text fw={700}>Complete Your Reservation</Text>,
        centered: true,
        size: "md",
        children: (
          <Stack>
            <Text size="sm" c="dimmed" mb="md">
              Choose how you'd like to proceed with your reservation
            </Text>

            <Button
              fullWidth
              color="red"
              onClick={() => {
                modals.closeAll();
                setInitialView("login");
                openModal();
              }}
              mb="sm"
            >
              Sign In
            </Button>

            <Button
              fullWidth
              variant="outline"
              color="red"
              onClick={() => {
                modals.closeAll();
                setInitialView("signup");
                openModal();
              }}
              mb="sm"
            >
              Create an Account
            </Button>

            <Divider
              label={
                <Text size="sm" c="dimmed">
                  OR
                </Text>
              }
              labelPosition="center"
              my="sm"
            />

            <Button
              fullWidth
              variant="subtle"
              color="gray"
              onClick={() => {
                modals.closeAll();
                setGuestModalOpen(true);
              }}
            >
              Continue as Guest
            </Button>
          </Stack>
        ),
      });
    }
  };

  const handleGuestCheckout = async () => {
    if (!guestEmail) {
      setError("Email is required");
      return;
    }
    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setProcessingGuest(true);
    try {
      // spin up a guest session so ProtectedRoute/MyReservations will work
      await createGuestSession(guestEmail, guestPhone);
      // now reserve seats just like a logged-in user
      await processReservation({ email: guestEmail, phoneNumber: guestPhone });
      setGuestModalOpen(false);
    } catch (error) {
      console.error("Guest checkout failed:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to process guest checkout. Please try again.");
      }
    } finally {
      setProcessingGuest(false);
    }
  };

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" color={MAIN_COLOR} />
      </Center>
    );
  }

  if (error && !showtime) {
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
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftSection={<IconArrowLeft size={16} />}
        >
          Go Back
        </Button>
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
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftSection={<IconArrowLeft size={16} />}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const seatsByRow = groupSeatsByRow(seats);
  const sortedRows = Object.keys(seatsByRow).sort().reverse();
  const basePrice = showtime.baseTicketPrice;
  const totalPrice = selectedSeats.reduce((total, seat) => {
    let price = basePrice;
    if (seat.seatType === "Premium") price *= 1.5;
    if (seat.seatType === "VIP") price *= 2;
    return total + price;
  }, 0);

  return (
    <>
      <Container size="xl" py="xl">
        {/* Main reservation UI */}
        <Paper
          shadow="sm"
          p="xl"
          radius="md"
          withBorder
          mb="xl"
          style={{ borderTop: `3px solid ${MAIN_COLOR}` }}
        >
          <Title order={3} mb="md">
            Select Your Seats
          </Title>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              mb="md"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          )}

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
                  {selectedSeats.length} seat
                  {selectedSeats.length !== 1 && "s"} selected
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
                      let color = seat.isAvailable ? "#aaa" : "#555";
                      let seatIcon = <IconArmchair size={24} />;
                      if (seat.seatType === "Premium") {
                        seatIcon = <IconArmchair size={24} />;
                        color = isSelected ? MAIN_COLOR : "#d4af37";
                      }
                      if (seat.seatType === "VIP") {
                        seatIcon = <IconArmchair2 size={24} />;
                        color = isSelected ? MAIN_COLOR : "#7a5af5";
                      }
                      if (seat.seatType === "Accessible") {
                        seatIcon = <IconWheelchair size={24} />;
                        color = isSelected ? MAIN_COLOR : "#e03131";
                      }
                      if (!seat.isAvailable) {
                        color = "#555";
                      }
                      if (seat.isAvailable && isSelected) {
                        color = MAIN_COLOR;
                      }

                      return (
                        <Tooltip
                          key={seat.id}
                          label={
                            seat.isAvailable
                              ? `${seat.row}${seat.number} - ${
                                  seat.seatType || "Standard"
                                } - $${(seat.seatType === "Premium"
                                  ? basePrice * 1.5
                                  : seat.seatType === "VIP"
                                  ? basePrice * 2
                                  : basePrice
                                ).toFixed(2)}`
                              : "Seat not available"
                          }
                          position="top"
                        >
                          <Box
                            onClick={() =>
                              seat.isAvailable && handleSeatClick(seat)
                            }
                            style={{
                              cursor: seat.isAvailable
                                ? "pointer"
                                : "not-allowed",
                              color,
                              transform: isSelected ? "scale(1.1)" : "scale(1)",
                              transition: "all 0.2s ease",
                              position: "relative",
                            }}
                          >
                            {seatIcon}
                            {!seat.isAvailable && <XOverlay />}
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
              style={{ borderRadius: "4px", color: "white" }}
            >
              SCREEN
            </Text>
          </Paper>

          <Group justify="space-between">
            <Button
              variant="outline"
              color={MAIN_COLOR}
              onClick={() => navigate(-1)}
              leftSection={<IconArrowLeft size={16} />}
            >
              Go Back
            </Button>
            <Button
              fullWidth
              color="red"
              size="lg"
              onClick={handleCompleteReservation}
              disabled={selectedSeats.length === 0 || reservationInProgress}
              loading={reservationInProgress}
              mt="xl"
            >
              {reservationInProgress
                ? "Processing..."
                : `Complete Reservation (${
                    selectedSeats.length
                  } seats - $${totalPrice.toFixed(2)})`}
            </Button>
          </Group>
        </Paper>

        {/* Guest Checkout Modal */}
        <Modal
          opened={guestModalOpen}
          onClose={() => setGuestModalOpen(false)}
          title="Continue as Guest"
          centered
        >
          <Stack>
            <Text size="sm">
              Enter your contact information to continue as a guest:
            </Text>

            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />

            <TextInput
              label="Phone Number (Optional)"
              placeholder="(123) 456-7890"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />

            <Checkbox
              label="I agree to the terms and conditions"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />

            {error && (
              <Alert
                color="red"
                title="Error"
                withCloseButton
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Group>
              <Button
                variant="outline"
                onClick={() => setGuestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color={MAIN_COLOR}
                onClick={handleGuestCheckout}
                loading={processingGuest}
                disabled={!guestEmail || !agreeToTerms}
              >
                Continue as Guest
              </Button>
            </Group>

            <Divider my="sm" />

            <Text size="sm" ta="center">
              Already have an account?{" "}
              <Anchor component={Link} to="/login">
                Log in
              </Anchor>
            </Text>
          </Stack>
        </Modal>
      </Container>
      <LoginSignupModal
        opened={modalOpened}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          processReservation();
        }}
        initialView={initialView}
      />
    </>
  );
};

export default SeatSelection;
