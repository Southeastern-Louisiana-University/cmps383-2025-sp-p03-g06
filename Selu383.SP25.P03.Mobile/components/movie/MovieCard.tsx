// components/movie/MovieCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "./MovieCard.styles";
import { Movie } from "@/services/api/moviesApi";
import { API_BASE_URL } from "@/services/api/config";

interface Props {
  movie: Movie;
  onPress: () => void;
}

const MovieCard: React.FC<Props> = ({ movie, onPress }) => {
  const imageUrl = movie.posterImageUrl?.startsWith("http")
    ? movie.posterImageUrl
    : `${API_BASE_URL}${movie.posterImageUrl}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.poster} />
      ) : (
        <View style={styles.posterPlaceholder} />
      )}
      <Text style={styles.title}>{movie.title}</Text>
    </TouchableOpacity>
  );
};

export default MovieCard;
