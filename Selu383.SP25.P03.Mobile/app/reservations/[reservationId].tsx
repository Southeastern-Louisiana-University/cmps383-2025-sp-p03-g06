import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const seatsPerRow = 10;

const generateDummySeats = () => {
    const seats = [];
    for (let row = 0; row < rowLabels.length; row++) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const isAvailable = Math.random() > 0.2; // Random availability
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
    const availableSeats = generateDummySeats();

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

                                    return (
                                        <View key={seatId} style={[styles.seat, !isAvailable && styles.unavailableSeat]}>
                                            <Text style={styles.seatLabel}>{seatNum}</Text>
                                        </View>
                                    );
                                })}
                            </View>
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
    unavailableSeat: {
        backgroundColor: '#222',
    },
    seatLabel: {
        color: '#FFFFFF',
        fontSize: 10,
    },
});
