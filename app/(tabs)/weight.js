import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { getToken } from "../../utils/getToken";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Weight() {
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [weeklyData, setWeeklyData] = useState([]);

  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    fetchWeight();
    fetchWeekly();
  }, []);

  //get current weight
  const fetchWeight = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight`, {
        headers: { "x-auth-token": token },
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.log(err);
    }
  };

  //weekly weight
  const fetchWeekly = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${BASE_URL}/api/weight/weekly`, {
        headers: { "x-auth-token": token },
      });

      const json = await res.json();

      const last7Days = [];
      const weights = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split("T")[0];

        last7Days.push(dayStr.slice(5));

        const record = json.find((r) => r.date === dayStr);
        weights.push(record ? record.weight : 0);
      }

      setWeeklyData({ labels: last7Days, data: weights });
    } catch (err) {
      console.log(err);
    }
  };

  //update weight
  const setWeight = async () => {
    try {
      const token = await getToken();

      await fetch(`${BASE_URL}/api/weight/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ weight: Number(newWeight) }),
      });

      setModalVisible(false);
      setNewWeight("");
      fetchWeight();
      fetchWeekly();
    } catch (err) {
      console.log(err);
    }
  };

  if (!data) return null;

  return (
    <ImageBackground
              source={require("../../assets/images/gradbackground.png")}
              style={styles.background}
              resizeMode="cover"
            >
    <ScrollView style={styles.container}>
      <View style={styles.heading}>
         <Text style={styles.header}>Weight Logger</Text>
     </View>
     

      <View style={styles.weightCard}>
      {/* current weight card */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.card}
      >
        <Text style={styles.cardLabel}>Current Weight</Text>
        <Text style={styles.cardValue}>{data.weight} kg</Text>
      </TouchableOpacity>
      <View style={styles.infoHeader}>
    <Ionicons
      name="information-circle-outline"
      size={23}
      color="#1DB954"
    />

    <Text style={styles.infoTitle}>
      Getting an accurate weight
    </Text>
  </View>

  <Text style={styles.infoDescription}>
    Your weight naturally fluctuates throughout the day.
    Eating, drinking and water retention can temporarily
    increase the number on the scale. This doesn't
    necessarily mean you've gained body fat.
  </Text>

  <View style={styles.infoDivider} />

  <Text style={styles.infoSubtitle}>
    For more consistent results:
  </Text>

  <View style={styles.infoTip}>
    <Ionicons name="sunny-outline" size={18} color="#1DB954" />
    <Text style={styles.infoTipText}>
      Weigh yourself in the morning, shortly after waking up.
    </Text>
  </View>



  <View style={styles.infoTip}>
    <Ionicons name="restaurant-outline" size={18} color="#1DB954" />
    <Text style={styles.infoTipText}>
      Weigh yourself before eating or drinking.
    </Text>
  </View>

  <View style={styles.infoTip}>
    <Ionicons name="scale-outline" size={18} color="#1DB954" />
    <Text style={styles.infoTipText}>
      Use the same scale, on a hard, level surface,
      under similar conditions each time.
    </Text>
  </View>

  

      {/* modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Weight</Text>

            <TextInput
              placeholder="75"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
              style={styles.input}
            />

            <TouchableOpacity
              onPress={setWeight}
              style={[styles.button, { backgroundColor: "#1DB954" }]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>  

      



      {/* chart */}
      {weeklyData.data && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Weekly Weight</Text>

          <BarChart
            data={{
              labels: weeklyData.labels,
              datasets: [{ data: weeklyData.data }],
            }}
            width={screenWidth - 30}
            height={280}
            showValuesOnTopOfBars={true}
            yAxisLabel=""
            chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            fillShadowGradient: "#1DB954",
            fillShadowGradientOpacity: 1,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(29, 185, 84, ${opacity})`, 
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`, 
              propsForBackgroundLines: {
              stroke: "rgba(0, 0, 0, 0.1)", // light grid lines
            },
            }}
            style={{ borderRadius: 16, paddingRight: 1}}
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
  container: { flex: 1, padding: 20, 
    //backgroundColor: "#ffffff" 
    },

  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },

  cardLabel: { color: "#aaa", fontSize: 16 },
  cardValue: { color: "#fff", fontSize: 34, fontWeight: "bold" },

  button: {
    padding: 12,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: { fontSize: 18, marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#c5c5c5",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: "#000",
  },

 weightCard: {
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
    marginBottom:150,
    backgroundColor: "rgb(255, 255, 255)", 
    shadowColor: "#00000070",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
},


weightInfoCard: {
  backgroundColor: "#ffffff",
  padding: 16,
  borderRadius: 16,
  marginTop: 18,
  marginBottom: 5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 5,
  elevation: 2,
},

infoHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

infoTitle: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#222",
  marginLeft: 8,
},

infoDescription: {
  fontSize: 13,
  lineHeight: 20,
  color: "#666",
},

infoDivider: {
  height: 1,
  backgroundColor: "#eeeeee",
  marginVertical: 14,
},

infoSubtitle: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 12,
},

infoTip: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 10,
},

infoTipText: {
  flex: 1,
  fontSize: 13,
  lineHeight: 19,
  color: "#555",
  marginLeft: 10,
},

infoFooter: {
  fontSize: 12,
  lineHeight: 18,
  color: "#1B8F45",
  fontWeight: "600",
  marginTop: 5,
},

});