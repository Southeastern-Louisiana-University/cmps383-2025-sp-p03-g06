// src/components/ConcessionSelection.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Grid,
  Card,
  Image,
  Badge,
  Divider,
  Alert,
  Loader,
  Center,
  Tabs,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconShoppingCart,
  IconArrowLeft,
  IconPlus,
  IconMinus,
  IconTrash,
  IconBrandCashapp,
} from "@tabler/icons-react";

import { useAuth } from "../contexts/AuthContext";

import {
  ConcessionItemDTO,
  ConcessionCategoryDTO,
  CreateOrderItemDTO,
  reservationApi,
  ReservationDTO,
} from "../services/api";
import { concessionApi } from "../services/api";

const ConcessionSelection = () => {
  const { id } = useParams<{ id: string }>(); // Reservation ID
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const { isAuthenticated, isGuest } = useAuth();

  const [reservation, setReservation] = useState<ReservationDTO | null>(null);
  const [categories, setCategories] = useState<ConcessionCategoryDTO[]>([]);
  const [items, setItems] = useState<ConcessionItemDTO[]>([]);
  const [cart, setCart] = useState<CreateOrderItemDTO[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Store information about whether this is a guest checkout flow
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  useEffect(() => {
    const fetchReservationAndConcessions = async () => {
      try {
        if (!id) throw new Error("Reservation ID is required");

        // Instead of checking authentication, just try to fetch the reservation
        try {
          const reservationData = await reservationApi.getReservationById(
            parseInt(id)
          );
          setReservation(reservationData);

          // If we successfully got the reservation as a guest, note this
          if (!isAuthenticated) {
            setIsGuestCheckout(true);
          }

          // Fetch concession data regardless of authentication status
          const categoriesData = await concessionApi.getCategories();
          const itemsData = await concessionApi.getItems();

          setCategories(categoriesData);
          setItems(itemsData);
          if (categoriesData.length > 0) {
            setActiveCategory(categoriesData[0].id.toString());
          }
        } catch (err) {
          // If we can't fetch the reservation, redirect to login
          // but only if the user isn't authenticated
          console.error("Error fetching reservation:", err);
          if (!isAuthenticated && !isGuest) {
            navigate("/login", {
              state: { redirectTo: `/concessions/${id}` },
            });
            return;
          }
          throw err;
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load concession data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationAndConcessions();
  }, [id, isAuthenticated, isGuest, navigate]);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((item) => item.concessionItemId !== itemId));
      return;
    }
    const existing = cart.find((i) => i.concessionItemId === itemId);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.concessionItemId === itemId ? { ...i, quantity } : i
        )
      );
    } else {
      setCart([...cart, { concessionItemId: itemId, quantity }]);
    }
  };

  const handleSpecialInstructionsChange = (itemId: number, text: string) => {
    setSpecialInstructions({ ...specialInstructions, [itemId]: text });
    const idx = cart.findIndex((i) => i.concessionItemId === itemId);
    if (idx >= 0) {
      const updated = [...cart];
      updated[idx] = { ...updated[idx], specialInstructions: text };
      setCart(updated);
    }
  };

  const getItemQuantity = (itemId: number) => {
    const item = cart.find((i) => i.concessionItemId === itemId);
    return item ? item.quantity : 0;
  };

  const calculateTotal = () =>
    cart.reduce((sum, ci) => {
      const item = items.find((i) => i.id === ci.concessionItemId);
      return item ? sum + item.price * ci.quantity : sum;
    }, 0);

  const handleSubmitOrder = async () => {
    if (!reservation) return;
    if (cart.length === 0) {
      navigate("/my-reservations");
      return;
    }

    setOrderLoading(true);
    setError(null);
    try {
      const finalCart = cart.map((ci) => ({
        ...ci,
        specialInstructions: specialInstructions[ci.concessionItemId] || "",
      }));

      await concessionApi.createOrder({
        reservationId: reservation.id,
        items: finalCart,
      });

      // If it's a guest checkout, we can't redirect to "my-reservations"
      if (isGuestCheckout) {
        navigate("/", {
          state: {
            message:
              "Your order has been placed! You'll receive a confirmation email.",
          },
        });
      } else {
        navigate("/my-reservations");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to create your order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSkip = () => {
    // If it's a guest checkout, we can't redirect to "my-reservations"
    if (isGuestCheckout) {
      navigate("/", {
        state: {
          message:
            "Your reservation is confirmed! You'll receive a confirmation email.",
        },
      });
    } else {
      navigate("/my-reservations");
    }
  };

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
        <Button
          onClick={() => navigate(-1)}
          leftSection={<IconArrowLeft size={16} />}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="md" ta="center">
        Add Concessions
      </Title>

      <Paper shadow="sm" p="lg" radius="md" withBorder mb="xl">
        <Group mb="md">
          <IconShoppingCart size={20} />
          <Text fw={500}>
            Would you like to add food and drinks to your order?
          </Text>
        </Group>

        {reservation && (
          <Alert color="red" mb="md">
            <Text>
              Your seats for "{reservation.movieTitle}" at{" "}
              {new Date(reservation.showtimeStartTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              have been reserved.
            </Text>
          </Alert>
        )}

        <Tabs value={activeCategory} onChange={setActiveCategory}>
          <Tabs.List mb="md">
            {categories.map((cat) => (
              <Tabs.Tab key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Grid gutter="md">
            {items
              .filter((i) =>
                activeCategory ? i.categoryId === +activeCategory : true
              )
              .map((item) => (
                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    {item.imageUrl && (
                      <Card.Section>
                        <Image
                          src={item.imageUrl}
                          height={120}
                          alt={item.name}
                          fallbackSrc="https://placehold.co/400x200/gray/white?text=Food+Item"
                        />
                      </Card.Section>
                    )}

                    <Group justify="apart" mt="md" mb="xs">
                      <Text fw={500}>{item.name}</Text>
                      <Badge color={isDark ? "secondary" : "primary"}>
                        ${item.price.toFixed(2)}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                      {item.description || "No description available"}
                    </Text>

                    <Group justify="apart" mt="md">
                      <Group>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              Math.max(0, getItemQuantity(item.id) - 1)
                            )
                          }
                          leftSection={<IconMinus size={14} />}
                        />
                        <Text fw={500}>{getItemQuantity(item.id)}</Text>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              getItemQuantity(item.id) + 1
                            )
                          }
                          leftSection={<IconPlus size={14} />}
                        />
                      </Group>

                      {getItemQuantity(item.id) > 0 && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          onClick={() => handleQuantityChange(item.id, 0)}
                          leftSection={<IconTrash size={14} />}
                        >
                          Remove
                        </Button>
                      )}
                    </Group>

                    {getItemQuantity(item.id) > 0 && (
                      <TextInput
                        mt="xs"
                        size="xs"
                        placeholder="Any special instructions?"
                        value={specialInstructions[item.id] || ""}
                        onChange={(e) =>
                          handleSpecialInstructionsChange(
                            item.id,
                            e.currentTarget.value
                          )
                        }
                      />
                    )}
                  </Card>
                </Grid.Col>
              ))}
          </Grid>
        </Tabs>
      </Paper>

      <Paper shadow="sm" p="lg" radius="md" withBorder mb="xl">
        <Title order={4} mb="md">
          Your Order Summary
        </Title>

        {cart.length === 0 ? (
          <Text c="dimmed" mb="md">
            Your cart is empty. Add items from the categories above.
          </Text>
        ) : (
          <>
            {cart.map((ci) => {
              const item = items.find((i) => i.id === ci.concessionItemId);
              if (!item) return null;
              return (
                <Paper key={item.id} p="xs" mb="xs" withBorder>
                  <Group justify="apart">
                    <Group>
                      <Text>{item.name}</Text>
                      <Badge>{ci.quantity}×</Badge>
                    </Group>
                    <Text>${(item.price * ci.quantity).toFixed(2)}</Text>
                  </Group>
                  {specialInstructions[item.id] && (
                    <Text size="xs" c="dimmed" ml="md">
                      Note: {specialInstructions[item.id]}
                    </Text>
                  )}
                </Paper>
              );
            })}

            <Divider my="md" />

            <Group justify="apart">
              <Text fw={700}>Total:</Text>
              <Text fw={700}>${calculateTotal().toFixed(2)}</Text>
            </Group>
          </>
        )}
      </Paper>

      <Group justify="apart">
        <Button
          variant="outline"
          onClick={handleSkip}
          leftSection={<IconArrowLeft size={16} />}
        >
          Skip Concessions
        </Button>
        <Button
          onClick={handleSubmitOrder}
          color={isDark ? "secondary" : "primary"}
          loading={orderLoading}
          leftSection={<IconBrandCashapp size={16} />}
        >
          {cart.length > 0 ? "Add to My Order" : "Continue"}
        </Button>
      </Group>
    </Container>
  );
};

export default ConcessionSelection;
