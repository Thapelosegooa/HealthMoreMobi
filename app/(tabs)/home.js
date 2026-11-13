
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Home() {
  const router = useRouter();
  const [calories, setCalories] = useState(null);
  const [weight, setWeight] = useState(null);

  const fetchCalories = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/calories`, {
        headers: { "x-auth-token": token },
      });

      const data = await res.json();
      setCalories(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchWeight = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight`, {
        headers: { "x-auth-token": token },
      });

      const data = await res.json();
      setWeight(data.weight);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCalories();
      fetchWeight();
    }, [])
  );

  const caloriesLeft = calories
    ? Math.max(0, calories.dailyLimit - calories.consumed)
    : 0;

  const calorieGoal = calories?.dailyLimit || 2000;
  const calorieProgress = calories
    ? Math.min(calories.consumed / calorieGoal, 1)
    : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* HEADER */}
          <View style={styles.header}>
            <View>
              
              <Text style={styles.headerTitle}>Good day.</Text>
              <Text style={styles.date}>{today}</Text>
            </View>

          
          </View>

          {/* CALORIES SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily overview</Text>
            <Text style={styles.sectionSubtitle}>TODAY</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/calories")}
            style={styles.calorieCard}
          >
            <View style={styles.calorieTop}>
              <View>
                <Text style={styles.cardEyebrow}>
                  CALORIES REMAINING
                </Text>
                <View style={styles.calorieNumberRow}>
                  <Text style={styles.calorieNumber}>
                    {caloriesLeft.toLocaleString()}
                  </Text>
                  <Text style={styles.kcal}>kcal</Text>
                </View>
                <Text style={styles.calorieDescription}>
                  Keep moving towards your goal.
                </Text>
              </View>

              <View style={styles.calorieIcon}>
                <MaterialCommunityIcons
                  name="fire"
                  size={27}
                  color="#1DB954"
                />
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calorieProgress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.calorieFooter}>
              <Text style={styles.progressLabel}>
                {calories?.consumed || 0} consumed
              </Text>
              <Text style={styles.progressLabel}>
                {calorieGoal} kcal goal
              </Text>
            </View>

            <View style={styles.cardLink}>
              <Text style={styles.linkText}>View calorie details</Text>
              <MaterialCommunityIcons
                name="arrow-up-right"
                size={18}
                color="#1DB954"
              />
            </View>
          </TouchableOpacity>

          {/* BODY METRICS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body metrics</Text>
            <Text style={styles.sectionSubtitle}>YOUR HEALTH</Text>
          </View>

          {/* WEIGHT */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/weight")}
            style={styles.metricCard}
          >
            <View style={styles.metricIcon}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={25}
                color="#168B4A"
              />
            </View>

            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>Current weight</Text>
              <Text style={styles.metricSubtext}>
                Your latest measurement
              </Text>
            </View>

            <View style={styles.metricRight}>
              <Text style={styles.metricValue}>
                {weight ? `${weight}` : "--"}
              </Text>
              <Text style={styles.metricUnit}>kg</Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#AAB4AD"
            />
          </TouchableOpacity>

          {/* BODY FAT */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/bodyweight")}
            style={styles.metricCard}
          >
            <View style={styles.metricIcon}>
              <MaterialCommunityIcons
                name="human"
                size={25}
                color="#168B4A"
              />
            </View>

            <View style={styles.metricInfo}>
              <Text style={styles.metricLabel}>Body composition</Text>
              <Text style={styles.metricSubtext}>
                Track your body fat percentage
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#AAB4AD"
            />
          </TouchableOpacity>

          {/* TOOLS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health tools</Text>
            <Text style={styles.sectionSubtitle}>QUICK ACCESS</Text>
          </View>

          <View style={styles.toolsRow}>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/converter")}
              style={styles.toolCard}
            >
              <View style={styles.toolIcon}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={27}
                  color="#168B4A"
                />
              </View>

              <Text style={styles.toolTitle}>Kcal converter</Text>
              <Text style={styles.toolDescription}>
                Convert energy units
              </Text>

              <View style={styles.toolArrow}>
                <MaterialCommunityIcons
                  name="arrow-up-right"
                  size={18}
                  color="#168B4A"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/bmi")}
              style={styles.toolCard}
            >
              <View style={styles.toolIcon}>
                <MaterialCommunityIcons
                  name="human"
                  size={27}
                  color="#168B4A"
                />
              </View>

              <Text style={styles.toolTitle}>BMI calculator</Text>
              <Text style={styles.toolDescription}>
                Check your BMI
              </Text>

              <View style={styles.toolArrow}>
                <MaterialCommunityIcons
                  name="arrow-up-right"
                  size={18}
                  color="#168B4A"
                />
              </View>
            </TouchableOpacity>

          </View>

          <Text style={styles.bottomText}>
            
          </Text>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    marginTop:30,
  },

  greeting: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#168B4A",
    marginBottom: 7,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#17251C",
    letterSpacing: -1,
  },

  date: {
    fontSize: 14,
    color: "#68776D",
    marginTop: 5,
    fontWeight: "500",
  },

  

  // SECTION HEADINGS
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#17251C",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#829087",
    letterSpacing: 1.2,
  },

  // CALORIE CARD
  calorieCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 26,
    padding: 22,
    marginBottom: 30,

    shadowColor: "#183B26",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  calorieTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#819087",
    letterSpacing: 1.5,
  },

  calorieNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },

  calorieNumber: {
    fontSize: 47,
    fontWeight: "800",
    color: "#17251C",
    letterSpacing: -2,
  },

  kcal: {
    fontSize: 15,
    color: "#829087",
    fontWeight: "600",
    marginLeft: 7,
  },

  calorieDescription: {
    fontSize: 12,
    color: "#89958D",
    marginTop: 3,
  },

  calorieIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#EAF0EB",
    borderRadius: 10,
    marginTop: 24,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#1DB954",
    borderRadius: 10,
  },

  calorieFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  progressLabel: {
    fontSize: 11,
    color: "#849087",
    fontWeight: "600",
  },

  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EDF1ED",
    marginTop: 19,
    paddingTop: 15,
  },

  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#168B4A",
  },

  // METRIC CARDS
  metricCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    minHeight: 82,

    shadowColor: "#183B26",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  metricIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  metricInfo: {
    flex: 1,
  },

  metricLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#26352B",
  },

  metricSubtext: {
    fontSize: 11,
    color: "#929D95",
    marginTop: 4,
  },

  metricRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },

  metricValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#17251C",
  },

  metricUnit: {
    fontSize: 10,
    color: "#89958D",
    fontWeight: "600",
  },

  // HEALTH TOOLS
  toolsRow: {
    flexDirection: "row",
    gap: 13,
  },

  toolCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 22,
    padding: 17,
    minHeight: 165,

    shadowColor: "#183B26",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  toolIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#EAF7EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  toolTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#26352B",
  },

  toolDescription: {
    fontSize: 11,
    color: "#89958D",
    marginTop: 5,
  },

  toolArrow: {
    position: "absolute",
    top: 17,
    right: 15,
  },

  bottomText: {
    textAlign: "center",
    marginTop: 32,
    marginBottom: 32,
    fontSize: 12,
    color: "#708075",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
