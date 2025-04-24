import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { moviesApi } from "@/services/api/moviesApi";
import { showtimesApi, Showtime } from "@/services/api/showtimesApi";
import { Movie } from "@/services/api/moviesApi";

export default function MovieScreen() {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const numericId = Number(movieId);
    if (!movieId || isNaN(numericId)) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const movieData = await moviesApi.getById(numericId);
        setMovie(movieData);

        const showtimeData = await showtimesApi.getByMovie(numericId);
        setShowtimes(showtimeData);
      } catch (error) {
        console.error("Failed to load movie or showtimes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [movieId]);

  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const key = showtime.theaterName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "white" }}>Movie not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Movie Details */}
      <Text style={styles.title}>{movie.title}</Text>
      <Text style={styles.rating}>Rated {movie.rating}</Text>
      <Text style={styles.details}>
        Duration: {movie.durationMinutes} minutes
      </Text>
      <Text style={styles.details}>Genres: {movie.genres.join(", ")}</Text>
      <Text style={styles.description}>{movie.description}</Text>

      {/* Showtimes Grouped by Theater */}
      <Text style={styles.sectionTitle}>Showtimes</Text>
      {Object.entries(groupedShowtimes).map(([theaterName, times]) => (
        <View key={theaterName} style={styles.theaterBlock}>
          <Text style={styles.theaterTitle}>{theaterName}</Text>
          <View style={styles.showtimeRow}>
            {times.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.showtimeButton}
                onPress={() => router.push(`/reservations/${s.id}`)}
              >
                <Text style={styles.showtimeText}>
                  {new Date(s.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  container: {
    padding: 16,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#c70036",
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 12,
  },
  details: {
    fontSize: 14,
    color: "#aaaaaa",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  theaterBlock: {
    marginBottom: 16,
  },
  theaterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  showtimeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  showtimeButton: {
    backgroundColor: "#c70036",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  showtimeText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
