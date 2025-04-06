//components/movie/MovieCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "./MovieCard.styles";
import { Movie } from "@/services/api/types";


interface Props {
  movie: Movie;
  onPress: () => void;
}

const MovieCard: React.FC<Props> = ({ movie, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      {movie.posterUrl ? (
        <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      ) : (
        <View style={styles.posterPlaceholder} />
      )}
      <View>
        <Text style={styles.title}>{movie.title}</Text>
        <Text>Rated {movie.rating}</Text>
        <Text>{movie.durationMinutes} minutes</Text>
        <Text>{movie.genres.join(", ")}</Text>
        <Text>
          Released: {new Date(movie.releaseDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default MovieCard;
