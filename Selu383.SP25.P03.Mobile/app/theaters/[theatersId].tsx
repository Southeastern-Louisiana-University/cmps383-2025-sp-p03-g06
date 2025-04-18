// app/theaters/[theatersId].tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theatersApi, Theater } from "@/services/api/theatersApi";
import { showtimesApi, Showtime } from "@/services/api/showtimesApi";

export default function TheaterDetailScreen() {
    const params = useLocalSearchParams();
    const theatersId = params.theatersId;
    const id = parseInt(String(theatersId));

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
                //fetch theater
                const theaterData = await theatersApi.getById(id);
                setTheater(theaterData);

                //fetch showtimes
                const theaterShowtimes = await showtimesApi.getByTheater(id);
                setShowtimes(theaterShowtimes);
                console.log(`Found ${theaterShowtimes.length} showtimes for theater ${id}`);
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
                <Text style={styles.showsCount}>
                    {showtimes.length} showtimes available
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Movies Now Showing</Text>
            <View style={styles.noMoviesContainer}>
                <Text style={styles.noMoviesText}>
                    {showtimes.length > 0
                        ? "Loading movie details..."
                        : "No movies are currently showing at this theater."}
                </Text>
            </View>
        </ScrollView>
    );
}

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
    }
});