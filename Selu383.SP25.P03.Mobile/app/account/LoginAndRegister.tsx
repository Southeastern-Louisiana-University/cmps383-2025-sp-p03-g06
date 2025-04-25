// app/LoginAndRegister.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { authApi, saveToken } from "@/services/api/authApi";

export default function LoginAndRegister() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Validation", "Enter both username and password");
    }
    setLoading(true);
    try {
      const { token } = await authApi.login({ username, password });
      await saveToken(token);
      router.replace("/account");
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert("Validation", "Enter username, email, and password");
    }
    setLoading(true);
    try {
      const { token } = await authApi.register({ username, email, password });
      await saveToken(token);
      router.replace("/account");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c70036" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Button
          title="Login"
          onPress={() => setIsRegistering(false)}
          color={isRegistering ? "#444" : "#c70036"}
        />
        <Button
          title="Register"
          onPress={() => setIsRegistering(true)}
          color={isRegistering ? "#c70036" : "#444"}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={isRegistering ? "Create Account" : "Log In"}
        onPress={isRegistering ? handleRegister : handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    color: "#fff",
    backgroundColor: "#1e1e1e",
  },
});
