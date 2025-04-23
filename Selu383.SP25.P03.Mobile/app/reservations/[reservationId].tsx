import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function SeatSelectionScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.infoCard}>
                <Text style={styles.movieTitle}>Movie Title</Text>
                <Text style={styles.showtimeInfo}>Date and Time</Text>
                <Text style={styles.theaterInfo}>Theater Info</Text>
            </View>

            <View style={styles.screenContainer}>
                <View style={styles.screen} />
                <Text style={styles.screenLabel}>SCREEN</Text>
            </View>

            <ScrollView style={styles.seatMapContainer}>
                <View style={styles.seatMap}>
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
    infoCard: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    movieTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    showtimeInfo: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 2,
    },
    theaterInfo: {
        color: '#CCCCCC',
        fontSize: 14,
    },
    screenContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    screen: {
        height: 8,
        backgroundColor: '#555',
        width: '100%',
        borderRadius: 4,
        marginBottom: 8,
    },
    screenLabel: {
        color: '#AAAAAA',
        fontSize: 12,
    },
    seatMapContainer: {
        flex: 1,
    },
});
