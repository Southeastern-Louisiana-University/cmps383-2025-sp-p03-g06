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

import {
  concessionApi,
  ConcessionItemDTO,
  ConcessionCategoryDTO,
  CreateOrderItemDTO,
  reservationApi,
  ReservationDTO,
} from "../services/api";

const ConcessionSelection = () => {
  const { id } = useParams<{ id: string }>(); // Reservation ID
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

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

  // Fetch reservation, categories, and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error("Reservation ID is required");

        const [reservationData, categoriesData, itemsData] = await Promise.all([
          reservationApi.getReservationById(parseInt(id)),
          concessionApi.getCategories(),
          concessionApi.getItems(),
        ]);

        setReservation(reservationData);
        setCategories(categoriesData);
        setItems(itemsData);

        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load concession data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((item) => item.concessionItemId !== itemId));
      return;
    }

    const existingItem = cart.find((item) => item.concessionItemId === itemId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.concessionItemId === itemId ? { ...item, quantity } : item
        )
      );
    } else {
      setCart([...cart, { concessionItemId: itemId, quantity }]);
    }
  };

  const handleSpecialInstructionsChange = (itemId: number, text: string) => {
    setSpecialInstructions({
      ...specialInstructions,
      [itemId]: text,
    });

    // Update cart item if it exists
    const existingItemIndex = cart.findIndex(
      (item) => item.concessionItemId === itemId
    );
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        specialInstructions: text,
      };
      setCart(updatedCart);
    }
  };

  const getItemQuantity = (itemId: number): number => {
    const item = cart.find((item) => item.concessionItemId === itemId);
    return item ? item.quantity : 0;
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, cartItem) => {
      const item = items.find((i) => i.id === cartItem.concessionItemId);
      if (item) {
        return total + item.price * cartItem.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!reservation) return;
    if (cart.length === 0) {
      // Skip concessions
      navigate(`/my-reservations`);
      return;
    }

    setOrderLoading(true);
    setError(null);

    try {
      // Update cart items with special instructions
      const finalCart = cart.map((item) => ({
        ...item,
        specialInstructions: specialInstructions[item.concessionItemId] || "",
      }));

      // Create the order
      await concessionApi.createOrder({
        reservationId: reservation.id,
        items: finalCart,
      });

      // Navigate to reservations page
      navigate(`/my-reservations`);
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create your order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/my-reservations`);
  };

  const filteredItems = activeCategory
    ? items.filter((item) => item.categoryId === parseInt(activeCategory))
    : items;

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
            {categories.map((category) => (
              <Tabs.Tab key={category.id} value={category.id.toString()}>
                {category.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Grid gutter="md">
            {filteredItems.map((item) => (
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
                        handleSpecialInstructionsChange(item.id, e.target.value)
                      }
                    />
                  )}
                </Card>
              </Grid.Col>
            ))}

            {filteredItems.length === 0 && (
              <Grid.Col span={12}>
                <Text ta="center" c="dimmed">
                  No items available in this category
                </Text>
              </Grid.Col>
            )}
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
            {cart.map((cartItem) => {
              const item = items.find(
                (i) => i.id === cartItem.concessionItemId
              );
              if (!item) return null;

              return (
                <Paper key={item.id} p="xs" mb="xs" withBorder>
                  <Group justify="apart">
                    <Group>
                      <Text>{item.name}</Text>
                      <Badge>{cartItem.quantity}x</Badge>
                    </Group>
                    <Text>${(item.price * cartItem.quantity).toFixed(2)}</Text>
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
