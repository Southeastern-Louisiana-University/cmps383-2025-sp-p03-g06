<<<<<<< Updated upstream
// app/_layout.tsx
=======
﻿// app/_layout.tsx
>>>>>>> Stashed changes
import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const RootLayout = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "fade",
        }}
      />
    </View>
  );
};
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext'; // ✅ make sure this path is correct

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
SplashScreen.preventAutoHideAsync();

export default RootLayout;
export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Lions Den Cinemas" }} />
            <Stack.Screen name="movies" options={{ headerShown: false }} />
            <Stack.Screen name="theaters" options={{ headerShown: false }} />
        </Stack>
    );
<<<<<<< Updated upstream
}
=======
}
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </ThemeProvider>
        </AuthProvider>
    );
}
>>>>>>> Stashed changes
