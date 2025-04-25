import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const seatsPerRow = 10;

const generateDummySeats = () => {
    const seats = [];
    for (let row = 0; row < rowLabels.length; row++) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const isAvailable = Math.random() > 0.2;
            seats.push({
                id: `${rowLabels[row]}-${seatNum}`,
                row: rowLabels[row],
                number: seatNum,
                available: isAvailable
            });
        }
    }
    return seats;
};

export default function SeatSelectionScreen() {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const availableSeats = generateDummySeats();

    const toggleSeatSelection = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleReserveSeats = () => {
        if (selectedSeats.length === 0) {
            Alert.alert('Select Seats', 'Please select at least one seat to reserve.');
            return;
        }

        Alert.alert(
            'Seats Reserved',
            `You have successfully reserved ${selectedSeats.length} seats: ${selectedSeats.join(', ')}`,
            [{ text: 'OK', onPress: () => console.log('Go back to theaters') }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.seatMapContainer}>
                <View style={styles.seatMap}>
                    {rowLabels.map((rowLabel) => (
                        <View key={rowLabel} style={styles.row}>
                            <Text style={styles.rowLabel}>{rowLabel}</Text>
                            <View style={styles.seats}>
                                {Array.from({ length: seatsPerRow }, (_, i) => {
                                    const seatNum = i + 1;
                                    const seatId = `${rowLabel}-${seatNum}`;
                                    const seat = availableSeats.find(s => s.id === seatId);
                                    const isAvailable = seat?.available;
                                    const isSelected = selectedSeats.includes(seatId);

                                    return (
                                        <TouchableOpacity
                                            key={seatId}
                                            style={[styles.seat, !isAvailable && styles.unavailableSeat, isSelected && styles.selectedSeat]}
                                            onPress={() => isAvailable && toggleSeatSelection(seatId)}
                                            disabled={!isAvailable}
                                        >
                                            <Text style={styles.seatLabel}>{seatNum}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.reservationSummary}>
                <Text>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected</Text>
                <Text>{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</Text>

                <TouchableOpacity
                    style={[styles.reserveButton, selectedSeats.length === 0 && styles.disabledButton]}
                    disabled={selectedSeats.length === 0}
                    onPress={handleReserveSeats}
                >
                    <Text style={styles.reserveButtonText}>Reserve Seats</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    seatMapContainer: {
        flex: 1,
    },
    seatMap: {
        padding: 16,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    rowLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        width: 20,
        textAlign: 'center',
    },
    seats: {
        flexDirection: 'row',
    },
    seat: {
        width: 28,
        height: 28,
        borderRadius: 4,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
    },
    selectedSeat: {
        backgroundColor: '#c70036',
    },
    unavailableSeat: {
        backgroundColor: '#222',
    },
    seatLabel: {
        color: '#FFFFFF',
        fontSize: 10,
    },
    reservationSummary: {
        padding: 16,
        backgroundColor: '#1E1E1E',
    },
    reserveButton: {
        backgroundColor: '#c70036',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#555',
    },
    reserveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});