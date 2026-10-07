import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ImageBackground,
  Dimensions,
} from "react-native";

import { BASE_URL } from "../../../config/api";
import { getToken } from "../../../utils/getToken";
import { BarChart, LineChart } from "react-native-chart-kit";

export default function Reports() {
  const [calorieData, setCalorieData] = useState(null);
  const [weightData, setWeightData] = useState(null);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Session expired",
          "Please log in again."
        );
        return;
      }

      // =========================================
      // FETCH CALORIES
      // =========================================

      const calorieResponse = await fetch(
        `${BASE_URL}/api/calories/weekly`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!calorieResponse.ok) {
        throw new Error(
          "Failed to load calorie data"
        );
      }

      const calorieJson =
        await calorieResponse.json();

      // =========================================
      // FETCH WEIGHT
      // =========================================

      const weightResponse = await fetch(
        `${BASE_URL}/api/weight/weekly`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!weightResponse.ok) {
        throw new Error(
          "Failed to load weight data"
        );
      }

      const weightJson =
        await weightResponse.json();

      

      // =========================================
      // CREATE LAST 7 DAYS
      // =========================================

      const last7Days = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();

        d.setDate(
          d.getDate() - i
        );

        const dayStr = d
          .toISOString()
          .split("T")[0];

        last7Days.push(dayStr);
      }

      // =========================================
      // CALORIE DATA
      //
      // Missing calories = 0
      // =========================================

      const calorieLabels = [];
      const calorieValues = [];

      last7Days.forEach(
        (dayStr) => {
          calorieLabels.push(
            dayStr.slice(5)
          );

          const dayRecord =
            calorieJson.find(
              (record) =>
                String(record.date).split(
                  "T"
                )[0] === dayStr
            );

          if (dayRecord) {
            calorieValues.push(
              Number(
                dayRecord.consumed
              )
            );
          } else {
            calorieValues.push(0);
          }
        }
      );

      setCalorieData({
        labels: calorieLabels,
        data: calorieValues,
      });

      // =========================================
      // NORMALIZE WEIGHT RECORDS
      // =========================================

      const weightRecords =
        weightJson
          .filter(
            (record) =>
              record.weight !==
                undefined &&
              record.weight !== null &&
              record.date
          )
          .map(
            (record) => ({
              date: String(
                record.date
              ).split("T")[0],

              weight: Number(
                record.weight
              ),
            })
          )
          .filter(
            (record) =>
              !isNaN(
                record.weight
              )
          )
          .sort(
            (a, b) =>
              a.date.localeCompare(
                b.date
              )
          );

      

      // =========================================
      // FIND PREVIOUS WEIGHT
      // =========================================

      const getPreviousWeight = (
        date
      ) => {
        let previousWeight = null;

        for (
          let i = 0;
          i <
          weightRecords.length;
          i++
        ) {
          const record =
            weightRecords[i];

          if (
            record.date <= date
          ) {
            previousWeight =
              record.weight;
          } else {
            break;
          }
        }

        return previousWeight;
      };

      // =========================================
      // BUILD WEIGHT CHART DATA
      // =========================================

      const weightLabels = [];
      const weightValues = [];

      last7Days.forEach(
        (dayStr) => {
          weightLabels.push(
            dayStr.slice(5)
          );

          // First look for exact day
          const exactRecord =
            weightRecords.find(
              (record) =>
                record.date ===
                dayStr
            );

          if (exactRecord) {
            weightValues.push(
              exactRecord.weight
            );

            
          } else {
            // Otherwise use previous weight
            const previousWeight =
              getPreviousWeight(
                dayStr
              );

            if (
              previousWeight !==
              null
            ) {
              weightValues.push(
                previousWeight
              );

              
            } else {
              // No weight exists yet
              weightValues.push(0);

              console.log(
                dayStr,
                "NO PREVIOUS WEIGHT"
              );
            }
          }
        }
      );

      

      setWeightData({
        labels: weightLabels,
        data: weightValues,
      });
    } catch (error) {
      console.log(
        "Reports error:",
        error
      );

      Alert.alert(
        "Error",
        "Failed to load your reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../assets/images/gradbackground.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={
              styles.loadingText
            }
          >
            Loading reports...
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // =========================================
  // CHART DIMENSIONS
  // =========================================

  const chartWidth =
    screenWidth - 20;

  const chartHeight = 320;

  const leftMargin = 45;
  const rightMargin = 20;
  const topMargin = 30;
  const bottomMargin = 45;

  const usableWidth =
    chartWidth -
    leftMargin -
    rightMargin;

  const usableHeight =
    chartHeight -
    topMargin -
    bottomMargin;

  // =========================================
  // VALID WEIGHTS
  // =========================================

  const validWeights =
    weightData?.data.filter(
      (weight) =>
        weight !== null &&
        weight !== undefined &&
        weight > 0
    ) || [];

  const minWeight =
    validWeights.length > 0
      ? Math.min(
          ...validWeights
        )
      : 0;

  const maxWeight =
    validWeights.length > 0
      ? Math.max(
          ...validWeights
        )
      : 1;

  const weightPadding = 2;

  const chartMinWeight =
    minWeight -
    weightPadding;

  const chartMaxWeight =
    maxWeight +
    weightPadding;

  const weightRange =
    chartMaxWeight -
      chartMinWeight ||
    1;

  // =========================================
  // RENDER
  // =========================================

  return (
    <ImageBackground
      source={require("../../../assets/images/gradbackground.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
      >
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View
          style={styles.heading}
        >
          <Text
            style={styles.header}
          >
            Reports
          </Text>

          
        </View>

                
        {/* INFO */}
        

        <View
          style={styles.infoCard}
        >
          <Text
            style={styles.infoTitle}
          >
            About your Reports
          </Text>

          <Text
            style={styles.infoText}
          >
            These graphs display your
            calorie intake and
            weight records from the
            last 7 days.
          </Text>
        </View>

        {/* ================================= */}
        {/* CALORIES */}
        {/* ================================= */}

        <View
          style={styles.chartCard}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Weekly Calories
          </Text>

          {calorieData && (
            <BarChart
              data={{
                labels:
                  calorieData.labels,

                datasets: [
                  {
                    data:
                      calorieData.data,
                  },
                ],
              }}
              width={
                screenWidth - 20
              }
              height={280}
              yAxisLabel=""
              showValuesOnTopOfBars={
                true
              }
              chartConfig={{
                backgroundGradientFrom:
                  "#ffffff",

                backgroundGradientTo:
                  "#ffffff",

                fillShadowGradient:
                  "#1DB954",

                fillShadowGradientOpacity: 1,

                decimalPlaces: 0,

                color: (
                  opacity = 1
                ) =>
                  `rgba(29, 185, 84, ${opacity})`,

                labelColor: (
                  opacity = 1
                ) =>
                  `rgba(0,0,0,${opacity})`,

                propsForBackgroundLines:
                  {
                    stroke:
                      "rgba(0, 0, 0, 0.1)",
                  },
              }}
              style={styles.chart}
            />
          )}
        </View>


        {/* WEIGHT */}
        

        <View
          style={styles.chartCard}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Weekly Weight
          </Text>

          {weightData && (
            <View
              style={[
                styles.weightChartContainer,
                {
                  width:
                    chartWidth,
                  height:
                    chartHeight,
                },
              ]}
            >
              {/* GRAPH */}

              <LineChart
                data={{
                  labels:
                    weightData.labels,

                  datasets: [
                    {
                      data:
                        weightData.data,

                      color: (
                        opacity = 1
                      ) =>
                        `rgba(29, 185, 84, ${opacity})`,

                      strokeWidth: 3,
                    },
                  ],
                }}
                width={
                  chartWidth
                }
                height={
                  chartHeight
                }
                yAxisSuffix=" kg"
                yAxisInterval={1}
                fromZero={false}
                bezier
                chartConfig={{
                  backgroundGradientFrom:
                    "#ffffff",

                  backgroundGradientTo:
                    "#ffffff",

                  decimalPlaces: 1,

                  color: (
                    opacity = 1
                  ) =>
                    `rgba(29, 185, 84, ${opacity})`,

                  labelColor: (
                    opacity = 1
                  ) =>
                    `rgba(0, 0, 0, ${opacity})`,

                  propsForDots:
                    {
                      r: "5",

                      strokeWidth:
                        "2",

                      stroke:
                        "#1DB954",

                      fill:
                        "#ffffff",
                    },

                  propsForBackgroundLines:
                    {
                      stroke:
                        "rgba(0, 0, 0, 0.1)",
                    },
                }}
                style={
                  styles.chart
                }
              />

              {/* WEIGHT NUMBERS */}

              <View
                pointerEvents="none"
                style={
                  styles.labelsContainer
                }
              >
                {weightData.data.map(
                  (
                    weight,
                    index
                  ) => {
                    if (
                      !weight ||
                      weight === 0
                    ) {
                      return null;
                    }

                    // X position
                    const x =
                      leftMargin +
                      (index /
                        Math.max(
                          weightData
                            .data
                            .length -
                            1,
                          1
                        )) *
                        usableWidth;

                    // Y position
                    const y =
                      topMargin +
                      (1 -
                        (weight -
                          chartMinWeight) /
                          weightRange) *
                        usableHeight;

                    return (
                      <Text
                        key={`weight-${index}`}
                        style={[
                          styles.weightLabel,
                          {
                            left:
                              x -
                              30,

                            top:
                              y -
                              25,
                          },
                        ]}
                      >
                        {Number(
                          weight
                        ).toFixed(
                          1
                        )}{" "}
                        kg
                      </Text>
                    );
                  }
                )}
              </View>
            </View>
          )}
        </View>

      <View><Text style={styles.spacer}>
        </Text>
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
    flex: 1,
    padding: 20,
  },

  contentContainer: {
    paddingBottom: 40,
  },

  heading: {
    marginTop: 50,
    marginBottom: 10,
  },

  header: {
    color: "#000",
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#555",
    fontSize: 15,
    marginTop: 5,
  },

  chartCard: {
    justifyContent:
      "center",

    marginTop: 20,
    padding: 10,
    borderRadius: 20,

    backgroundColor:
      "#fff",

    shadowColor:
      "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity:
      0.15,

    shadowRadius: 6,

    elevation: 4,
  },

  sectionTitle: {
    color: "#000",

    fontSize: 18,

    fontWeight: "600",

    marginVertical: 10,

    marginLeft: 5,
  },

  chart: {
    borderRadius: 16,

    paddingRight: 0,
  },
  spacer: {
    marginBottom: 50,
  },


  // =======================================
  // WEIGHT GRAPH
  // =======================================

  weightChartContainer: {
    position:
      "relative",

    backgroundColor:
      "#ffffff",
  },

  labelsContainer: {
    position:
      "absolute",

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    zIndex: 10,
  },

  weightLabel: {
    position:
      "absolute",

    width: 60,

    textAlign:
      "center",

    color:
      "#1DB954",

    fontSize: 11,

    fontWeight:
      "bold",

    backgroundColor:
      "rgba(255,255,255,0.9)",

    paddingVertical: 2,

    borderRadius: 4,
  },

  // =======================================
  // INFO
  // =======================================

  infoCard: {
    backgroundColor:
      "#fff",

    padding: 20,

    borderRadius: 20,

    marginTop: 20,

    shadowColor:
      "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity:
      0.15,

    shadowRadius: 6,

    elevation: 4,
  },

  infoTitle: {
    fontSize: 18,

    fontWeight:
      "bold",

    color:
      "#000",

    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,

    color:
      "#555",

    lineHeight: 21,
  },

  loadingContainer: {
    flex: 1,

    justifyContent:
      "center",

    alignItems:
      "center",
  },

  loadingText: {
    fontSize: 16,

    color:
      "#333",
  },
});
