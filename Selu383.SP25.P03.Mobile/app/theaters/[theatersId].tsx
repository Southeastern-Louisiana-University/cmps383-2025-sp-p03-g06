// app/theaters/[theatersId].tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { theatersApi, Theater } from "@/services/api/theatersApi";

export default function TheaterDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    console.log("URL params received:", JSON.stringify(params));

    const theatersId = params.theatersId;
    console.log("Raw theatersId:", theatersId);

    // Check if this is the "index" route or a numeric ID
    if (theatersId === "index") {
        // We're actually on the index page, not a details page
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Please select a theater from the list.</Text>
            </View>
        );
    }

    // Parse the ID for an actual theater
    const id = parseInt(String(theatersId));
    console.log("Parsed ID:", id);

    const [theater, setTheater] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTheater() {
            // Skip the API call if we don't have a valid ID
            if (!id || isNaN(id)) {
                console.error("Invalid theater ID");
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching theater with ID:", id);
                const data = await theatersApi.getById(id);
                console.log("Theater data received:", data);
                setTheater(data);
            } catch (error) {
                console.error("Error fetching theater:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTheater();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
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
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.theaterName}>{theater.name}</Text>
                <Text style={styles.theaterLocation}>{theater.address}</Text>
                <Text style={styles.seatInfo}>Seats: {theater.seatCount}</Text>

                <View style={styles.divider} />

                <Text style={styles.comingSoon}>
                    More details about this theater coming soon!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    theaterName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    theaterLocation: {
        fontSize: 18,
        color: '#666',
        marginBottom: 8,
    },
    seatInfo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    comingSoon: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ff3b30',
        textAlign: 'center',
    },
});