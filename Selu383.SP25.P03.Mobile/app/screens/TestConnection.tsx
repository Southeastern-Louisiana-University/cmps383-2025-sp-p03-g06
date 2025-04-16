// app/screens/TestConnection.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { apiRequest } from "@/services/api/client";

const TestConnection = () => {
  const [status, setStatus] = useState("Checking...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const data = await apiRequest("/api/movies");
        setStatus("Connected to backend!");
        console.log("API response:", data);
      } catch (err) {
        setStatus("Could not connect.");
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {status === "Checking..." && <ActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    color: "red",
  },
});
export default TestConnection;
