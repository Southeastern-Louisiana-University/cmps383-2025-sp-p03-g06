import React from "react";
import { Stack } from "expo-router";

export default function TheatersLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Our Theaters" }} />
            <Stack.Screen name="[theatersId]" options={{ title: "Theater Details" }} />
        </Stack>
    );
}