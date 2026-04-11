import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform 
} from "react-native";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  //Load user from storage
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.log("User load error:", err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  //Pick profile image
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Allow access to gallery");
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
        await AsyncStorage.setItem("profileImage", selectedImage);
      }
    } catch (err) {
      console.log("Image picker error:", err);
    }
  };

  //Load saved image
  const loadImage = async () => {
    const savedImage = await AsyncStorage.getItem("profileImage");
    if (savedImage) setImage(savedImage);
  };

  useEffect(() => {
    loadImage();
  }, []);

  //Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("profileImage");

      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/login");
    } catch (err) {
      console.log("Logout error:", err);
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profile}>
          {/* Profile Image */}
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../../assets/images/profile.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Username */}
          <Text style={styles.username}>{user?.email || "No user found"}</Text>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/profile/editProfile")}
        >
          <Text style={styles.label}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/profile/feedback")}
        >
          <Text style={styles.label}>Send Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/(tabs)/profile/progress")}
        >
          <Text style={styles.label}>My Reports</Text>
        </TouchableOpacity>

        {/*Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/*App Info*/}
        <View style={styles.appCard}>
          <Text style={styles.appTitle}>HealthMore</Text>

          <Text style={styles.appVersion}>Version 1.0</Text>
          <Text style={styles.appVersion}>built by thapelo segooa</Text>

          {/* <Text style={styles.appDesc}>
          HealthMore helps you track calories, monitor weight, and improve your fitness journey.
        </Text>*/}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "500",
    letterSpacing: 1,
    color: "#000",
    marginTop: 50,
    marginBottom: 20,
  },
  profile: {
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
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
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },

  logoutBtn: {
    marginTop: 0,
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  appCard: {
    marginTop: 60,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },

  appTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },

  appVersion: {
    fontSize: 12,
    color: "#666",
    marginBottom: 0,
  },

  appDesc: {
    fontSize: 12,
    color: "#333",
    lineHeight: 20,
  },
});
