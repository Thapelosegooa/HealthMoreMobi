import { View, Text, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";

export default function Home() {
  const router = useRouter();
  const [calories, setCalories] = useState(null);

  const fetchCalories = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/calories`, {
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      setCalories(data);
    } catch (err) {
      console.log(err);
    }
  };

  // read calories api
  useFocusEffect(
    useCallback(() => {
      fetchCalories();
    }, [])
  );

  const caloriesLeft = calories
    ? Math.max(0, calories.dailyLimit - calories.consumed)
    : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      {/* calorie ring */}
      <View style={styles.circleContainer}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/calories")}
          style={styles.circle}
        >
          <Text style={styles.caloriesNumber}>{caloriesLeft}</Text>
          <Text style={styles.caloriesUnit}>kcal</Text>
          <Text style={styles.caloriesLeft}>Left</Text>
        </TouchableOpacity>

        {/* day */}
        <Text style={styles.dayLabel}>{today}</Text>
      </View>

      {/* Other content below circle */}
      <View style={styles.otherContent}>
        <Text style={{ color: "#000000", fontSize: 16 }}>
          {/* Add more cards or components here */}
          Other health info here
        </Text>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  circleContainer: {
    alignItems: "center",
    marginTop: 80, 
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    borderColor: "#1DB954",
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesNumber: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  caloriesUnit: {
    color: "#aaa",
    fontSize: 16,
  },
  caloriesLeft: {
    color: "#1DB954",
    fontSize: 16,
    marginTop: 4,
  },
  dayLabel: {
    color: "#aaa",
    fontSize: 18,
    marginTop: 12,
  },
  otherContent: {
    marginTop: 40, 
    width: "100%",
    paddingHorizontal: 20,
  },
};