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
import { Ionicons } from '@expo/vector-icons'; 

export default function MovieScreen() {
    const { movieId } = useLocalSearchParams();
    const router = useRouter();
    const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
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

                const dates = [...new Set(
                    showtimeData.map(st => new Date(st.startTime).toISOString().split('T')[0])
                )].sort();

                setAvailableDates(dates);

                const today = new Date().toISOString().split('T')[0];
                const defaultDate = dates.includes(today) ? today : dates[0];
                setSelectedDate(defaultDate);

                if (showtimeData.length > 0) {
                    const showtimesForDate = showtimeData.filter(
                        st => new Date(st.startTime).toISOString().split('T')[0] === defaultDate
                    );
                    if (showtimesForDate.length > 0) {
                        setSelectedTheaterId(showtimesForDate[0].theaterId);
                    } else {
                        setSelectedTheaterId(showtimeData[0].theaterId);
                    }
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else {
            return date.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const filteredShowtimes = showtimes.filter(
        (s) =>
            new Date(s.startTime).toISOString().split('T')[0] === selectedDate &&
            s.theaterId === selectedTheaterId
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#c70036" />
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
        <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
 
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.rating}>Rated {movie.rating}</Text>
            <Text style={styles.details}>
                Duration: {movie.durationMinutes} minutes
            </Text>
            <Text style={styles.details}>Genres: {movie.genres.join(", ")}</Text>
            <Text style={styles.description}>{movie.description}</Text>

            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity
                style={styles.fakeDropdownButton}
                onPress={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            >
                <Text style={styles.fakeDropdownButtonText}>
                    {selectedDate ? formatDate(selectedDate) : "Select a date"}
                </Text>
            </TouchableOpacity>

            {isDateDropdownOpen && (
                <View style={styles.dropdownOptions}>
                    {availableDates.map((date) => (
                        <TouchableOpacity
                            key={date}
                            style={styles.dropdownOption}
                            onPress={() => {
                                setSelectedDate(date);
                                setIsDateDropdownOpen(false);
                            }}
                        >
                            <Text style={styles.dropdownOptionText}>{formatDate(date)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.sectionTitle}>Select Theater</Text>
            <View style={styles.theaterTabs}>
                {uniqueTheaters.map((theater) => (
                    <TouchableOpacity
                        key={theater.id}
                        onPress={() => setSelectedTheaterId(theater.id)}
                        style={styles.theaterButton}
                    >
                        <Text
                            style={[
                                styles.theaterButtonText,
                                selectedTheaterId === theater.id && styles.activeTheaterButtonText,
                            ]}
                        >
                            {theater.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.showtimeRow}>
                {filteredShowtimes.length > 0 ? (
                    filteredShowtimes.map((s) => (
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
                            {s.baseTicketPrice < 12 && (
                                <Text style={styles.discountText}>25% OFF</Text>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noShowtimesContainer}>
                        <Ionicons name="calendar-outline" size={28} color="#666" />
                        <Text style={styles.noShowtimesText}>
                            No showtimes available for this selection
                        </Text>
                    </View>
                )}
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
        marginVertical: 12,
    },
    fakeDropdownButton: {
        backgroundColor: "#2b2b2b",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    fakeDropdownButtonText: {
        color: "#ffffff",
        fontSize: 16,
    },
    dropdownOptions: {
        backgroundColor: "#2b2b2b",
        borderRadius: 8,
        marginBottom: 16,
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#444",
    },
    dropdownOptionText: {
        color: "#ffffff",
        fontSize: 16,
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
    activeTheaterButtonText: {
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
        alignItems: "center",
    },
    showtimeText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    discountText: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 4,
    },
    noShowtimesContainer: {
        backgroundColor: "#222",
        padding: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    noShowtimesText: {
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#444",
        marginVertical: 16,
        opacity: 0.4,
    },
});