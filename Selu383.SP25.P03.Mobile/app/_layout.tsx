import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Lions Den Cinemas" }} />
            <Stack.Screen name="movies" options={{ title: "Movies" }} />
            <Stack.Screen name="theaters" options={{ title: "Our Theaters" }} />
        </Stack>
    );
}