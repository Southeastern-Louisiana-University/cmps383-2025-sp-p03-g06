import React from 'react';
import { Stack } from 'expo-router';

export default function ReservationsLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Reservation",
                    headerBackTitle: "Back"
                }}
            />
        </Stack>
    );
}