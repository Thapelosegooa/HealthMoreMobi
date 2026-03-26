import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "../../config/api";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.msg || "Login failed");
        return;
      }

      // Save token
      await SecureStore.setItemAsync("token", data.token);

      Alert.alert("Success", "Logged in!");

      // navigate to home screen
      router.replace("/home");

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/*title */}
        <Text style={styles.title}>HEALTHMORE</Text>

        {/*email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#8f8f8fff"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        {/*password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8f8f8fff"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {/* login Button */}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        {/* Signup */}
        <Pressable onPress={() => router.push("/register")}>
          <Text style={styles.signup}>Don’t have an account? Sign up</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 60,
    letterSpacing: 2,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#1DB954",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  signup: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
