
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function Converter() {
  return (
    <ImageBackground
      source={require("../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>About Your Body</Text>
          <Text style={styles.subtitle}>
            Understand your body composition and what it means for your health.
          </Text>
        </View>

        {/* FEATURED ARTICLE */}
        <View style={styles.card}>

          <Image
            source={require("../../assets/images/bodyfat.jpg")}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.articleContent}>

            <View style={styles.tag}>
              <Text style={styles.tagText}>BODY COMPOSITION</Text>
            </View>

            <Text style={styles.articleTitle}>
              What is body fat percentage?
            </Text>

            <Text style={styles.articleText}>
              Body fat percentage is the proportion of your total body
              weight that comes from fat. Unlike weight alone, it provides
              additional insight into your body composition and overall
              fitness.
            </Text>

            <View style={styles.divider} />

            {/* WHY IT MATTERS */}
            <View style={styles.sectionHeading}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="heart-outline"
                  size={21}
                  color="#20A65A"
                />
              </View>

              <Text style={styles.sectionTitle}>
                Why does it matter?
              </Text>
            </View>

            <Text style={styles.articleText}>
              Your body needs some fat to function properly. It supports
              hormone production, stores energy and helps protect your
              organs.
            </Text>

            <Text style={styles.articleText}>
              However, having too much or too little body fat can affect
              your health and physical performance.
            </Text>

            {/* HEALTH EFFECTS */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={21}
                  color="#D58A35"
                />

                <Text style={styles.infoTitle}>
                  Excess body fat
                </Text>
              </View>

              <Text style={styles.infoText}>
                Higher body fat levels can increase the risk of conditions
                such as heart disease and type 2 diabetes.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color="#4786C7"
                />

                <Text style={styles.infoTitle}>
                  Very low body fat
                </Text>
              </View>

              <Text style={styles.infoText}>
                Insufficient body fat can contribute to hormonal
                disruptions, fatigue and reduced physical performance.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* HEALTHY RANGES */}
            <View style={styles.sectionHeading}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="stats-chart-outline"
                  size={21}
                  color="#20A65A"
                />
              </View>

              <Text style={styles.sectionTitle}>
                General body fat ranges
              </Text>
            </View>

            <Text style={styles.articleText}>
              Body fat ranges vary according to age, sex and activity
              levels. The following are broad reference ranges, not
              universal health targets.
            </Text>

            <View style={styles.rangeContainer}>

              <View style={styles.rangeCard}>
                <View style={styles.rangeIcon}>
                  <Ionicons
                    name="male-outline"
                    size={24}
                    color="#20A65A"
                  />
                </View>

                <Text style={styles.rangeLabel}>Men</Text>

                <Text style={styles.rangeValue}>10–20%</Text>

                <Text style={styles.rangeDescription}>
                  General reference
                </Text>
              </View>

              <View style={styles.rangeCard}>
                <View style={styles.rangeIcon}>
                  <Ionicons
                    name="female-outline"
                    size={24}
                    color="#20A65A"
                  />
                </View>

                <Text style={styles.rangeLabel}>Women</Text>

                <Text style={styles.rangeValue}>18–28%</Text>

                <Text style={styles.rangeDescription}>
                  General reference
                </Text>
              </View>

            </View>

            {/* FOOTNOTE */}
            <View style={styles.footerNote}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#888"
              />

              <Text style={styles.footerText}>
                Body fat percentages are estimates and should be
                interpreted alongside other health indicators.
              </Text>
            </View>

          </View>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 45,
  },

  // HEADER
  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#171717",
    letterSpacing: -1.2,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 7,
    lineHeight: 21,
  },

  // MAIN CARD
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 25,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 80,
  },

  image: {
    width: "100%",
    height: 240,
  },

  articleContent: {
    padding: 21,
  },

  // ARTICLE TAG
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 15,
  },

  tagText: {
    color: "#20A65A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  articleTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#202020",
    letterSpacing: -0.6,
    marginBottom: 12,
  },

  articleText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 23,
    marginBottom: 13,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 20,
  },

  // SECTION HEADINGS
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  iconContainer: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    letterSpacing: -0.3,
    flex: 1,
  },

  // INFORMATION CARDS
  infoCard: {
    backgroundColor: "#F8F9F8",
    padding: 15,
    borderRadius: 15,
    marginBottom: 11,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginLeft: 9,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#777",
  },

  // BODY FAT RANGES
  rangeContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },

  rangeCard: {
    flex: 1,
    backgroundColor: "#F7F9F7",
    borderRadius: 17,
    padding: 15,
    alignItems: "center",
  },

  rangeIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EAF7EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  rangeLabel: {
    fontSize: 14,
    color: "#777",
    fontWeight: "600",
  },

  rangeValue: {
    fontSize: 25,
    fontWeight: "700",
    color: "#20A65A",
    marginTop: 5,
  },

  rangeDescription: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
  },

  // FOOTNOTE
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 22,
    gap: 9,
  },

  footerText: {
    flex: 1,
    fontSize: 11,
    color: "#999",
    lineHeight: 18,
  },

});
