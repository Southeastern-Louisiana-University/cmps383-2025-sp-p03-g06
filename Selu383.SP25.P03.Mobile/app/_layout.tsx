import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Lions Den Cinemas" }} />
            <Stack.Screen name="movies" options={{ headerShown: false }} />
            <Stack.Screen name="theaters" options={{ headerShown: false }} />
        </Stack>
    );
}