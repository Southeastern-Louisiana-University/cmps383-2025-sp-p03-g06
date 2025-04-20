// app/theaters/[theatersId].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theatersApi, Theater } from "@/services/api/theatersApi";
import { showtimesApi, Showtime } from "@/services/api/showtimesApi";
import { moviesApi, Movie } from "@/services/api/moviesApi";

export default function TheaterDetailScreen() {
    const params = useLocalSearchParams();
    const theatersId = params.theatersId;
    const id = parseInt(String(theatersId));
    const [moviesAtTheater, setMoviesAtTheater] = useState<Movie[]>([]);
    const router = useRouter();

    const [theater, setTheater] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);

    useEffect(() => {
        async function fetchTheaterData() {
            if (!id || isNaN(id)) {
                setLoading(false);
                return;
            }

            try {
                //fetch theaters
                const theaterData = await theatersApi.getById(id);
                setTheater(theaterData);

                //fetch showtimes
                const theaterShowtimes = await showtimesApi.getByTheater(id);
                setShowtimes(theaterShowtimes);

                //movie ids
                const movieIds = [...new Set(theaterShowtimes.map(showtime => showtime.movieId))];
                console.log(`Found ${movieIds.length} unique movies at theater ${id}`);

                //fetch movies
                if (movieIds.length > 0) {
                    const moviesPromises = movieIds.map(movieId => moviesApi.getById(movieId));
                    const moviesData = await Promise.all(moviesPromises);
                    setMoviesAtTheater(moviesData);
                }
            } catch (error) {
                console.error("Error fetching theater data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTheaterData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#c70036" />
            </View>
        );
    }

    if (!theater) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Theater not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.theaterCard}>
                <Text style={styles.theaterName}>{theater.name}</Text>
                <Text style={styles.theaterAddress}>{theater.address}</Text>
                <Text style={styles.seatCount}>Capacity: {theater.seatCount} seats</Text>
            </View>

            <Text style={styles.sectionTitle}>Movies Now Showing</Text>

            {moviesAtTheater.length === 0 ? (
                <View style={styles.noMoviesContainer}>
                    <Text style={styles.noMoviesText}>No movies are currently showing at this theater.</Text>
                </View>
            ) : (
                moviesAtTheater.map(movie => (
                    <TouchableOpacity
                        key={movie.id}
                        style={styles.movieCard}
                        onPress={() => router.push(`/movies/${movie.id}`)}
                    >
                        <Image
                            source={{ uri: movie.posterImageUrl || 'https://via.placeholder.com/120x180' }}
                            style={styles.poster}
                            resizeMode="cover"
                        />
                        <View style={styles.movieDetails}>
                            <Text style={styles.movieTitle}>{movie.title}</Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.rating}>{movie.rating}</Text>
                            </View>
                            <Text style={styles.duration}>{movie.durationMinutes} min</Text>
                            <Text style={styles.genre}>{movie.genres.join(', ')}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
} // This closing brace was missing

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    theaterCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#c70036',
    },
    theaterName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    theaterAddress: {
        fontSize: 16,
        color: '#CCCCCC',
        marginBottom: 8,
    },
    seatCount: {
        fontSize: 14,
        color: '#AAAAAA',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    noMoviesContainer: {
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        alignItems: 'center',
    },
    noMoviesText: {
        color: '#CCCCCC',
        fontSize: 16,
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#121212',
    },
    errorText: {
        fontSize: 18,
        color: '#FF3B30',
        textAlign: 'center',
    },
    showsCount: {
        fontSize: 14,
        color: '#AAAAAA',
        marginTop: 4,
    },
    movieCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 8,
    },
    movieDetails: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    ratingContainer: {
        backgroundColor: '#c70036',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 6,
    },
    rating: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    duration: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 4,
    },
    genre: {
        color: '#AAAAAA',
        fontSize: 14,
    }
});