import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View, ScrollView } from "react-native";
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
      <ScrollView style={styles.test}>
      <View style={styles.heading}>
        <Text style={styles.header}>Welcome Home</Text>
      </View>
      
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
            onPress={() => router.push("/(tabs)/bodyweight")}
            style={styles.weightCard}
          >
             <View style={styles.weightRow}>
                <Text style={styles.weightLabel}>Body Fat Percentage</Text>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={30}
                  color="#1DB954"
                />
            </View>
          </TouchableOpacity>


          {/*bmi and calories calculator*/}
          <View style={styles.row}>
          
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/converter")}
            style={styles.smallCard}
          >
            
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={50}
              color="#1DB954"
            />
            <Text style={styles.smallCardTitle}>Kcal Converter</Text>
          </TouchableOpacity>

         
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/bmi")}
            style={styles.smallCard}
          >
            
            <MaterialCommunityIcons
              name="scale-bathroom"
              size={50}
              color="#1DB954"
            />
            <Text style={styles.smallCardTitle}>Calculate BMI</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = {
  background: {
    flex: 1,
  },
  heading: {
    paddingHorizontal: 20,
    marginTop: 65,
  },
  header: {
    textAlign: 'left',
    fontSize: 25,
    fontWeight: "500",
    letterSpacing: 1,
    color: "#000",
  },
 
  container: {
    flex: 1,
    //backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  circleContainer: {
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
    
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
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

    borderWidth: 2,
    borderColor: "#1DB954", 
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 15,
   shadowColor: "#00000070",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 100,
  },
  weightLabel: { color: "#000000", fontSize: 20, fontWeight: "bold" },
  weightValue: { color: "#000000", fontSize: 20, fontWeight: "bold" },
  ///////////////////////////

  row: {
  flexDirection: "row",
  marginTop: 20,
  gap: 10,
},

smallCard: {
  flex: 1,
  backgroundColor: "#ffffff",
  paddingVertical: 30,
  borderRadius: 15,
  borderWidth: 2,
  borderColor: "#1db954", 
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#00000070",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
},

smallCardTitle: {
  color: "#000000",
  fontSize: 16,
  fontWeight: "bold",
  
},

};
