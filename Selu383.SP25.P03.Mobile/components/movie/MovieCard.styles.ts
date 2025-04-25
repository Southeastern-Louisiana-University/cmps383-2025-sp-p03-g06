// components/movie/MovieCard.styles.ts
// #c70036 is the brand color
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const cardMargin = 8;
const cardWidth = (screenWidth - cardMargin * 3) / 2; // fits 2 cards with margin

export const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
    marginHorizontal: cardMargin,
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 5, 
    paddingHorizontal: 1, 
  },
  poster: {
    width: "100%",
    height: undefined,
    aspectRatio: 2 / 3, 
    maxHeight: 200,
    resizeMode: "cover",
    borderRadius: 6,
  },
  posterPlaceholder: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#c70036",
    textAlign: "center",
    marginTop: 6,
  },
  rating: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginTop: 2,
  },
});
