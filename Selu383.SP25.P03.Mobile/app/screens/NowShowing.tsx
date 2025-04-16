// screens/NowShowing.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { moviesApi } from "@/services/api";

const NowShowing = () => {
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log("Testing API connection...");
        const result = await fetch("http://192.168.1.73:7072");
        const text = await result.text();
        console.log("API response:", text);
      } catch (err) {
        console.error("Direct fetch test failed:", err);
      }
    };

    testApiConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Testing API Connection</Text>
      <Text>Check your terminal for logs</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
export default NowShowing;
