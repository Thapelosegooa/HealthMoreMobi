import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Alert, ImageBackground
} from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function Calories() {
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

      {/* add calories */}
      <Text style={styles.sectionTitle}>Add Calories</Text>
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
    marginTop:50,
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgb(255, 255, 255)", 
},
  sectionTitle: { color: "#000000", fontSize: 18, marginVertical: 15 },
  chartCard: {
    justifyContent: "center",
    marginTop: 30,
    padding: 10,
    borderRadius: 20,
    
    backgroundColor: "rgb(255, 255, 255)", 
},


});