import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../../config/api";

export default function Feedback() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendFeedback = async () => {
    try {
      // Check message
      if (!message.trim()) {
        Alert.alert(
          "Missing feedback",
          "Please enter your feedback before sending."
        );
        return;
      }

      if (message.trim().length < 5) {
        Alert.alert(
          "Feedback too short",
          "Please provide a little more detail."
        );
        return;
      }

      if (message.trim().length > 2000) {
        Alert.alert(
          "Feedback too long",
          "Feedback must be less than 2000 characters."
        );
        return;
      }

      setSending(true);

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

      // Send feedback
      const response = await fetch(
        `${BASE_URL}/api/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Failed to send feedback."
        );
      }

      // Clear input
      setMessage("");

      Alert.alert(
        "Thank you!",
        "Your feedback has been sent successfully."
      );
    } catch (err) {
      console.log("Feedback error:", err);

      Alert.alert(
        "Error",
        err.message || "Failed to send feedback."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View style={styles.container}>

          <Text style={styles.title}>
            Feedback
          </Text>

          

          <View style={styles.card}>
            <Text style={styles.description}>
            What do you think of our health and fitness app?
           
          </Text>
           <Text style={styles.description}>
           
            Your review will help us to givbe you a better experience
          </Text>

          <Text style={styles.label}>
             
          </Text>

            <TextInput
              style={styles.textArea}
              placeholder="Write your feedback here..."
              placeholderTextColor="#888"
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
              maxLength={2000}
            />

            <Text style={styles.characterCount}>
              {message.length}/2000
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              sending && styles.buttonDisabled,
            ]}
            onPress={handleSendFeedback}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                SEND FEEDBACK
              </Text>
            )}
          </TouchableOpacity>
          </View>
</TouchableWithoutFeedback>

</ImageBackground>

  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

 

  container: {
  flex: 1,
  padding: 20,
  paddingTop: 60,
  justifyContent: "flex-start",
},


  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    marginTop:20,
  },

  description: {
    fontSize: 16,
    lineHeight: 23,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 20,
    
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    
  },

  textArea: {
    height: 180,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#f8f8f8",
  },

  characterCount: {
    textAlign: "right",
    color: "#777",
    marginTop: 6,
    fontSize: 12,
  },

  button: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});