// app/screens/NowShowing.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Movie, moviesApi } from "../services/api";
import MovieCard from "../components/movies/MovieCard";

const NowShowing = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        console.log("Fetching movies...");

        // First, test the API connection directly
        try {
          console.log("Testing direct API connection...");
          const testResponse = await fetch(
            "http://192.168.1.73:5249/api/movies"
          );
          console.log("Direct API test status:", testResponse.status);
          const testText = await testResponse.text();
          console.log(
            "Direct API test response:",
            testText.substring(0, 100) + "..."
          );
        } catch (testErr) {
          console.error("Direct API test failed:", testErr.message);
        }

        // Then try using the API client
        const movieData = await moviesApi.getAll();
        console.log("Movies fetched:", movieData.length);
        setMovies(movieData);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Now Showing</Text>

      {movies.length === 0 ? (
        <Text style={styles.noMoviesText}>No movies available</Text>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={(movie) => console.log("Selected movie:", movie.title)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  noMoviesText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default NowShowing;
