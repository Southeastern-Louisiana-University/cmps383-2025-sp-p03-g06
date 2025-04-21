// components/movie/MovieCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "./MovieCard.styles";
import { Movie } from "@/services/api/moviesApi";

interface Props {
  movie: Movie;
  onPress: () => void;
}

const MovieCard: React.FC<Props> = ({ movie, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {movie.posterImageUrl ? (
      <Image source={{ uri: movie.posterImageUrl }} style={styles.poster} />
    ) : (
      <View style={styles.posterPlaceholder} />
    )}
    <Text style={styles.title}>{movie.title}</Text>
  </TouchableOpacity>
);

export default MovieCard;
