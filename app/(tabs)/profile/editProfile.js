
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
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../../../config/api";

const COLORS = {
  background: "#101713",
  card: "#202D24",
  cardLight: "#263A2C",
  primary: "#1DB954",
  white: "#FFFFFF",
  muted: "#A3B2A7",
  border: "#344438",
  danger: "#E65C5C",
};

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

  // Load user information
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
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

  // Load saved profile image
  const loadImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem("profileImage");

      if (savedImage) {
        setImage(savedImage);
      }
    } catch (err) {
      console.log("Image load error:", err);
    }
  };

  useEffect(() => {
    loadUser();
    loadImage();
  }, []);

  // Allow positive decimal values for weight and height
  const handleDecimalInput = (value, setter) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");

    const formatted =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : cleaned;

    setter(formatted);
  };

  // Pick profile image
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow HealthMore to access your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedImage = result.assets[0].uri;

        setImage(selectedImage);

        await AsyncStorage.setItem("profileImage", selectedImage);
      }
    } catch (err) {
      console.log("Image picker error:", err);
      Alert.alert("Error", "Unable to select profile image.");
    }
  };

  // Save profile
  const handleSave = async () => {
    if (
      !age.trim() ||
      !height.trim() ||
      !weight.trim() ||
      !goal ||
      !goalWeight.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in all fields before saving."
      );
      return;
    }

    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);
    const goalWeightValue = Number(goalWeight);

    if (
      !Number.isFinite(ageValue) ||
      !Number.isInteger(ageValue) ||
      ageValue <= 0
    ) {
      Alert.alert("Invalid age", "Please enter a valid age.");
      return;
    }

    if (!Number.isFinite(heightValue) || heightValue <= 0) {
      Alert.alert("Invalid height", "Please enter a valid height.");
      return;
    }

    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      Alert.alert("Invalid weight", "Please enter a valid weight.");
      return;
    }

    if (!Number.isFinite(goalWeightValue) || goalWeightValue <= 0) {
      Alert.alert(
        "Invalid goal weight",
        "Please enter a valid goal weight."
      );
      return;
    }

    try {
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

      // Update profile details
      const profileResponse = await fetch(
        `${BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            age: ageValue,
            height: heightValue,
            goal,
            goalWeight: goalWeightValue,
          }),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.msg || "Failed to update profile."
        );
      }

      // Update current weight
      const weightResponse = await fetch(
        `${BASE_URL}/api/weight/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            weight: weightValue,
          }),
        }
      );

      const weightData = await weightResponse.json();

      if (!weightResponse.ok) {
        throw new Error(
          weightData.msg || "Failed to update weight."
        );
      }

      // Update local user information
      const updatedUser = {
        ...(profileData.user || user || {}),
        age: ageValue,
        height: heightValue,
        weight: weightValue,
        goal,
        goalWeight: goalWeightValue,
      };

      setUser(updatedUser);

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      Alert.alert(
        "Profile updated",
        "Your profile information has been saved successfully."
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
      Alert.alert("Error", "Failed to logout.");
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACCOUNT SETTINGS</Text>

          <Text style={styles.title}>
            Your{"\n"}
            <Text style={styles.titleAccent}>profile.</Text>
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your personal information and fitness goals.
          </Text>
        </View>

        {/* PROFILE INFORMATION */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../../assets/images/profile.png")
              }
              style={styles.profileImage}
            />

            <View style={styles.editImageBadge}>
              <Text style={styles.editImageIcon}>✎</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.username}>
            {user?.email || "Loading profile..."}
          </Text>

          <Text style={styles.profileCaption}>
            Tap your picture to change it
          </Text>
        </View>

        {/* PERSONAL DETAILS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Text style={styles.sectionSubtitle}>
            Your basic information
          </Text>
        </View>

        {/* AGE */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeading}>
            <Text style={styles.inputLabel}>Age</Text>
            <Text style={styles.inputUnit}>YEARS</Text>
          </View>

          <TextInput
            placeholder="Enter your age"
            placeholderTextColor={COLORS.muted}
            keyboardType="numeric"
            style={styles.input}
            value={age}
            onChangeText={(value) =>
              setAge(value.replace(/[^0-9]/g, ""))
            }
          />
        </View>

        {/* HEIGHT */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeading}>
            <Text style={styles.inputLabel}>Height</Text>
            <Text style={styles.inputUnit}>CM</Text>
          </View>

          <TextInput
            placeholder="Enter your height"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
            style={styles.input}
            value={height}
            onChangeText={(value) =>
              handleDecimalInput(value, setHeight)
            }
          />
        </View>

        {/* WEIGHT */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeading}>
            <Text style={styles.inputLabel}>Current weight</Text>
            <Text style={styles.inputUnit}>KG</Text>
          </View>

          <TextInput
            placeholder="Enter your current weight"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
            style={styles.input}
            value={weight}
            onChangeText={(value) =>
              handleDecimalInput(value, setWeight)
            }
          />
        </View>

        {/* FITNESS GOAL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fitness goals</Text>
          <Text style={styles.sectionSubtitle}>
            What are you working towards?
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Your main goal</Text>

          <View style={styles.goalRow}>
            {["lose", "gain", "maintain"].map((item) => {
              const selected = goal === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setGoal(item)}
                  style={[
                    styles.goalButton,
                    selected && styles.goalSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalText,
                      selected && styles.goalTextSelected,
                    ]}
                  >
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* GOAL WEIGHT */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeading}>
            <Text style={styles.inputLabel}>Target weight</Text>
            <Text style={styles.inputUnit}>KG</Text>
          </View>

          <TextInput
            placeholder="Enter your goal weight"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
            style={styles.input}
            value={goalWeight}
            onChangeText={(value) =>
              handleDecimalInput(value, setGoalWeight)
            }
          />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              SAVE CHANGES
            </Text>
          )}
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>↪</Text>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          HEALTHMORE · YOUR HEALTH, YOUR JOURNEY
        </Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 45,
  },

  // HEADER
  header: {
    marginBottom: 25,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },

  title: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -1,
  },

  titleAccent: {
    color: COLORS.primary,
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 300,
  },

  // PROFILE
  profileSection: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 23,
    paddingHorizontal: 15,
    marginBottom: 30,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 13,
  },

  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },

  editImageBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },

  editImageIcon: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },

  username: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  profileCaption: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
  },

  // SECTION HEADERS
  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  // INPUT CARDS
  inputCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 13,
  },

  inputHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  inputLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  inputUnit: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  input: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 14,
  },

  // GOAL SELECTOR
  goalRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  goalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  goalSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  goalText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  goalTextSelected: {
    color: COLORS.white,
  },

  // SAVE BUTTON
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // LOGOUT
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(230, 92, 92, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(230, 92, 92, 0.30)",
    borderRadius: 14,
    paddingVertical: 15,
  },

  logoutIcon: {
    color: COLORS.danger,
    fontSize: 18,
    marginRight: 9,
  },

  logoutText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "800",
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 25,
  },
});
