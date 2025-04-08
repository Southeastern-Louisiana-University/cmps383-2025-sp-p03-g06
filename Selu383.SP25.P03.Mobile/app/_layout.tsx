import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Lions Den Cinemas" }} />
            <Stack.Screen name="movies/index" options={{ title: "Now Showing" }} />
            <Stack.Screen name="theaters/index" options={{ title: "Our Theaters" }} />
            <Stack.Screen name="theaters/[theatersId]" options={{ title: "Theater Details" }} />
        </Stack>
    );
}