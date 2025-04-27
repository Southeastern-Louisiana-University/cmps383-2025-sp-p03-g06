import React from "react";
import { Stack } from "expo-router";
import { TopNavBar } from "../navigation/TopNavBar";
import { BottomNavBar } from "../navigation/BottomNavBar";

export default function Layout() {
  return (
    <>
      <TopNavBar />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="movies" />
        <Stack.Screen name="reservations" />
        <Stack.Screen name="theaters" />
        <Stack.Screen name="concessions" />
      </Stack>
      <BottomNavBar />
    </>
  );
}
