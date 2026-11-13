
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { BarChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Calories() {
  const [scanning, setScanning] = useState(false);
  const [scannedCalories, setScannedCalories] = useState(null);
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    data: [],
  });

  useEffect(() => {
    fetchCalories();
    fetchWeekly();
  }, []);

  // Fetch current calorie information
  const fetchCalories = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/calories`, {
        headers: { "x-auth-token": token },
      });

      if (!res.ok) throw new Error("Unable to fetch calories");

      const json = await res.json();
      setData(json);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Fetch weekly calorie information
  const fetchWeekly = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/calories/weekly`, {
        headers: { "x-auth-token": token },
      });

      if (!res.ok) throw new Error("Unable to fetch weekly data");

      const json = await res.json();

      const labels = [];
      const consumed = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        const dayStr = d.toLocaleDateString("en-CA");
        labels.push(
          d.toLocaleDateString("en-US", { weekday: "short" })
        );

        const record = json.find((r) => r.date === dayStr);
        consumed.push(record ? record.consumed : 0);
      }

      setWeeklyData({ labels, data: consumed });
    } catch (error) {
      console.log("Weekly calories error:", error);
    }
  };

  // Open food scanner options
  const openFoodScanner = () => {
    Alert.alert("Scan a Meal", "Choose an image source", [
      {
        text: "Take Photo",
        onPress: captureFood,
      },
      {
        text: "Photo Library",
        onPress: selectFood,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Capture food image
  const captureFood = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera access is needed.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadFoodImage(result.assets[0]);
    }
  };

  // Select food image
  const selectFood = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery access is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadFoodImage(result.assets[0]);
    }
  };

  // Upload image to AI
  const uploadFoodImage = async (image) => {
    try {
      setScanning(true);
      setScannedCalories(null);

      const token = await getToken();
      const file = new File(image.uri);
      const formData = new FormData();

      formData.append("image", file);

      const response = await expoFetch(
        `${BASE_URL}/api/food/scan`,
        {
          method: "POST",
          headers: { "x-auth-token": token },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Food analysis failed");
      }

      if (!Number.isInteger(result.calories)) {
        throw new Error("Invalid calorie result");
      }

      setScannedCalories(result.calories);
    } catch (error) {
      Alert.alert("Scan Failed", error.message);
    } finally {
      setScanning(false);
    }
  };

  // Add AI scanned calories
  const addScannedCalories = async () => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/api/calories/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            amount: scannedCalories,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add calories");
      }

      setScannedCalories(null);

      await fetchCalories();
      await fetchWeekly();

      Alert.alert("Success", "Calories added successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Set daily calorie target
  const setCalories = async () => {
    const amount = Number(newLimit);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid daily calorie target.");
      return;
    }

    try {
      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/api/calories/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ dailyLimit: amount }),
        }
      );

      if (!response.ok) throw new Error("Failed to update target");

      setModalVisible(false);
      setNewLimit("");
      await fetchCalories();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Manually add calories
  const addCalories = async () => {
    const amount = Number(addAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid calorie amount.");
      return;
    }

    try {
      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/api/calories/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) throw new Error("Failed to add calories");

      setAddAmount("");
      await fetchCalories();
      await fetchWeekly();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Clear today's calories
  const clearCalories = () => {
    Alert.alert(
      "Reset Daily Intake",
      "Are you sure you want to clear today's calories?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();

              const response = await fetch(
                `${BASE_URL}/api/calories/clear`,
                {
                  method: "POST",
                  headers: { "x-auth-token": token },
                }
              );

              if (!response.ok) throw new Error("Reset failed");

              await fetchCalories();
              await fetchWeekly();
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
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
          color="#1DB954"
          style={{ flex: 1 }}
        />
      </ImageBackground>
    );
  }

  const left = data.dailyLimit - data.consumed;
  const progress = data.dailyLimit > 0
    ? Math.min(data.consumed / data.dailyLimit, 1)
    : 0;

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
          <Text style={styles.header}>Calories</Text>
          <Text style={styles.subtitle}>
            Your daily nutrition overview
          </Text>
        </View>

        {/* MAIN CALORIE CARD */}
        <View style={styles.mainCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardEyebrow}>
                DAILY SUMMARY
              </Text>
              <Text style={styles.cardHeading}>
                Calories remaining
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons
                name="options-outline"
                size={21}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calorieDisplay}>
            <Text style={styles.calorieNumber}>
              {left.toLocaleString()}
            </Text>
            <Text style={styles.calorieUnit}>kcal left</Text>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Consumed</Text>
              <Text style={styles.statValue}>
                {data.consumed.toLocaleString()} kcal
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View>
              <Text style={styles.statLabel}>Daily goal</Text>
              <Text style={styles.statValue}>
                {data.dailyLimit.toLocaleString()} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* AI FOOD SCANNER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Food Scanner</Text>
          <Text style={styles.sectionCaption}>AI POWERED</Text>
        </View>

        <View style={styles.scannerCard}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={openFoodScanner}
            disabled={scanning}
            activeOpacity={0.75}
          >
            <View style={styles.scanIconContainer}>
              <Ionicons
                name="camera-outline"
                size={27}
                color="#20A65A"
              />
            </View>

            <View style={styles.scanTextContainer}>
              <Text style={styles.scanTitle}>
                Scan your meal
              </Text>
              <Text style={styles.scanDescription}>
                Take a photo to estimate calories
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#A0A0A0"
            />
          </TouchableOpacity>

          {scanning && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color="#20A65A" />
              <Text style={styles.scanningText}>
                Analysing your meal...
              </Text>
            </View>
          )}

          {scannedCalories !== null && !scanning && (
            <View style={styles.scanResult}>
              <Text style={styles.resultLabel}>
                Estimated calories
              </Text>

              <Text style={styles.resultCalories}>
                {scannedCalories.toLocaleString()} kcal
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={addScannedCalories}
              >
                <Text style={styles.primaryButtonText}>
                  Add to daily intake
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScannedCalories(null)}
              >
                <Text style={styles.discardText}>Discard result</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* MANUAL LOGGING */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.manualInputRow}>
            <View style={styles.manualInput}>
              <TextInput
                placeholder="Enter calories"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={addAmount}
                onChangeText={setAddAmount}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={addCalories}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={23} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputHint}>
            Manually record your food intake
          </Text>
        </View>

        {/* WEEKLY CHART */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <Text style={styles.sectionCaption}>LAST 7 DAYS</Text>
        </View>

        {weeklyData.data.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartSubtitle}>
              Daily calorie consumption
            </Text>

            <BarChart
              data={{
                labels: weeklyData.labels,
                datasets: [{ data: weeklyData.data }],
              }}
              width={SCREEN_WIDTH - 70}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars={false}
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                fillShadowGradient: "#24AD63",
                fillShadowGradientOpacity: 1,
                decimalPlaces: 0,
                color: (opacity = 1) =>
                  `rgba(36, 173, 99, ${opacity})`,
                labelColor: (opacity = 1) =>
                  `rgba(80, 80, 80, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: "rgba(0,0,0,0.06)",
                  strokeDasharray: "",
                },
                barPercentage: 0.55,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* RESET */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={clearCalories}
        >
          <Ionicons
            name="refresh-outline"
            size={17}
            color="#777"
          />
          <Text style={styles.resetText}>
            Reset today's intake
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* SET DAILY CALORIES MODAL */}
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
                name="flame-outline"
                size={27}
                color="#20A65A"
              />
            </View>

            <Text style={styles.modalTitle}>
              Daily calorie goal
            </Text>

            <Text style={styles.modalDescription}>
              Set your target for daily calorie consumption.
            </Text>

            <TextInput
              placeholder="2000"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
              style={styles.modalInput}
            />

            <TouchableOpacity
              onPress={setCalories}
              style={styles.modalSaveButton}
            >
              <Text style={styles.primaryButtonText}>
                Save goal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
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
    marginTop: 5,
    letterSpacing: 0.2,
  },

  // MAIN CARD
  mainCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },

  editButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },

  calorieDisplay: {
    alignItems: "center",
    marginVertical: 24,
  },

  calorieNumber: {
    fontSize: 55,
    fontWeight: "700",
    letterSpacing: -2,
    color: "#171717",
  },

  calorieUnit: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#EDEFEF",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#25AD63",
    borderRadius: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#EEEEEE",
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#202020",
    letterSpacing: -0.4,
  },

  sectionCaption: {
    fontSize: 10,
    color: "#999",
    fontWeight: "700",
    letterSpacing: 1,
  },

  // SCANNER
  scannerCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 22,
    padding: 13,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
  },

  scanIconContainer: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor: "#EAF7EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  scanTextContainer: {
    flex: 1,
  },

  scanTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  scanDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },

  scanningContainer: {
    alignItems: "center",
    padding: 22,
  },

  scanningText: {
    marginTop: 12,
    fontSize: 13,
    color: "#777",
  },

  scanResult: {
    alignItems: "center",
    backgroundColor: "#F5FAF6",
    padding: 20,
    borderRadius: 17,
    marginTop: 12,
  },

  resultLabel: {
    fontSize: 13,
    color: "#777",
  },

  resultCalories: {
    fontSize: 35,
    fontWeight: "700",
    color: "#20A65A",
    marginVertical: 8,
  },

  // BUTTONS
  primaryButton: {
    backgroundColor: "#20A65A",
    width: "100%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  discardText: {
    color: "#999",
    marginTop: 16,
    fontSize: 13,
  },

  // MANUAL INPUT
  inputCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },

  manualInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  manualInput: {
    flex: 1,
  },

  input: {
    backgroundColor: "#F5F6F5",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: "#222",
  },

  addButton: {
    width: 49,
    height: 49,
    backgroundColor: "#20A65A",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  inputHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 10,
  },

  // CHART
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 14,
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  chartSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
    marginLeft: 5,
  },

  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },

  // RESET
  resetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    marginTop: 5,
  },

  resetText: {
    fontSize: 13,
    color: "#777",
    marginLeft: 7,
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
    textAlign: "center",
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 19,
  },

  modalInput: {
    width: "100%",
    backgroundColor: "#F5F6F5",
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
  },

  modalSaveButton: {
    width: "100%",
    backgroundColor: "#20A65A",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
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
