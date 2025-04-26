// src/components/ConcessionSelection.tsx
import { useState, useEffect, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Title,
  Text,
  Button,
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
  Group,
  Stack,
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
  ReservationDTO,
  reservationApi,
  concessionApi,
} from "../services/api";

const ConcessionSelection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const { isGuest, guestInfo } = useAuth();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error("Reservation ID is required");
        const res = await reservationApi.getReservationById(parseInt(id));
        setReservation(res);

        const cats = await concessionApi.getCategories();
        const its = await concessionApi.getItems();
        setCategories(cats);
        setItems(its);
        if (cats.length > 0) setActiveCategory(cats[0].id.toString());
      } catch (err) {
        console.error(err);
        setError("Failed to load concession data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((i) => i.concessionItemId !== itemId));
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
    setCart(
      cart.map((ci) =>
        ci.concessionItemId === itemId
          ? { ...ci, specialInstructions: text }
          : ci
      )
    );
  };

  const getItemQuantity = (itemId: number) =>
    cart.find((ci) => ci.concessionItemId === itemId)?.quantity || 0;

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
      await concessionApi.createOrder({
        reservationId: reservation.id,
        items: cart.map((ci) => ({
          ...ci,
          specialInstructions: specialInstructions[ci.concessionItemId] || "",
        })),
        guestInfo:
          isGuest && guestInfo
            ? {
                email: guestInfo.email,
                phoneNumber: guestInfo.phoneNumber,
              }
            : undefined,
      });
      navigate("/my-reservations");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create your order. Please try again.");
      }
    } finally {
      setOrderLoading(false);
    }
  };


  if (loading) {
    return (
      <Center style={{ margin: "40px 0" }}>
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
          style={{ margin: "20px 0" }}
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
    <Box
      style={{ backgroundColor: "#000", padding: "40px 0", minHeight: "100vh" }}
    >
      <Container size="lg">
        <Title
          order={1}
          style={{
            color: "#fff",
            fontSize: 32,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Add Concessions
        </Title>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
                padding: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              <Group mb={24}>
                <IconShoppingCart size={24} color="#e03131" />
                <Text fw={600} c="#e03131">
                  What tasty treats can we get for you?
                </Text>
              </Group>

              {reservation && (
                <Alert color="red" radius="md" mb={24}>
                  <Text>
                    Seats reserved for "{reservation.movieTitle}" at{" "}
                    {new Date(reservation.showtimeStartTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                    .
                  </Text>
                </Alert>
              )}

              <Tabs
                value={activeCategory}
                onChange={(value: SetStateAction<string | null>) =>
                  setActiveCategory(value)
                }
                mb={24}
              >
                <Tabs.List>
                  {categories.map((cat) => (
                    <Tabs.Tab key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>

              <Grid gutter="lg">
                {items
                  .filter((i) =>
                    activeCategory ? i.categoryId === +activeCategory : true
                  )
                  .map((item) => (
                    <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                      <Card
                        padding="md"
                        radius="md"
                        style={{
                          backgroundColor: isDark ? "#2a2a2a" : "#fafafa",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Card.Section>
                          <Image
                            src={
                              item.imageUrl
                                ? `/images/food/${item.imageUrl
                                    .split("/")
                                    .pop()
                                    ?.replace(".jpg", "")}.jpg`
                                : undefined
                            }
                            height={160}
                            alt={item.name}
                            fallbackSrc="https://placehold.co/400x200/gray/white?text=Food+Item"
                            style={{ objectFit: "cover" }}
                          />
                        </Card.Section>

                        <Group justify="space-between" mt="md" mb="xs">
                          <Text fw={500} c={isDark ? "#fff" : "#000"} size="lg">
                            {item.name}
                          </Text>
                          <Badge color="red" variant="filled" size="lg">
                            ${item.price.toFixed(2)}
                          </Badge>
                        </Group>

                        <Text c="dimmed" size="sm" mb="md" style={{ flex: 1 }}>
                          {item.description || "No description available."}
                        </Text>

                        <Group justify="space-between" align="center">
                          <Group gap="xs">
                            <Button
                              size="sm"
                              variant="filled"
                              color="red"
                              radius="md"
                              style={{
                                width: 32,
                                height: 32,
                                padding: 0,
                              }}
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  Math.max(0, getItemQuantity(item.id) - 1)
                                )
                              }
                            >
                              <IconMinus size={16} />
                            </Button>
                            <Text
                              fw={500}
                              w={30}
                              ta="center"
                              c={isDark ? "#fff" : "#000"}
                            >
                              {getItemQuantity(item.id)}
                            </Text>
                            <Button
                              size="sm"
                              variant="filled"
                              color="red"
                              radius="md"
                              style={{
                                width: 32,
                                height: 32,
                                padding: 0,
                              }}
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  getItemQuantity(item.id) + 1
                                )
                              }
                            >
                              <IconPlus size={16} />
                            </Button>
                          </Group>

                          {getItemQuantity(item.id) > 0 && (
                            <Button
                              size="sm"
                              variant="subtle"
                              color="red"
                              radius="md"
                              onClick={() => handleQuantityChange(item.id, 0)}
                              style={{
                                width: 32,
                                height: 32,
                                padding: 0,
                              }}
                            >
                              <IconTrash size={16} />
                            </Button>
                          )}
                        </Group>

                        {getItemQuantity(item.id) > 0 && (
                          <TextInput
                            placeholder="Special instructions..."
                            value={specialInstructions[item.id] || ""}
                            onChange={(e) =>
                              handleSpecialInstructionsChange(
                                item.id,
                                e.currentTarget.value
                              )
                            }
                            mt="md"
                            size="sm"
                            radius="md"
                          />
                        )}
                      </Card>
                    </Grid.Col>
                  ))}
              </Grid>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
                padding: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                borderRadius: 8,
                position: "sticky",
                top: 24,
              }}
            >
              <Title order={4} c={isDark ? "#fff" : "#000"} mb="xl">
                Your Order
              </Title>

              {cart.length === 0 ? (
                <Text c="dimmed" ta="center" mb="xl">
                  No items yet. Add some popcorn!
                </Text>
              ) : (
                <Stack gap="md">
                  {cart.map((ci) => {
                    const item = items.find(
                      (i) => i.id === ci.concessionItemId
                    );
                    if (!item) return null;
                    return (
                      <Group
                        key={item.id}
                        justify="space-between"
                        wrap="nowrap"
                        align="center"
                      >
                        <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                          <Text c={isDark ? "#fff" : "#000"} lineClamp={1}>
                            {item.name}
                          </Text>
                          <Group gap={4}>
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              p={0}
                              style={{ minWidth: 22, height: 22 }}
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  Math.max(0, getItemQuantity(item.id) - 1)
                                )
                              }
                            >
                              <IconMinus size={12} />
                            </Button>
                            <Badge color="red" variant="light">
                              {ci.quantity}×
                            </Badge>
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              p={0}
                              style={{ minWidth: 22, height: 22 }}
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  getItemQuantity(item.id) + 1
                                )
                              }
                            >
                              <IconPlus size={12} />
                            </Button>
                          </Group>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <Text c={isDark ? "#fff" : "#000"} fw={500}>
                            ${(item.price * ci.quantity).toFixed(2)}
                          </Text>
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            p={0}
                            style={{ minWidth: 22, height: 22 }}
                            onClick={() => handleQuantityChange(item.id, 0)}
                          >
                            <IconTrash size={12} />
                          </Button>
                        </Group>
                      </Group>
                    );
                  })}

                  <Divider my="md" />

                  <Group justify="space-between">
                    <Text c={isDark ? "#fff" : "#000"} fw={700} size="lg">
                      Total:
                    </Text>
                    <Text c={isDark ? "#fff" : "#000"} fw={700} size="lg">
                      ${calculateTotal().toFixed(2)}
                    </Text>
                  </Group>
                </Stack>
              )}

              <Button
                color="red"
                onClick={handleSubmitOrder}
                loading={orderLoading}
                leftSection={<IconBrandCashapp size={16} />}
                fullWidth
                size="lg"
                mt="xl"
              >
                {cart.length > 0 ? "Place Order" : "Continue to My Tickets"}
              </Button>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ConcessionSelection;
