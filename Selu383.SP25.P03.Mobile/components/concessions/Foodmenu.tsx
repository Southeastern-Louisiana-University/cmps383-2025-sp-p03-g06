import React from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ConcessionItem } from "../../services/api/apiTypes";

interface FoodMenuProps {
  items: ConcessionItem[];
  onSelectItem: (item: ConcessionItem) => void;
}

const FoodMenu = ({ items, onSelectItem }: FoodMenuProps) => (
  <FlatList
    data={items}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.item} onPress={() => onSelectItem(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    )}
  />
);

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#1a1a1a", // darker background
    borderRadius: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  description: {
    color: "#aaaaaa",
  },
  price: {
    marginTop: 4,
    fontWeight: "bold",
    color: "#ffffff",
  },
});


export default FoodMenu;
