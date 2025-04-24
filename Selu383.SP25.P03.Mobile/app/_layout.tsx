import React from "react";
import { Stack } from "expo-router";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { TopNavBar } from "../navigation/TopNavBar";
import { BottomNavBar } from "../navigation/BottomNavBar";

export default function RootLayout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false, // Hide native headers
          }}
        />
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212", // for dark theme
  },
  content: {
    flex: 1,
  },
});
