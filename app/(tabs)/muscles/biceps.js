import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Biceps() {
  const router = useRouter();

  const workouts = [
    {
      name: "Z-Bar Curls",
      image: require("../../../assets/workouts/biceps/bic1.png"),
      reps: "3 sets x 12 reps",
      equipment: "Z-Bar",
      level: "Beginner",
      video: "https://youtu.be/d2r5TCqnR4Y?si=DCNRelAjETgMeiqr",
    },
    {
      name: "Skull Crushers",
      image: require("../../../assets/workouts/biceps/bic2.png"),
      reps: "3 sets x 12 reps",
      equipment: "Z-Bar",
      level: "Intermediate",
      video: "https://youtu.be/S0fmDR60X-o?si=87_okS9j5WUExNf-",
    },
    {
      name: "Standing Tricep Press",
      image: require("../../../assets/workouts/biceps/bic3.png"),
      reps: "3 sets x 10 reps",
      equipment: "Dumbbells",
      level: "Intermediate",
      video: "https://youtu.be/-Vyt2QdsR7E?si=vfHEUTDVq_ubHjca",
    },
    {
      name: "Seated Incline Curls",
      image: require("../../../assets/workouts/biceps/bic4.png"),
      reps: "3 sets x 10 reps",
      equipment: "Dumbbells",
      level: "Hard",
      video: "https://youtu.be/XhIsIcjIbCw?si=M0G1BafmuM6v7BB_",
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

          <Text style={styles.title}>Biceps</Text>
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