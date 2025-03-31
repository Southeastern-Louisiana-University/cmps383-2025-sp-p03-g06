// app/index.tsx
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import TestConnection from "./screens/TestConnection";

// Add the default export here:

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TestConnection />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
// At the end of services/api/index.ts
