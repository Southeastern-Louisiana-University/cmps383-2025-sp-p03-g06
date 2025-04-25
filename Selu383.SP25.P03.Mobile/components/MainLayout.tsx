// app/components/MainLayout.tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { TopNavBar } from "../../navigation/TopNavBar";
import { BottomNavBar } from "../../navigation/BottomNavBar";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  currentRoute?: string;
}

export const MainLayout = ({
  children,
  title = "Lions Den Cinema",
  currentRoute = "index",
}: MainLayoutProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar title={title} />
      <View style={styles.content}>{children}</View>
      <BottomNavBar activeRoute={currentRoute} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
