// components/movie/MovieCard.styles.ts
// #c70036 is the brand color
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  poster: {
    width: 100,
    height: 150,
    marginRight: 12,
    borderRadius: 4,
  },
  posterPlaceholder: {
    width: 100,
    height: 150,
    marginRight: 12,
    backgroundColor: "#333",
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c70036", // brand color
    marginBottom: 4,
  },
});
