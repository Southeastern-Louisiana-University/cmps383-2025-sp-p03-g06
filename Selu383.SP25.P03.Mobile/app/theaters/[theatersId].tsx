import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    Modal
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { theatersApi } from "@/services/api/theatersApi";
import { showtimesApi } from "@/services/api/showtimesApi";
import { moviesApi } from "@/services/api/moviesApi";

export default function TheaterShowtimesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const theaterId = parseInt(String(params.theatersId));

    const [theater, setTheater] = useState(null);
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);

    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [movieModalVisible, setMovieModalVisible] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const theaterData = await theatersApi.getById(theaterId);
                setTheater(theaterData);

                const theaterShowtimes = await showtimesApi.getByTheater(theaterId);
                setShowtimes(theaterShowtimes);

                const movieIds = [...new Set(theaterShowtimes.map(s => s.movieId))];

                const moviesData = await Promise.all(
                    movieIds.map(id => moviesApi.getById(id))
                );

                setMovies(moviesData);

                if (moviesData.length > 0) {
                    setSelectedMovie(moviesData[0]);
                }

                const dates = [...new Set(
                    theaterShowtimes.map(st => new Date(st.startTime).toISOString().split('T')[0])
                )].sort();
                setAvailableDates(dates);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [theaterId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else {
            return date.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredShowtimes = showtimes.filter(showtime =>
        new Date(showtime.startTime).toISOString().split('T')[0] === selectedDate &&
        (!selectedMovie || showtime.movieId === selectedMovie.id)
    );

    const showtimesByMovie = filteredShowtimes.reduce((acc, showtime) => {
        if (!acc[showtime.movieId]) {
            acc[showtime.movieId] = [];
        }
        acc[showtime.movieId].push(showtime);
        return acc;
    }, {});

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#c70036" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    title: theater?.name || "Showtimes",
                    headerShown: true,
                }}
            />

            <View style={styles.theaterHeader}>
                <View style={styles.theaterSelector}>
                    <Ionicons name="location-outline" size={24} color="#fff" />
                    <Text style={styles.theaterName}>{theater?.name}</Text>
                </View>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDateModalVisible(true)}
                >
                    <Text style={styles.dropdownButtonText}>
                        Date: {formatDate(selectedDate)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setMovieModalVisible(true)}
                >
                    <Text style={styles.dropdownButtonText} numberOfLines={1}>
                        Movie: {selectedMovie?.title || "All Movies"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <Modal visible={dateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {availableDates.map(date => (
                            <TouchableOpacity
                                key={date}
                                onPress={() => {
                                    setSelectedDate(date);
                                    setDateModalVisible(false);
                                }}
                                style={styles.modalOption}
                            >
                                <Text style={styles.modalOptionText}>{formatDate(date)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal visible={movieModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {movies.map(movie => (
                            <TouchableOpacity
                                key={movie.id}
                                onPress={() => {
                                    setSelectedMovie(movie);
                                    setMovieModalVisible(false);
                                }}
                                style={styles.modalOption}
                            >
                                <Text style={styles.modalOptionText}>{movie.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {selectedMovie && (
                <ScrollView style={styles.movieDetails}>
                    <View style={styles.movieHeader}>
                        <Text style={styles.movieTitle}>{selectedMovie.title}</Text>
                        <View style={styles.ratingDuration}>
                            <View style={styles.ratingPill}>
                                <Text style={styles.ratingText}>{selectedMovie.rating}</Text>
                            </View>
                            <Text style={styles.duration}>
                                {Math.floor(selectedMovie.durationMinutes / 60)} HR {selectedMovie.durationMinutes % 60} MIN
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.showtimesHeader}>Standard Format</Text>

                    <View style={styles.showtimesList}>
                        {showtimesByMovie[selectedMovie.id]?.map(showtime => (
                            <TouchableOpacity
                                key={showtime.id}
                                style={styles.showtimeButton}
                                onPress={() => router.push(`/reservations/${showtime.id}`)}
                            >
                                <Text style={styles.showtimeText}>{formatTime(showtime.startTime)}</Text>
                                <Text style={styles.discountText}>
                                    {showtime.baseTicketPrice < 12 ? "25% OFF" : ""}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.movieDescription}>
                        <Text style={styles.movieDescriptionText}>
                            {selectedMovie.description || "No description available for this movie."}
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#121212',
    },
    theaterHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#1E1E1E',
    },
    theaterSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    theaterName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },

    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        flex: 0.48,
    },
    dropdownButtonText: {
        color: '#fff',
        marginRight: 8,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        margin: 20,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 20,
    },
    modalOption: {
        paddingVertical: 12,
    },
    modalOptionText: {
        color: '#fff',
        fontSize: 16,
    },

    movieDetails: {
        padding: 16,
    },
    movieHeader: {
        marginBottom: 24,
    },
    movieTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingDuration: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingPill: {
        backgroundColor: '#c70036',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 12,
    },
    ratingText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    duration: {
        color: '#ccc',
    },
    showtimesHeader: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    showtimesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    showtimeButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        marginRight: 12,
        marginBottom: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    showtimeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    discountText: {
        color: '#c70036',
        fontSize: 12,
        fontWeight: 'bold',
    },
    movieDescription: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    movieDescriptionText: {
        color: '#ccc',
        lineHeight: 20,
    },
});
