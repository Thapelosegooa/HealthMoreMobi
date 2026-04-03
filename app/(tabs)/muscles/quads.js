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

export default function Quads() {
  const router = useRouter();

  const workouts = [
    {
      name: "Barbell Kneeling Squats",
      image: require("../../../assets/workouts/quads/quads1.png"),
      reps: "3 sets x 10 reps",
      equipment: "Barbell",
      level: "Beginner",
      video: "https://www.youtube.com/watch?v=SbTegdZvIgA",
    },
    {
      name: "Front Squats",
      image: require("../../../assets/workouts/quads/quads5.png"),
      reps: "3 sets x 10 reps",
      equipment: "Barbell",
      level: "Intermediate",
      video: "https://www.youtube.com/watch?v=nmUof3vszxM",
    },
    {
      name: "Lunges",
      image: require("../../../assets/workouts/quads/quads3.png"),
      reps: "2 sets x 10 reps",
      equipment: "Dumbbells",
      level: "Intermediate",
      video: "https://www.youtube.com/watch?v=lf4gJgKyLpI",
    },
    {
      name: "Bulgarian Split Squats",
      image: require("../../../assets/workouts/quads/quads4.png"),
      reps: "1 sets x 10 reps",
      equipment: "Barbell",
      level: "Hard",
      video: "https://www.youtube.com/watch?v=-4LVK1crLSw",
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

          <Text style={styles.title}>Quads</Text>
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
