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
              color={isActive ? "#000000" : "#6d6d6d"} 
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30, 
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ebebeb", 

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});