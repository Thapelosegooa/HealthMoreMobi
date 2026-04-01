import { View, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "home",
      route: "/(tabs)/home",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "workouts",
      route: "/(tabs)/workouts",
      icon: "barbell-outline",
      activeIcon: "barbell",
    },
    {
      name: "chat",
      route: "/(tabs)/chat",
      icon: "chatbubble-outline",
      activeIcon: "chatbubble",
    },
    {
      name: "profile",
      route: "/(tabs)/profile",
      icon: "person-outline",
      activeIcon: "person",
    },
  ];

  const currentRoute = pathname.split("/").pop();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.replace(tab.route)}
            style={styles.tab}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={isActive ? 30 : 24} 
              color={isActive ? "#1DB954" : "#6d6d6d"} 
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 80,
    backgroundColor: "#e9e9e9",
    borderTopWidth: 1,
    borderTopColor: "#e2e2e2",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});