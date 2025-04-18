// app/components/navigation/BottomNavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type NavItem = {
  label: string;
  icon: string;
  route: string;
};

interface BottomNavBarProps {
  activeRoute?: string;
}

export const BottomNavBar = ({ activeRoute = "index" }: BottomNavBarProps) => {
  const router = useRouter();

  const navItems: NavItem[] = [
    { label: "SEE A MOVIE", icon: "film-outline", route: "/movies" },
    { label: "LOCATIONS", icon: "location-outline", route: "/theaters" },
    { label: "FOOD & DRINKS", icon: "fast-food-outline", route: "concessions" },
    { label: "REWARDS", icon: "star-outline", route: "rewards" },
    { label: "MY DEN", icon: "person-outline", route: "account" },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => handleNavigation(item.route)}
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={activeRoute === item.route ? "#c70036" : "#AAAAAA"}
          />
          <Text
            style={[
              styles.navLabel,
              { color: activeRoute === item.route ? "#c70036" : "#AAAAAA" },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },
});
