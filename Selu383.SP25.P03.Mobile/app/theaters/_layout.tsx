import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function TheatersLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1E1E1E',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Theaters",
                    headerLeft: () => (
                        <Ionicons
                            name="menu-outline"
                            size={24}
                            color="#FFFFFF"
                            style={{ marginLeft: 16 }}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="[theatersId]"
                options={{
                    title: "Showtimes",
                    headerShown: true,
                }}
            />
        </Stack>
    );
}