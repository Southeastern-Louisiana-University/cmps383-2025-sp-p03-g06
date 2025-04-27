// app/account/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MyDenScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Den - Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
