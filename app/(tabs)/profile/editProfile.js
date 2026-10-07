import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../../../config/api";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  // Form fields
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("lose");
  const [goalWeight, setGoalWeight] = useState("");

  const [saving, setSaving] = useState(false);

  // Load user from storage
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);

        // Load existing user values
        setAge(
          parsedUser.age !== undefined && parsedUser.age !== null
            ? String(parsedUser.age)
            : ""
        );

        setHeight(
          parsedUser.height !== undefined && parsedUser.height !== null
            ? String(parsedUser.height)
            : ""
        );

        setWeight(
          parsedUser.weight !== undefined && parsedUser.weight !== null
            ? String(parsedUser.weight)
            : ""
        );

        setGoal(parsedUser.goal || "lose");

        setGoalWeight(
          parsedUser.goalWeight !== undefined &&
            parsedUser.goalWeight !== null
            ? String(parsedUser.goalWeight)
            : ""
        );
      }
    } catch (err) {
      console.log("User load error:", err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Pick profile image
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow access to gallery"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;

        setImage(selectedImage);

        // Save locally
        await AsyncStorage.setItem(
          "profileImage",
          selectedImage
        );
      }
    } catch (err) {
      console.log("Image picker error:", err);
    }
  };

  // Load saved image
  const loadImage = async () => {
    try {
      const savedImage =
        await AsyncStorage.getItem("profileImage");

      if (savedImage) {
        setImage(savedImage);
      }
    } catch (err) {
      console.log("Image load error:", err);
    }
  };

  useEffect(() => {
    loadImage();
  }, []);

  // Save profile
  const handleSave = async () => {
    try {
      // Check fields
      if (
        !age ||
        !height ||
        !weight ||
        !goal ||
        !goalWeight
      ) {
        Alert.alert(
          "Missing information",
          "Please fill in all fields."
        );
        return;
      }

      if (Number(age) <= 0) {
        Alert.alert(
          "Invalid age",
          "Please enter a valid age."
        );
        return;
      }

      if (Number(height) <= 0) {
        Alert.alert(
          "Invalid height",
          "Please enter a valid height."
        );
        return;
      }

      if (Number(weight) <= 0) {
        Alert.alert(
          "Invalid weight",
          "Please enter a valid weight."
        );
        return;
      }

      if (Number(goalWeight) <= 0) {
        Alert.alert(
          "Invalid goal weight",
          "Please enter a valid goal weight."
        );
        return;
      }

      setSaving(true);



      // Get JWT token
      const token = await SecureStore.getItemAsync("token");

if (!token) {
  Alert.alert(
    "Session expired",
    "Please log in again."
  );

  router.replace("/login");
  return;
}



     
      // ----------------------------------------
      // Update profile
      // ----------------------------------------

      const profileResponse = await fetch(
        `${BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            age: Number(age),
            height: Number(height),
            goal: goal,
            goalWeight: Number(goalWeight),
          }),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.msg || "Failed to update profile."
        );
      }

      // ----------------------------------------
      // Update weight
      // ----------------------------------------

      const weightResponse = await fetch(
        `${BASE_URL}/api/weight/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            weight: Number(weight),
          }),
        }
      );

      const weightData = await weightResponse.json();

      if (!weightResponse.ok) {
        throw new Error(
          weightData.msg || "Failed to update weight."
        );
      }

      // ----------------------------------------
      // Update local user
      // ----------------------------------------

      const updatedUser = {
        ...profileData.user,
        weight: Number(weight),
      };

      setUser(updatedUser);

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      Alert.alert(
        "Success",
        "Your profile has been updated successfully."
      );
    } catch (err) {
      console.log("Profile update error:", err);

      Alert.alert(
        "Update failed",
        err.message ||
          "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("profileImage");

    Alert.alert(
      "Logged out",
      "You have been logged out successfully."
    );

    router.replace("/login");
  } catch (err) {
    console.log("Logout error:", err);
    Alert.alert("Error", "Failed to logout");
  }
};


  return (
    <ImageBackground
      source={require("../../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Edit Profile
        </Text>

        {/* Profile */}
        <View style={styles.profile}>

          {/* Profile Image */}
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../../assets/images/profile.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Email */}
          <Text style={styles.username}>
            {user?.email || "No user found"}
          </Text>
        </View>

        {/* Age */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Age
          </Text>

          <TextInput
            placeholder="Age"
            placeholderTextColor="#8f8f8f"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setAge(v.replace(/[^0-9]/g, ""))
            }
            value={age}
          />
        </View>

        {/* Height */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Height (cm)
          </Text>

          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#8f8f8f"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setHeight(v.replace(/[^0-9]/g, ""))
            }
            value={height}
          />
        </View>

        {/* Weight */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Weight (kg)
          </Text>

          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#8f8f8f"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setWeight(v.replace(/[^0-9]/g, ""))
            }
            value={weight}
          />
        </View>

        {/* Goal */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Goal
          </Text>

          <View style={styles.goalRow}>
            {["lose", "gain", "maintain"].map((g) => (
              <Pressable
                key={g}
                onPress={() => setGoal(g)}
                style={[
                  styles.goalButton,
                  goal === g && styles.goalSelected,
                ]}
              >
                <Text
                  style={[
                    styles.goalText,
                    goal === g &&
                      styles.goalTextSelected,
                  ]}
                >
                  {g.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Goal Weight */}
        <View style={styles.card}>
          <Text style={styles.label}>
            Goal Weight (kg)
          </Text>

          <TextInput
            placeholder="Goal Weight (kg)"
            placeholderTextColor="#8f8f8f"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              setGoalWeight(
                v.replace(/[^0-9]/g, "")
              )
            }
            value={goalWeight}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>
              SAVE CHANGES
            </Text>
          )}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginTop: 50,
    marginBottom: 20,
  },

  profile: {
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    marginBottom: 10,
  },

  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },

  username: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#666",
    padding: 12,
    borderRadius: 10,
    color: "#000",
    backgroundColor: "#f5f5f5",
    fontSize: 16,
  },

  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  goalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 10,
    alignItems: "center",
  },

  goalSelected: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },

  goalText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },

  goalTextSelected: {
    color: "#fff",
  },

  saveBtn: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 15,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 80,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    
  },
});
