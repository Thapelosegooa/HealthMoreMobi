import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Workouts() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Workouts</Text>

        {/* Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/chest")}
          >
            <Image
              source={require("../../assets/workouts/chest/chestlogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}>Chest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/core")}
          >
            <Image
              source={require("../../assets/workouts/core/corelogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}>Core</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/biceps")}
          >
            <Image
              source={require("../../assets/workouts/biceps/biceplogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}>Biceps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/shoulders")}
          >
            <Image
              source={require("../../assets/workouts/shoulders/shoulderlogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}>Shoulders</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/quads")}
          >
            <Image
              source={require("../../assets/workouts/quads/quadlogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}>Quads</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/muscles/calves")}
          >
            <Image
              source={require("../../assets/workouts/calves/calvelogo.png")}
              style={styles.image}
            />
            <Text style={styles.label}> Calves</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginTop: 50,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 150,
    borderRadius: 15,
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
