import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { CartItem } from "../../types/cartTypes";

interface CartProps {
  items: CartItem[];
  onIncrease: (item: CartItem) => void;
  onDecrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
}

const Cart = ({ items, onIncrease, onDecrease, onRemove }: CartProps) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Order</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={{ color: "#ffffff" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onDecrease(item)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onIncrease(item)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.removeButton]}
                onPress={() => onRemove(item)}
              >
                <Text style={styles.buttonText}>�</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a", // dark background
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#ffffff",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#ffffff",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  removeButton: {
    backgroundColor: "#c70036",
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 5,
    minWidth: 25,
    textAlign: "center",
    color: "#ffffff",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});


export default Cart;
