// app/(tabs)/concessions.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import FoodMenu from "../../components/concessions/Foodmenu";
import Cart from "../../components/concessions/cart";
import {
  ConcessionItem,
  CreateConcessionOrder,
} from "../../services/api/apiTypes";
import { CartItem } from "../../types/cartTypes";
import { concessionsApi, ordersApi } from "../../services/api";

interface RouteParams {
  showtimeId?: number;
}

const ConcessionsScreen: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const showtimeId = params?.showtimeId;

  const [items, setItems] = useState<ConcessionItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [seatNumber, setSeatNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    concessionsApi
      .getAvailableItems()
      .then(setItems)
      .catch((err) => {
        console.error("Failed to load concession items:", err);
        setError("Unable to load menu items. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectItem = (item: ConcessionItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (item: CartItem) => {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      )
    );
  };

  const decreaseQuantity = (item: CartItem) => {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.id === item.id && ci.quantity > 1
          ? { ...ci, quantity: ci.quantity - 1 }
          : ci
      )
    );
  };

  const removeItem = (item: CartItem) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== item.id));
  };

  const placeOrder = async () => {
    if (!seatNumber.trim()) {
      Alert.alert("Missing Information", "Please enter your seat number.");
      return;
    }

    const order: CreateConcessionOrder = {
      reservationId: showtimeId ?? 0,
      seatNumber,
      items: cartItems.map((item) => ({
        concessionItemId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      setLoading(true);
      await ordersApi.createOrder(order);
      Alert.alert(
        "Order Successful",
        `Your order has been placed and will be delivered to seat ${seatNumber}.`
      );
      setCartItems([]);
      setSeatNumber("");
    } catch (err) {
      console.error("Failed to place order:", err);
      Alert.alert(
        "Order Failed",
        "Unable to place your order. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#c70036" />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={() => concessionsApi.getAvailableItems().then(setItems)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Concessions{showtimeId ? ` for Show #${showtimeId}` : ""}
      </Text>

      <FoodMenu items={items} onSelectItem={handleSelectItem} />

      {cartItems.length > 0 ? (
        <>
          <Cart
            items={cartItems}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onRemove={removeItem}
          />

          <View style={styles.checkoutSection}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <TextInput
              placeholder="Enter seat number (e.g., C12)"
              value={seatNumber}
              onChangeText={setSeatNumber}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <Button
              title={loading ? "Processing..." : "Place Order"}
              onPress={placeOrder}
              disabled={loading}
              color="#c70036"
            />
          </View>
        </>
      ) : (
        <Text style={styles.emptyCartText}>
          Your cart is empty. Add items from the menu to get started.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ffffff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#aaaaaa",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 15,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#aaaaaa",
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
  checkoutSection: {
    marginBottom: 30,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
  },
  input: {
    marginVertical: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
    fontSize: 16,
    color: "#ffffff",
  },
});

export default ConcessionsScreen;
