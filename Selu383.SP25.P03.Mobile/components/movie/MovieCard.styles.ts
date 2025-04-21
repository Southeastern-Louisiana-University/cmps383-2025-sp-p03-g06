// components/movie/MovieCard.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121212",
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
    marginBottom: 8,
  },
  posterPlaceholder: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: "#333",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#c70036",
    textAlign: "center",
  },
});
