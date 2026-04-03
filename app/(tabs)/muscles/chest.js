import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chestg() {
  const router = useRouter();

  const workouts = [
    {
      name: "Flat Bench Press",
      image: require("../../../assets/workouts/chest/chest1.png"),
      reps: "3 sets x 10 reps",
      equipment: "Barbells",
      level: "Intermediate",
      video: "https://www.youtube.com/watch?v=lAMfO-Yrf_I",
    },
    {
      name: "Inclined Press",
      image: require("../../../assets/workouts/chest/chest2.png"),
      reps: "3 sets x 10 reps",
      equipment: "Dumbbells",
      level: "Hard",
      video: "https://www.youtube.com/watch?v=oZVCBM9f8Eo",
    },
    {
      name: "Decline Press",
      image: require("../../../assets/workouts/chest/chest3.png"),
      reps: "3 sets x 10 reps",
      equipment: "Dumbbells",
      level: "Intermediate",
      video: "https://www.youtube.com/watch?v=vTXZEwGb3xM",
    },
    {
      name: "Cable pec Flys",
      image: require("../../../assets/workouts/chest/chest4.png"),
      reps: "3 sets x 15 reps",
      equipment: "Cable machine",
      level: "Beginner",
      video: "https://www.youtube.com/watch?v=mLgYNdxj-Vw",
    },
  ];

  const openVideo = (url) => {
    Linking.openURL(url);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Chest</Text>
        </View>

        {/* Workouts */}
        {workouts.map((item, index) => (
          <View key={index} style={styles.card}>
            <Image source={item.image} style={styles.image} />

            <Text style={styles.name}>{item.name}</Text>

            {/* Info rows */}
            <View style={styles.infoRow}>
              <Ionicons name="repeat" size={16} color="#000000" />
              <Text style={styles.infoText}>{item.reps}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="barbell" size={16} color="#000000" />
              <Text style={styles.infoText}>{item.equipment}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="stats-chart" size={16} color="#000000" />
              <Text style={styles.infoText}>{item.level}</Text>
            </View>

            {/* Play button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => openVideo(item.video)}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.playText}>Watch</Text>
            </TouchableOpacity>
          </View>
        ))}
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginBottom: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#444",
  },

  playButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 10,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: "flex-start",
  },

  playText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
});
