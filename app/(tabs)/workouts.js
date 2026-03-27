import { View, Text, StyleSheet } from "react-native";


export default function workouts() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout Screen</Text>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 20,
  },
});