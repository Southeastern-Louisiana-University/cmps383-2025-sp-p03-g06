// app/account/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import { useRouter } from "expo-router";

import { authApi, User, clearToken } from "@/services/api/authApi";

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) Fetch current user on mount
  const fetchUser = async () => {
    setLoading(true);
    try {
      const me = await authApi.getCurrentUser();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 2) If done loading & no user, send them to LoginAndRegister
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/LoginAndRegister");
    }
  }, [loading, user, router]);

  // 3) While fetching, show spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c70036" />
      </View>
    );
  }

  // 4) If we’ve redirected, nothing else to render here
  if (!user) {
    return null;
  }

  // 5) Logged in → show account info
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Account</Text>
      <Text style={styles.label}>ID: {user.id}</Text>
      <Text style={styles.label}>Username: {user.username}</Text>
      <Text style={styles.label}>Email: {user.email}</Text>
      <View style={{ marginTop: 20 }}>
        <Button
          title="Log Out"
          onPress={async () => {
            await clearToken();
            router.replace("/account/LoginAndRegister");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
});
