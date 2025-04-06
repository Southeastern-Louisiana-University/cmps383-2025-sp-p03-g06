// app/index.tsx
//Entry point of the mobile app.
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import TestConnection from "./TestConnection";
import { Redirect } from "expo-router";

// Add the default export here:

export default function Index() {
  return <Redirect href="/movies" />;
}
