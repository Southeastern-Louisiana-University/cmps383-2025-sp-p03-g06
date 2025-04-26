import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const seatsPerRow = 10;

const generateDummySeats = () => {
    const seats = [];
    for (let row = 0; row < rowLabels.length; row++) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            seats.push({
                id: `${rowLabels[row]}-${seatNum}`,
                available: Math.random() > 0.2,
            });
        }
    }
    return seats;
};

export default function SeatSelectionScreen() {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setSeats(generateDummySeats());
            } catch (err) {
                setError('Failed to load seats');
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, []);

    const toggleSeatSelection = (seatId: string) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#c70036" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: 'white' }}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.seatMap}>
                    {rowLabels.map((row) => (
                        <View key={row} style={styles.row}>
                            {Array.from({ length: seatsPerRow }, (_, i) => {
                                const seatNum = i + 1;
                                const seatId = `${row}-${seatNum}`;
                                const seat = seats.find((s) => s.id === seatId);
                                const isAvailable = seat?.available;
                                const isSelected = selectedSeats.includes(seatId);

                                return (
                                    <TouchableOpacity
                                        key={seatId}
                                        style={[
                                            styles.seat,
                                            !isAvailable && styles.unavailableSeat,
                                            isSelected && styles.selectedSeat,
                                        ]}
                                        onPress={() => isAvailable && toggleSeatSelection(seatId)}
                                        disabled={!isAvailable}
                                    >
                                        <Text style={{ color: 'white', fontSize: 10 }}>{seatNum}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    seatMap: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    seat: {
        width: 28,
        height: 28,
        backgroundColor: '#333',
        borderRadius: 4,
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedSeat: {
        backgroundColor: '#c70036',
    },
    unavailableSeat: {
        backgroundColor: '#555',
    },
});
