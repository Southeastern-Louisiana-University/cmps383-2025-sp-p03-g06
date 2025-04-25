// components/movie/MovieCard.tsx
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
      <Image
        source={movie.posterUrl}
        style={styles.poster}
        resizeMode="contain"
      />
      <View>
        <Text style={styles.title}>{movie.title}</Text>
        
      </View>
    </View>
  </TouchableOpacity>
);

export default MovieCard;
