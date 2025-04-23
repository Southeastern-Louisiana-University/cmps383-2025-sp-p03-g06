import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { showtimesApi } from '@/services/api/showtimesApi';

export default function ReservationScreen() {
    const params = useLocalSearchParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [showtime, setShowtime] = useState(null);

    useEffect(() => {
        async function loadShowtime() {
            try {
                const showtimeData = await showtimesApi.getById(parseInt(id));
                setShowtime(showtimeData);
            } catch (error) {
                console.error('Error loading showtime:', error);
            } finally {
                setLoading(false);
            }
        }

        loadShowtime();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#c70036" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reservation Details</Text>
            {showtime ? (
                <View style={styles.showtimeInfo}>
                    <Text style={styles.movie}>Movie: {showtime.movieTitle}</Text>
                    <Text style={styles.theater}>Theater: {showtime.theaterName}</Text>
                    <Text style={styles.time}>
                        Time: {new Date(showtime.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                    <Text style={styles.date}>
                        Date: {new Date(showtime.startTime).toLocaleDateString()}
                    </Text>
                </View>
            ) : (
                <Text style={styles.error}>Showtime not found</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    showtimeInfo: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    movie: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    theater: {
        fontSize: 16,
        color: '#CCCCCC',
        marginBottom: 8,
    },
    time: {
        fontSize: 16,
        color: '#CCCCCC',
        marginBottom: 8,
    },
    date: {
        fontSize: 16,
        color: '#CCCCCC',
        marginBottom: 8,
    },
    error: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
    },
});