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
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(
    null
  );
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

        if (showtimeData.length > 0 && selectedTheaterId === null) {
          setSelectedTheaterId(showtimeData[0].theaterId);
        }
      } catch (error) {
        console.error("Failed to load movie or showtimes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [movieId]);

  const uniqueTheaters = Array.from(
    new Map(
      showtimes.map((s) => [
        s.theaterId,
        {
          id: s.theaterId,
          name: s.theaterName,
        },
      ])
    ).values()
  );

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

      {/* Theater Tabs */}
      <Text style={styles.sectionTitle}>Select Theater</Text>
      <View style={styles.theaterTabs}>
        {uniqueTheaters.map((theater) => (
          <TouchableOpacity
            key={theater.id}
            onPress={() => setSelectedTheaterId(theater.id)}
            style={[styles.theaterButton]}
          >
            <Text
              style={[
                styles.theaterButtonText,
                selectedTheaterId === theater.id &&
                  styles.activeTheaterButtonText, // ✅ text styles here
              ]}
            >
              {theater.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider between theaters and showtimes */}
      <View style={styles.divider} />

      {/* Showtimes for Selected Theater */}
      <View style={styles.showtimeRow}>
        {showtimes
          .filter((s) => s.theaterId === selectedTheaterId)
          .map((s) => (
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
  theaterTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  theaterButton: {
    backgroundColor: "#2b2b2b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
  },
  activeTheaterButton: {
    color: "#c70036",
  },
  theaterButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
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
  divider: {
    height: 1,
    backgroundColor: "#444", // subtle gray
    marginVertical: 16,
    opacity: 0.4,
  },
  activeTheaterButtonText: {
    color: "#c70036", // Your brand red
  },
});
