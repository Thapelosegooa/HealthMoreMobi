import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";

export default function BMI() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const calculateBMI = () => {
    const h = Number(height) / 100; // cm → meters
    const w = Number(weight);

    if (!h || !w) return null;

    return (w / (h * h)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getCategory = () => {
    if (!bmi) return "";

    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>BMI Calculator</Text>

        <View style={styles.card}>
          {/* Result */}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Your BMI</Text>

            <Text style={styles.resultValue}>
              {bmi ? bmi : "--"}
            </Text>

            <Text style={styles.category}>
              {bmi ? getCategory() : ""}
            </Text>
          </View>

          {/* BMI BAR */}
          <View style={styles.bmiBarContainer}>
            <View style={styles.bmiBar}>
            {/* Underweight */}
            <View style={[styles.segment, { backgroundColor: "#3498db", flex: 18.5 }]} />

            {/* Normal */}
            <View style={[styles.segment, { backgroundColor: "#1DB954", flex: 6.5 }]} />

            {/* Overweight */}
            <View style={[styles.segment, { backgroundColor: "#f39c12", flex: 5 }]} />

            {/* Obese */}
            <View style={[styles.segment, { backgroundColor: "#e74c3c", flex: 10 }]} />
          </View>

            {/* Indicator */}
            {bmi && (
              <View
                style={[
                  styles.indicator,
                  { left: `${Math.min((bmi / 40) * 100, 100)}%` },
                ]}
              />
            )}
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
          <Text style={[styles.label, { left: "0%" }]}>Under</Text>
          <Text style={[styles.label, { left: "40%" }]}>Normal</Text>
          <Text style={[styles.label, { left: "65%" }]}>Over</Text>
          <Text style={[styles.label, { left: "90%" }]}>Obese</Text>
        </View>

          {/* INPUTS */}
          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            style={styles.input}
          />

          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            style={styles.input}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginTop: 50,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },

  resultCard: {
    backgroundColor: "#e7e7e7",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },

  resultLabel: {
    color: "#000",
    fontSize: 16,
  },

  resultValue: {
    color: "#000",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 5,
  },

  category: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#c5c5c5",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    color: "#000",
  },

  bmiBarContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  bmiBar: {
    flexDirection: "row",
    width: "100%",
    height: 12,
    borderRadius: 10,
    overflow: "hidden",
  },

  segment: {
    height: "100%",
  },

  indicator: {
    position: "absolute",
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#000",
  },

 labelsContainer: {
  position: "relative",
  width: "100%",
  marginTop: 6,
  height: 20,
},

label: {
  position: "absolute",
  fontSize: 10,
  color: "#555",
},
});