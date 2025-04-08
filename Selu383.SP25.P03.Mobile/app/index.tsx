// app/index.tsx
<<<<<<< HEAD
//Entry point of the mobile app.
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
=======
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MainLayout } from "@/components/MainLayout"; // ✅ correct
>>>>>>> origin/last-branch

const Index = () => {
  const [activeTab, setActiveTab] = useState("now-playing");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

<<<<<<< HEAD
export default function Index() {
  return <Redirect href="/movies" />;
}
=======
  return (
    <MainLayout currentRoute="index">
      <View style={styles.container}>
        {/* Top Tab Navigation */}
        <View style={styles.tabContainer}>
          {["now-playing", "coming-soon", "on-demand"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              onPress={() => handleTabChange(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.replace("-", " ").toUpperCase()}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Section */}
        <ScrollView style={styles.contentContainer}>
          <View style={styles.moviesGrid}>
            {/* Movie Cards Placeholder */}
            <View style={styles.movieCard}>
              <View style={styles.posterContainer}>
                <View style={styles.posterPlaceholder}>
                  <Text style={styles.placeholderText}>Movie Poster</Text>
                </View>
              </View>
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>The Lion's Roar</Text>
                <Text style={styles.movieDate}>OPENING APR 10</Text>
              </View>
            </View>

            <View style={styles.movieCard}>
              <View style={styles.posterContainer}>
                <View style={styles.posterPlaceholder}>
                  <Text style={styles.placeholderText}>Movie Poster</Text>
                </View>
              </View>
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>Night Hunter</Text>
                <Text style={styles.movieDate}>OPENING APR 15</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    backgroundColor: "#121212",
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  tabText: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#c70036",
    fontWeight: "bold",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#c70036",
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  moviesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  movieCard: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    overflow: "hidden",
  },
  posterContainer: {
    height: 200,
    backgroundColor: "#2A2A2A",
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666666",
  },
  movieInfo: {
    padding: 10,
  },
  movieTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  movieDate: {
    color: "#888888",
    fontSize: 12,
  },
});

export default Index;
>>>>>>> origin/last-branch
