import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BASE_URL } from "../../config/api";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    height: "",
    weight: "",
    goal: "lose",
    goalWeight: "",
  });
  
const handleChange = (key, value) => {
  setForm({ ...form, [key]: value });
};

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    Alert.alert("Error", "Passwords do not match");
    return;
  }
//api call
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        goal: form.goal,
        goalWeight: Number(form.goalWeight),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Error", data.msg || "Registration failed");
      return;
    }

    Alert.alert("Success", "Account created!");
    router.push("/login");

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
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.title}>HEALTHMORE</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8f8f8fff"
            style={styles.input}
            onChangeText={(v) => handleChange("email", v)}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#8f8f8fff"
            secureTextEntry
            style={styles.input}
            onChangeText={(v) => handleChange("password", v)}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#8f8f8fff"
            secureTextEntry
            style={styles.input}
            onChangeText={(v) => handleChange("confirmPassword", v)}
          />

          {/* age */}
          <TextInput
            placeholder="Age"
            placeholderTextColor="#8f8f8fff"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) => handleChange("age", v.replace(/[^0-9]/g, ""))}
            value={form.age}
          />

          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#8f8f8fff"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              handleChange("height", v.replace(/[^0-9]/g, ""))
            }
            value={form.height}
          />

          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#8f8f8fff"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              handleChange("weight", v.replace(/[^0-9]/g, ""))
            }
            value={form.weight}
          />

          {/* goal */}
          <View style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Goal</Text>

            <View style={styles.goalRow}>
              {["lose", "gain", "maintain"].map((g) => (
                <Pressable
                  key={g}
                  onPress={() => handleChange("goal", g)}
                  style={[
                    styles.goalButton,
                    form.goal === g && styles.goalSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalText,
                      form.goal === g && styles.goalTextSelected,
                    ]}
                  >
                    {g.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* goalweight*/}
          <TextInput
            placeholder="Goal Weight (kg)"
            placeholderTextColor="#8f8f8fff"
            keyboardType="numeric"
            style={styles.input}
            onChangeText={(v) =>
              handleChange("goalWeight", v.replace(/[^0-9]/g, ""))
            }
            value={form.goalWeight}
          />

          {/* register button */}
          <Pressable style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </Pressable>

          {/* login */}
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 25,
    letterSpacing: 2,
  },

  form: {
    width: "100%",
  },

  input: {
    borderWidth: 1,
    borderColor: "#666",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: "#000000ff",
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  dropdown: {
    marginBottom: 15,
  },

  dropdownLabel: {
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },

  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  goalButton: {
    flex: 1,
    padding: 10,
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
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  goalTextSelected: {
    color: "#fff",
  },

  button: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 15,
    color: "#fff",
    textDecorationLine: "underline",
  },
});
