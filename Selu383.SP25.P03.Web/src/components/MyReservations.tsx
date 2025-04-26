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
  useMantineColorScheme,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconTicket,
  IconCalendarEvent,
  IconClock,
  IconTheater,
  IconCurrencyDollar,
  IconQrcode,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import TicketLookupModal from "./TicketLookupModal";

// You'll need to add these types and API methods to your services/api.ts file
import {
  reservationApi,
  concessionApi,
  ReservationDTO,
  ConcessionOrderDTO,
} from "../services/api";

const MyReservations = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const [
    ticketLookupOpened,
    { open: openTicketLookup, close: closeTicketLookup },
  ] = useDisclosure(false);

  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [concessionOrders, setConcessionOrders] = useState<
    Record<number, ConcessionOrderDTO[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationApi.getMyReservations();
        setReservations(data);

        // Fetch concession orders for each reservation
        const ordersMap: Record<number, ConcessionOrderDTO[]> = {};
        for (const reservation of data) {
          try {
            const orders = await concessionApi.getOrdersByReservation(
              reservation.id
            );
            ordersMap[reservation.id] = orders;
          } catch (error) {
            console.error(
              `Failed to fetch concession orders for reservation ${reservation.id}:`,
              error
            );
          }
        }
        setConcessionOrders(ordersMap);
      } catch (error) {
        setError("Failed to fetch your reservations");
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated || isGuest) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isGuest]);

  // Handle opening ticket lookup modal when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isGuest && !loading) {
      openTicketLookup();
    }
  }, [isAuthenticated, isGuest, loading]);

  const handleCancelReservation = async (id: number) => {
    try {
      await reservationApi.cancelReservation(id);
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

  if (loading) {
    return (
      <Center my="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
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

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            mb="xl"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

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
          <div>
            {reservations.map((reservation) => {
              const showtime = new Date(reservation.showtimeStartTime);
              const isPast = showtime <= new Date();
              const isCancelled = reservation.status === "Cancelled";

              return (
                <Card
                  key={reservation.id}
                  withBorder
                  mb="md"
                  padding="lg"
                  radius="md"
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="lg">
                      {reservation.movieTitle}
                    </Text>
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
                      {isCancelled
                        ? "Cancelled"
                        : isPast
                        ? "Past"
                        : "Confirmed"}
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
                    <Text size="sm">
                      Total: ${reservation.totalPrice.toFixed(2)}
                    </Text>
                  </Group>

                  {/* Display Concession Orders */}
                  {concessionOrders[reservation.id]?.length > 0 && (
                    <>
                      <Divider
                        my="md"
                        label={
                          <Group gap={4}>
                            <IconShoppingCart size={16} />
                            <Text size="sm">Concession Orders</Text>
                          </Group>
                        }
                      />
                      <Stack gap="xs">
                        {concessionOrders[reservation.id].map((order) => (
                          <Card
                            key={order.id}
                            withBorder
                            radius="sm"
                            padding="xs"
                          >
                            <Group justify="apart" mb={4}>
                              <Text size="sm" fw={500}>
                                Order #{order.id}
                              </Text>
                              <Badge
                                color={
                                  order.status === "Delivered"
                                    ? "green"
                                    : order.status === "Cancelled"
                                    ? "red"
                                    : "yellow"
                                }
                                size="sm"
                              >
                                {order.status}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">
                              Ordered:{" "}
                              {new Date(order.orderTime).toLocaleString()}
                            </Text>
                            <Divider my="xs" />
                            {order.items.map((item) => (
                              <Group key={item.id} justify="apart" mb={2}>
                                <Text size="sm">
                                  {item.quantity}x {item.itemName}
                                </Text>
                                <Text size="sm">
                                  ${(item.quantity * item.unitPrice).toFixed(2)}
                                </Text>
                              </Group>
                            ))}
                            <Divider my="xs" />
                            <Group justify="apart">
                              <Text size="sm" fw={500}>
                                Total:
                              </Text>
                              <Text size="sm" fw={500}>
                                ${order.totalPrice.toFixed(2)}
                              </Text>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </>
                  )}

                  {!isCancelled && (
                    <>
                      <Divider my="md" />

                      <Group justify="apart">
                        {!isPast && (
                          <Button
                            variant="outline"
                            color="red"
                            size="xs"
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                          >
                            Cancel
                          </Button>
                        )}

                        <Group>
                          <Button
                            variant="light"
                            color={isDark ? "yellow" : "green"}
                            rightSection={<IconQrcode size={16} />}
                            size="xs"
                            onClick={() => handleViewTicket(reservation.id)}
                          >
                            View Ticket
                          </Button>

                          {/* Add concessions button - only show if within valid time window */}
                          {!isPast && (
                            <Button
                              variant="light"
                              color={isDark ? "yellow" : "green"}
                              size="xs"
                              onClick={() =>
                                navigate(`/concessions/${reservation.id}`)
                              }
                            >
                              Add Concessions
                            </Button>
                          )}
                        </Group>
                      </Group>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      <TicketLookupModal
        opened={ticketLookupOpened}
        onClose={closeTicketLookup}
      />
    </>
  );
};

export default MyReservations;
