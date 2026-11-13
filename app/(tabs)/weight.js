
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Weight() {
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    data: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWeight();
    fetchWeekly();
  }, []);

  // Fetch current weight
  const fetchWeight = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight`, {
        headers: { "x-auth-token": token },
      });

      if (!res.ok) throw new Error("Unable to fetch weight");

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.log("Weight fetch error:", error);
    }
  };

  // Fetch weekly weight history
  const fetchWeekly = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight/weekly`, {
        headers: { "x-auth-token": token },
      });

      if (!res.ok) throw new Error("Unable to fetch weekly weight");

      const json = await res.json();

      const labels = [];
      const weights = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        // Use local calendar dates
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        const dayStr = `${year}-${month}-${day}`;

        const record = json.find((r) => r.date === dayStr);

        // Only show actual recorded measurements
        if (record && Number(record.weight) > 0) {
          labels.push(
            d.toLocaleDateString("en-US", {
              weekday: "short",
            })
          );

          weights.push(Number(record.weight));
        }
      }

      setWeeklyData({ labels, data: weights });
    } catch (error) {
      console.log("Weekly weight error:", error);
    }
  };

  // Update current weight
  const setWeight = async () => {
    const weight = Number(newWeight);

    if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a valid weight in kilograms."
      );
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      const response = await fetch(`${BASE_URL}/api/weight/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ weight }),
      });

      if (!response.ok) {
        throw new Error("Unable to update weight");
      }

      setModalVisible(false);
      setNewWeight("");

      await fetchWeight();
      await fetchWeekly();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <ImageBackground
        source={require("../../assets/images/gradbackground.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <ActivityIndicator
          size="large"
          color="#20A65A"
          style={{ flex: 1 }}
        />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.heading}>
          <Text style={styles.header}>Weight</Text>

          <Text style={styles.subtitle}>
            Track your progress, one measurement at a time.
          </Text>
        </View>

        {/* CURRENT WEIGHT CARD */}
        <View style={styles.mainCard}>

          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardEyebrow}>
                CURRENT MEASUREMENT
              </Text>

              <Text style={styles.cardHeading}>
                Your weight
              </Text>
            </View>

            <View style={styles.weightIcon}>
              <Ionicons
                name="scale-outline"
                size={24}
                color="#20A65A"
              />
            </View>
          </View>

          <View style={styles.weightDisplay}>
            <Text style={styles.weightNumber}>
              {Number(data.weight).toFixed(1)}
            </Text>

            <Text style={styles.weightUnit}>kg</Text>
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              setNewWeight(String(data.weight));
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.updateButtonText}>
              Update weight
            </Text>
          </TouchableOpacity>

        </View>

        {/* WEIGHING ADVICE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Understanding your weight
          </Text>
        </View>

        <View style={styles.infoCard}>

          <View style={styles.infoHeader}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color="#20A65A"
              />
            </View>

            <Text style={styles.infoTitle}>
              Getting an accurate measurement
            </Text>
          </View>

          <Text style={styles.infoDescription}>
            Your weight naturally fluctuates throughout the day.
            Eating, drinking and water retention can temporarily
            increase the number on the scale. This doesn't
            necessarily mean you've gained body fat.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.infoSubtitle}>
            For more consistent results
          </Text>

          {/* TIP 1 */}
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="sunny-outline"
                size={19}
                color="#20A65A"
              />
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Weigh in the morning</Text>

              <Text style={styles.tipDescription}>
                Measure yourself shortly after waking up.
              </Text>
            </View>
          </View>

          {/* TIP 2 */}
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="restaurant-outline"
                size={19}
                color="#20A65A"
              />
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Before eating or drinking</Text>

              <Text style={styles.tipDescription}>
                Take your measurement before breakfast.
              </Text>
            </View>
          </View>

          {/* TIP 3 */}
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Ionicons
                name="scale-outline"
                size={19}
                color="#20A65A"
              />
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay consistent</Text>

              <Text style={styles.tipDescription}>
                Use the same scale on a hard, level surface
                under similar conditions.
              </Text>
            </View>
          </View>

        </View>

        {/* WEEKLY CHART */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Weight History
          </Text>

          <Text style={styles.sectionCaption}>
            LAST 7 DAYS
          </Text>
        </View>

        <View style={styles.chartCard}>

          <Text style={styles.chartSubtitle}>
            Your recorded measurements
          </Text>

          {weeklyData.data.length > 0 ? (
            <BarChart
              data={{
                labels: weeklyData.labels,
                datasets: [{ data: weeklyData.data }],
              }}
              width={SCREEN_WIDTH - 70}
              height={230}
              yAxisLabel=""
              yAxisSuffix=" kg"
              fromZero={false}
              showValuesOnTopOfBars={true}
              withInnerLines={true}
              chartConfig={{
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                fillShadowGradient: "#20A65A",
                fillShadowGradientOpacity: 1,
                decimalPlaces: 1,

                color: (opacity = 1) =>
                  `rgba(32, 166, 90, ${opacity})`,

                labelColor: (opacity = 1) =>
                  `rgba(100,100,100,${opacity})`,

                propsForBackgroundLines: {
                  stroke: "rgba(0,0,0,0.06)",
                  strokeDasharray: "",
                },

                barPercentage: 0.55,
              }}
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons
                name="analytics-outline"
                size={35}
                color="#BBBBBB"
              />

              <Text style={styles.emptyChartTitle}>
                No weight history yet
              </Text>

              <Text style={styles.emptyChartText}>
                Update your weight to start tracking your progress.
              </Text>
            </View>
          )}

        </View>

      </ScrollView>

      {/* UPDATE WEIGHT MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View style={styles.modalIcon}>
              <Ionicons
                name="scale-outline"
                size={27}
                color="#20A65A"
              />
            </View>

            <Text style={styles.modalTitle}>
              Update your weight
            </Text>

            <Text style={styles.modalDescription}>
              Enter your latest weight measurement.
            </Text>

            <View style={styles.modalInputContainer}>
              <TextInput
                placeholder="75.0"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
                style={styles.modalInput}
              />

              <Text style={styles.modalUnit}>kg</Text>
            </View>

            <TouchableOpacity
              onPress={setWeight}
              style={styles.modalSaveButton}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>
                  Save measurement
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCancelButton}
              disabled={saving}
            >
              <Text style={styles.modalCancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 45,
  },

  // HEADER
  heading: {
    marginBottom: 25,
  },

  header: {
    fontSize: 34,
    fontWeight: "700",
    color: "#171717",
    letterSpacing: -1.2,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    lineHeight: 21,
  },

  // MAIN WEIGHT CARD
  mainCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 26,
    padding: 22,
    marginBottom: 30,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1.5,
  },

  cardHeading: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },

  weightIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
  },

  weightDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginVertical: 24,
  },

  weightNumber: {
    fontSize: 57,
    fontWeight: "700",
    color: "#171717",
    letterSpacing: -2,
  },

  weightUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginLeft: 8,
  },

  updateButton: {
    backgroundColor: "#20A65A",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },

  updateButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // SECTION HEADINGS
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#202020",
    letterSpacing: -0.4,
  },

  sectionCaption: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
  },

  // INFORMATION CARD
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 19,
    borderRadius: 22,
    marginBottom: 30,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  infoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  infoDescription: {
    fontSize: 13,
    lineHeight: 22,
    color: "#777",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 19,
  },

  infoSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 17,
  },

  // TIPS
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 17,
  },

  tipIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#F1F8F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },

  tipDescription: {
    fontSize: 12,
    color: "#888",
    lineHeight: 19,
  },

  // CHART
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    borderRadius: 22,
    marginBottom: 80,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  chartSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
    marginLeft: 5,
  },

  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },

  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
  },

  emptyChartTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    marginTop: 12,
  },

  emptyChartText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 25,
  },

  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 25,
    alignItems: "center",
  },

  modalIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  modalDescription: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F5",
    borderRadius: 14,
    width: "100%",
    paddingHorizontal: 15,
    marginBottom: 13,
  },

  modalInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  modalUnit: {
    fontSize: 15,
    color: "#999",
    fontWeight: "600",
  },

  modalSaveButton: {
    width: "100%",
    backgroundColor: "#20A65A",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },

  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  modalCancelButton: {
    padding: 13,
    marginTop: 5,
  },

  modalCancelText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
  },

});
