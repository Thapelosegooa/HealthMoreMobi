import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  ImageBackground,
} from "react-native";

export default function Converter() {
  const [value, setValue] = useState("");
  const [isKcalToKj, setIsKcalToKj] = useState(true);

  const convert = () => {
    const num = Number(value);
    if (!num) return 0;

    return isKcalToKj
      ? (num * 4.184).toFixed(2)
      : (num / 4.184).toFixed(2);
  };

  return (
    <ImageBackground
          source={require("../../assets/images/gradbackground.png")}
          style={styles.background}
          resizeMode="cover"
        >

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Converter</Text>

        {/* Card */}
        <View style={styles.card}>

            {/* Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {isKcalToKj ? "kcal → kJ" : "kJ → kcal"}
            </Text>

            <Switch
            value={isKcalToKj}
            onValueChange={setIsKcalToKj}
            trackColor={{ false: "#767577", true: "#1DB954" }}
            thumbColor={isKcalToKj ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            />
          </View>

          

          {/* Result */}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {isKcalToKj ? "kJ" : "kcal"}
            </Text>

            <Text style={styles.resultValue}>
              {value ? convert() : "--"}
            </Text>
          </View>

          {/* Input */}
          <TextInput
            placeholder={isKcalToKj ? "Enter kcal" : "Enter kJ"}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
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
    color: "#000000",
    marginBottom: 20,
    marginTop: 50,
  },

  card: {
    backgroundColor: "rgb(255, 255, 255)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#c5c5c5",
    padding: 14,
    borderRadius: 12,
    marginTop: 30,
    color: "#000000",
    backgroundColor: "#ffffff",
  },

  resultCard: {
    backgroundColor: "#e7e7e7",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 25,
  },

  resultLabel: {
    color: "#000000",
    fontSize: 16,
  },

  resultValue: {
    color: "#000000",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 5,
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggleText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
});