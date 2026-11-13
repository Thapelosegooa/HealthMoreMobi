
import { useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "#101713",
  card: "#202D24",
  cardLight: "#263A2C",
  primary: "#1DB954",
  white: "#FFFFFF",
  muted: "#A3B2A7",
  border: "#344438",
};

const muscleGroups = [
  {
    name: "Chest",
    subtitle: "Upper body strength",
    image: require("../../assets/workouts/chest/chestlogo.png"),
    route: "/(tabs)/muscles/chest",
  },
  {
    name: "Core",
    subtitle: "Abs & stability",
    image: require("../../assets/workouts/core/corelogo.png"),
    route: "/(tabs)/muscles/core",
  },
  {
    name: "Biceps",
    subtitle: "Build arm strength",
    image: require("../../assets/workouts/biceps/biceplogo.png"),
    route: "/(tabs)/muscles/biceps",
  },
  {
    name: "Shoulders",
    subtitle: "Upper body power",
    image: require("../../assets/workouts/shoulders/shoulderlogo.png"),
    route: "/(tabs)/muscles/shoulders",
  },
  {
    name: "Quads",
    subtitle: "Leg day essentials",
    image: require("../../assets/workouts/quads/quadlogo.png"),
    route: "/(tabs)/muscles/quads",
  },
  {
    name: "Calves",
    subtitle: "Lower body strength",
    image: require("../../assets/workouts/calves/calvelogo.png"),
    route: "/(tabs)/muscles/calves",
  },
];

export default function Workouts() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>

          <Text style={styles.title}>
            Let's get{"\n"}
            <Text style={styles.titleAccent}>stronger.</Text>
          </Text>

          
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Muscle groups</Text>
            <Text style={styles.sectionSubtitle}>
              Select an area to explore exercises
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>06 GROUPS</Text>
          </View>
        </View>

        {/* WORKOUT GRID */}
        <View style={styles.grid}>
          {muscleGroups.map((muscle) => (
            <TouchableOpacity
              key={muscle.name}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(muscle.route)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={muscle.image}
                  style={styles.image}
                  resizeMode="cover"
                />

                <View style={styles.imageOverlay}>
                  <Text style={styles.imageLabel}>EXPLORE</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{muscle.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {muscle.subtitle}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>↗</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.texter}>
                  
                </View>

       
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 35,
  },

  // HEADER
  header: {
    marginBottom: 10,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },

  title: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -1.2,
  },

  titleAccent: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 300,
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#555353",
    fontSize: 11,
    marginTop: 5,
  },

  countBadge: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  countText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // WORKOUT GRID
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 9,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 130,
    borderRadius: 13,
    backgroundColor: COLORS.cardLight,
  },

  imageOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(16, 23, 19, 0.85)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  imageLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },

  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 3,
    paddingTop: 13,
    paddingBottom: 5,
  },

  cardText: {
    flex: 1,
    paddingRight: 4,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 5,
  },

  arrowContainer: {
    backgroundColor: "#344A31",
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  arrow: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "800",
  },
texter: {
    marginBottom:90,
  },

});
