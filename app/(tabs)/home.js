import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";

export default function Home() {
  const router = useRouter();
  const [calories, setCalories] = useState(null);
  const [weight, setWeight] = useState(null);

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

  //fetch weight details
  const fetchWeight = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight`, {
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      setWeight(data.weight);
    } catch (err) {
      console.log(err);
    }
  };

  // read calories api
  useFocusEffect(
    useCallback(() => {
      fetchCalories();
      fetchWeight();
    }, []),
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
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
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

        {/* weight card */}
        <View style={styles.otherContent}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/weight")}
            style={styles.weightCard}
          >
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>Current Weight:</Text>

              <Text style={styles.weightValue}>
                {weight ? `${weight} kg` : "--"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/weight")}
            style={styles.weightCard}
          >
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>Body Fat%</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = {
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    //backgroundColor: "#ffffff",
    alignItems: "center",
  },
  circleContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    borderColor: "#1DB954",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesNumber: {
    color: "#000000",
    fontSize: 36,
    fontWeight: "bold",
  },
  caloriesUnit: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "bold",
  },
  caloriesLeft: {
    color: "#1DB954",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "bold",
  },
  dayLabel: {
    color: "#505050",
    fontSize: 18,
    marginTop: 12,
  },
  otherContent: {
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  weightCard: {
    width: 360,
    height: 70,
    padding: 15,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 15,
    //alignItems: "center",
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 100,
  },
  weightLabel: { color: "#000000", fontSize: 20, fontWeight: "bold" },
  weightValue: { color: "#000000", fontSize: 20, fontWeight: "bold" },
};
