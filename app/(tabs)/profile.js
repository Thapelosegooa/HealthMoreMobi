import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      //Clear storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      // optional: clear everything
      // await AsyncStorage.clear();

      Alert.alert("Logged out", "You have been logged out successfully.");

      //Redirect to login 
      router.replace("/login");

    } catch (err) {
      console.log("Logout error:", err);
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30 }}>
        Profile
      </Text>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "red",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}