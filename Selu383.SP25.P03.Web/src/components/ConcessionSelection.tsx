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
  const { isAuthenticated, isGuest, guestInfo } = useAuth();

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
      navigate(isAuthenticated ? "/my-reservations" : "/", {
        state: {
          message: isAuthenticated
            ? "Your order has been placed!"
            : "Your order has been placed! You'll receive a confirmation email.",
        },
      });
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

  const handleSkip = () => {
    navigate(isAuthenticated ? "/my-reservations" : "/", {
      state: {
        message: isAuthenticated
          ? "Your reservation is confirmed!"
          : "Your reservation is confirmed! You'll receive a confirmation email.",
      },
    });
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <IconShoppingCart size={24} color="#e03131" />
                <Text
                  style={{ fontWeight: 600, color: "#e03131", marginLeft: 8 }}
                >
                  What tasty treats can we get for you?
                </Text>
              </div>
              {reservation && (
                <Alert color="red" style={{ marginBottom: 16 }} radius={4}>
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
              >
                <Tabs.List>
                  {categories.map((cat) => (
                    <Tabs.Tab key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
              <Grid gutter="lg" style={{ marginTop: 16 }}>
                {items
                  .filter((i) =>
                    activeCategory ? i.categoryId === +activeCategory : true
                  )
                  .map((item) => (
                    <Grid.Col key={item.id} span={{ base: 6, md: 4 }}>
                      <Card
                        style={{
                          backgroundColor: isDark ? "#2a2a2a" : "#fafafa",
                          marginBottom: 16,
                        }}
                      >
                        <Card.Section
                          style={{
                            overflow: "hidden",
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Image
                            src={
                              item.imageUrl
                                ? `/images/food/${item.imageUrl
                                    .split("/")
                                    .pop()
                                    ?.replace(".jpg", "")}.jpg`
                                : undefined
                            }
                            height={120}
                            alt={item.name}
                            fallbackSrc="https://placehold.co/400x200/gray/white?text=Food+Item"
                          />
                        </Card.Section>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontWeight: 500, color: "#fff" }}>
                            {item.name}
                          </Text>
                          <Badge color="red" variant="outline">
                            ${item.price.toFixed(2)}
                          </Badge>
                        </div>
                        <Text
                          style={{
                            color: "#ccc",
                            fontSize: 14,
                            marginBottom: 16,
                          }}
                        >
                          {item.description || "No description available."}
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Button
                              size="sm"
                              variant="light"
                              color="red"
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
                              style={{
                                color: "#fff",
                                fontWeight: 500,
                                margin: "0 8px",
                              }}
                            >
                              {getItemQuantity(item.id)}
                            </Text>
                            <Button
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  getItemQuantity(item.id) + 1
                                )
                              }
                            >
                              <IconPlus size={16} />
                            </Button>
                          </div>
                          {getItemQuantity(item.id) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              color="red"
                              onClick={() => handleQuantityChange(item.id, 0)}
                            >
                              <IconTrash size={14} />
                            </Button>
                          )}
                        </div>
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
                            style={{ marginTop: 8 }}
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
              }}
            >
              <Title order={4} style={{ color: "#fff", marginBottom: 16 }}>
                Your Order
              </Title>
              {cart.length === 0 ? (
                <Text style={{ color: "#ccc" }}>
                  No items yet. Add some popcorn!
                </Text>
              ) : (
                <>
                  {cart.map((ci) => {
                    const item = items.find(
                      (i) => i.id === ci.concessionItemId
                    );
                    if (!item) return null;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>{item.name}</Text>
                        <Badge color="red" style={{ margin: "0 8px" }}>
                          {ci.quantity}×
                        </Badge>
                        <Text style={{ color: "#fff" }}>
                          ${(item.price * ci.quantity).toFixed(2)}
                        </Text>
                      </div>
                    );
                  })}
                  <Divider style={{ borderColor: "#555", margin: "16px 0" }} />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text style={{ color: "#fff", fontWeight: 700 }}>
                      Total:
                    </Text>
                    <Text style={{ color: "#fff", fontWeight: 700 }}>
                      ${calculateTotal().toFixed(2)}
                    </Text>
                  </div>
                </>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 24,
                }}
              >
                <Button
                  variant="outline"
                  color="gray"
                  onClick={handleSkip}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Skip
                </Button>
                <Button
                  color="red"
                  onClick={handleSubmitOrder}
                  loading={orderLoading}
                  leftSection={<IconBrandCashapp size={16} />}
                >
                  {cart.length > 0 ? "Place Order" : "Continue"}
                </Button>
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ConcessionSelection;
