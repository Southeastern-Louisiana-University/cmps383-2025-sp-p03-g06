import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import type { Movie } from "@/services/api/moviesApi";

interface MovieCardProps {
  movie: Movie;
  onPress?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(movie);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <View style={styles.cardContent}>
        {movie.posterImageUrl ? (
          <Image
            source={{ uri: movie.posterImageUrl }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.rating && (
            <Text style={styles.rating}>Rated {movie.rating}</Text>
          )}
          <Text style={styles.duration}>{movie.durationMinutes} minutes</Text>

          {movie.genres?.length > 0 && (
            <Text style={styles.genres}>{movie.genres.join(", ")}</Text>
          )}

          <Text style={styles.releaseDate}>
            Released: {formatDate(movie.releaseDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
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
  },
  poster: {
    width: 100,
    height: 150,
  },
  posterPlaceholder: {
    width: 100,
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888",
  },
  details: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    marginBottom: 4,
  },
  genres: {
    fontSize: 14,
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: "#666",
  },
});
