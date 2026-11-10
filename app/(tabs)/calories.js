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
  ActivityIndicator
} from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { Ionicons } from "@expo/vector-icons";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function Calories() {

  const [scanning, setScanning] = useState(false);
  const [scannedCalories, setScannedCalories] = useState(null);
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [weeklyData, setWeeklyData] = useState([]);

  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    fetchCalories();
    fetchWeekly();
  }, []);

  // current caloriesapi call
  const fetchCalories = async () => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/calories`, {
      headers: { "x-auth-token": token },
    });
    const json = await res.json();
    setData(json);
  };

  // open camera and gallery
  const openFoodScanner = () => {
  Alert.alert(
    "Scan Food",
    "How would you like to upload your food?",
    [
      {
        text: "Take Photo",
        onPress: () => captureFood()
      },
      {
        text: "Choose from Gallery",
        onPress: () => selectFood()
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]
  );
};

///////caputure food 
const captureFood = async () => {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Camera access is needed.");
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

/// select from gallery
const selectFood = async () => {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required", "Gallery access is needed.");
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

/// upload to ai model

const uploadFoodImage = async (image) => {
  try {
    setScanning(true);
    setScannedCalories(null);

    const token = await getToken();

    // Create a native file from the selected image URI
    const file = new File(image.uri);

    const formData = new FormData();

    formData.append("image", file);

    // Use Expo's native-compatible fetch implementation
    const response = await expoFetch(
      `${BASE_URL}/api/food/scan`,
      {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Food analysis failed"
      );
    }

    if (!Number.isInteger(result.calories)) {
      throw new Error("Invalid calorie result");
    }

    setScannedCalories(result.calories);

  } catch (error) {
    console.log("Food scan error:", error);

    Alert.alert(
      "Scan Failed",
      error.message || "Unable to analyse food."
    );

  } finally {
    setScanning(false);
  }
};



// add calories from ai to calorie intake
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
          amount: scannedCalories
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add calories");
    }

    setScannedCalories(null);

    await fetchCalories();
    await fetchWeekly();

    Alert.alert("Success", "Calories added to your daily intake!");

  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

  // weekly calories api call
  const fetchWeekly = async () => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/api/calories/weekly`, {
      headers: { "x-auth-token": token },
    });
    const json = await res.json();
    const last7Days = [];
    const consumed = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      last7Days.push(dayStr.slice(5)); // MM-DD
      const dayRecord = json.find((r) => r.date === dayStr);
      consumed.push(dayRecord ? dayRecord.consumed : 0);
    }
    setWeeklyData({ labels: last7Days, data: consumed });
  };

  // set daily calories api call
  const setCalories = async () => {
    const token = await getToken();
    await fetch(`${BASE_URL}/api/calories/set`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ dailyLimit: Number(newLimit) }),
    });
    setModalVisible(false);
    setNewLimit("");
    fetchCalories();
  };

  // add calories api call
  const addCalories = async () => {
    const token = await getToken();
    await fetch(`${BASE_URL}/api/calories/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ amount: Number(addAmount) }),
    });
    setAddAmount("");
    fetchCalories();
    fetchWeekly();
  };

  // clear calories api call
  const clearCalories = () => {
    Alert.alert(
      "Clear Calories",
      "Are you sure you want to reset today's calories?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await getToken();
              await fetch(`${BASE_URL}/api/calories/clear`, {
                method: "POST",
                headers: { "x-auth-token": token },
              });
              fetchCalories();
              fetchWeekly();
            } catch (err) {
              console.log(err);
              Alert.alert("Error", "Failed to clear calories");
            }
          },
        },
      ]
    );
  };

  if (!data) return null;

  const left = data.dailyLimit - data.consumed;

  return (
    <ImageBackground
          source={require("../../assets/images/gradbackground.png")}
          style={styles.background}
          resizeMode="cover"
        >
          
    <ScrollView style={styles.container}>
      {/*calories left card */}
      <View style={styles.heading}>
                  <Text style={styles.header}>Calorie Logger</Text>
                </View>


      <View style={styles.calCard}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.card}
      >
        <Text style={styles.cardLabel}>Calories Left</Text>
        <Text style={styles.cardValue}>{left}</Text>
      </TouchableOpacity>

     

      {/* set daily calories */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Calories</Text>
            <TextInput
              placeholder="2000"
               placeholderTextColor="#888"
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={setCalories}
              style={[styles.button, { backgroundColor: "#1DB954" }]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      
{/* FOOD SCANNER */}
<View style={styles.scannerCard}>


  <TouchableOpacity
    style={styles.scanButton}
    onPress={openFoodScanner}
    disabled={scanning}
  >
    <Ionicons
  name="camera-outline"
  size={32}
  color="#1DB954"
  style={styles.cameraIcon}
/>

    <View style={{ flex: 1 }}>
      <Text style={styles.scanTitle}>
        Scan a Meal
      </Text>

      
    </View>

    <Text style={styles.scanArrow}>›</Text>
  </TouchableOpacity>

  {/* ANALYSING */}
  {scanning && (
    <View style={styles.scanningContainer}>
      <ActivityIndicator size="large" color="#1DB954" />

      <Text style={styles.scanningText}>
        Analysing your food...
      </Text>
    </View>
  )}

  {/* SCAN RESULT */}
  {scannedCalories !== null && !scanning && (
    <View style={styles.scanResult}>

      <Text style={styles.resultLabel}>
        Estimated Calories
      </Text>

      <Text style={styles.resultCalories}>
        {scannedCalories} kcal
      </Text>

      <TouchableOpacity
        style={styles.addScannedButton}
        onPress={addScannedCalories}
      >
        <Text style={styles.buttonText}>
          Add to Daily Intake
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setScannedCalories(null)}
      >
        <Text style={styles.cancelScan}>
          Discard Result
        </Text>
      </TouchableOpacity>

    </View>
  )}

</View>

      <TextInput
        placeholder="500"
         placeholderTextColor="#888"
        keyboardType="numeric"
        value={addAmount}
        onChangeText={setAddAmount}
        style={styles.input}
      />

      
      <TouchableOpacity
        onPress={addCalories}
        style={[styles.button, { backgroundColor: "#1DB954" }]}
      >

        
        <Text style={styles.buttonText}>Add Calories</Text>
      </TouchableOpacity>

       {/* clear calories */}
      <TouchableOpacity
        onPress={clearCalories}
        style={[styles.button, { backgroundColor: "#ff4444" }]}
      >
        <Text style={styles.buttonText}>Clear Day Intake</Text>
      </TouchableOpacity>

      </View>

      {/* calorie chart */}
      {weeklyData.data && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Weekly Calories</Text>
          <BarChart
          data={{
            labels: weeklyData.labels,
            datasets: [{ data: weeklyData.data }],
          }}
          width={screenWidth - 30}
          height={280}
          yAxisLabel=""
          showValuesOnTopOfBars={true}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            fillShadowGradient: "#1DB954",
            fillShadowGradientOpacity: 1,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(29, 185, 84, ${opacity})`, 
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`, 
            propsForBackgroundLines: {
            stroke: "rgba(0, 0, 0, 0.1)", 
            },
          }}
          style={{
            borderRadius: 16,paddingRight: 1
          }}
        />
        </View>
      )}
    </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  heading: {
    paddingHorizontal: 0,
    marginTop: 50,
  },
  header: {
    textAlign: 'left',
    color: "#000000", 
    fontSize: 30, 
    fontWeight: "bold"
  },
  container: { 
    flex: 1, 
    padding: 20, 
   // backgroundColor: "#ffffff" 
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 15,
    marginTop:20,
    marginBottom: 20,
    alignItems: "center",
  },
  cardLabel: { color: "#aaa", fontSize: 16 },
  cardValue: { color: "#fff", fontSize: 34, fontWeight: "bold" },
  button: { padding: 12, borderRadius: 20, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#c5c5c5",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: "#000",
  },
  calCard: {
    marginTop:20,
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgb(255, 255, 255)", 
    shadowColor: "#00000070",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
},
  sectionTitle: { color: "#000000", fontSize: 18, marginVertical: 15 },
  chartCard: {
    justifyContent: "center",
    marginTop: 30,
    padding: 10,
    borderRadius: 20,
    shadowColor: "#00000070",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
    
    backgroundColor: "rgb(255, 255, 255)", 
},


scannerCard: {
  backgroundColor: "#ffffff",
  marginTop: 0,
  marginBottom:20,
  padding: 0,
  borderRadius: 20,
},

scanButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f3f8f4",
  padding: 16,
  borderRadius: 15,
  marginTop: 5,
},

cameraIcon: {
  fontSize: 32,
  marginRight: 15,
},

scanTitle: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#222",
},


scanArrow: {
  fontSize: 28,
  color: "#1DB954",
},

scanningContainer: {
  alignItems: "center",
  padding: 25,
},

scanningText: {
  marginTop: 12,
  color: "#555",
  fontSize: 14,
},

scanResult: {
  alignItems: "center",
  backgroundColor: "#f3f8f4",
  padding: 20,
  borderRadius: 15,
  marginTop: 15,
},

resultLabel: {
  color: "#666",
  fontSize: 14,
},

resultCalories: {
  fontSize: 38,
  fontWeight: "bold",
  color: "#1DB954",
  marginVertical: 8,
},

addScannedButton: {
  backgroundColor: "#1DB954",
  padding: 13,
  borderRadius: 20,
  width: "100%",
  alignItems: "center",
  marginTop: 10,
},

cancelScan: {
  color: "#888",
  marginTop: 15,
},



});