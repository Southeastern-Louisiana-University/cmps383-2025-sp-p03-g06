import React from "react";
import { Stack } from "expo-router";

export default function ReservationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#121212" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white", // Back arrow color
      }}
    >
      <Stack.Screen
        name="[reservationId]"
        options={{
          title: "Reservation",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
