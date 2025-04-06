import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";
import { moviesApi } from "../../services/api/moviesApi";
import { Movie } from "../../services/api/types";

export default function MovieDetailsScreen() {
  const { movieId } = useLocalSearchParams(); // always returns a string or an array of strings
  const id = Array.isArray(movieId) ? parseInt(movieId[0]) : parseInt(movieId); // parseInt to convert string to a number
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const data = await moviesApi.getById(id); // id is a number
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View>
        <Text>Movie not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text>{movie.title}</Text>
      <Text>{movie.rating}</Text>
      <Text>{movie.description}</Text>
      <Text>{movie.durationMinutes} minutes</Text>
      <Text>{movie.genres.join(", ")}</Text>
      <Text>{}</Text>
    </ScrollView>
  );
}
