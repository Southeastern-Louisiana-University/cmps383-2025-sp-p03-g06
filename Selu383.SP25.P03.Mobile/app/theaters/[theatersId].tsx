// app/theaters/[theaterId].tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { theatersApi, Theater } from "@/services/api/theatersApi";

export default function TheaterDetailScreen() {
    const { theaterId } = useLocalSearchParams();
    const id = Array.isArray(theaterId) ? parseInt(theaterId[0]) : parseInt(theaterId);
    const [theater, setTheater] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTheater() {
            try {
                const data = await theatersApi.getById(id);
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
                <Text style={styles.theaterLocation}>{theater.location}</Text>

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
    },
});