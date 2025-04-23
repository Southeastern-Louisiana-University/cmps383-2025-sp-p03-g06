// Now Showing Screen
// app/movies/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { moviesApi, Movie } from "@/services/api/moviesApi";
import MovieCard from "@/components/movie/MovieCard";
import { movieImages, defaultPoster } from "@/services/utils/movieImages";

export default function NowShowingScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await moviesApi.getAll();

        // Add posterUrl using the title based image map
        const moviesWithPosters = data.map((movie) => {
          const key = movie.title.toLowerCase().replace(/[^a-z0-9]/g, "");

          return {
            ...movie,
            posterUrl: movieImages[key] ?? defaultPoster,
          };
        });

        setMovies(moviesWithPosters);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={() => router.push(`/movies/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        numColumns={2} // 2-column grid for the movie cards
        columnWrapperStyle={{ justifyContent: "flex-start", gap: 0, }} // Align movie cards in the row
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  theaterButton: {
    backgroundColor: "#0066cc",
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 4, 
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#121212",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
