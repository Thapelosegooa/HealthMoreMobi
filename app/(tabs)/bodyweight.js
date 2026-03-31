import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Switch,
  ScrollView,
  ImageBackground,
} from "react-native";

export default function Converter() {
  

  return (
    <ImageBackground
          source={require("../../assets/images/gradbackground.png")}
          style={styles.background}
          resizeMode="cover"
        >

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>About Your Body</Text>

        {/* Card */}
        <View style={styles.card}>
        {/* Image */}
        <Image
            source={require("../../assets/images/bodyfat.jpg")} // add your image here
            style={styles.image}
            resizeMode="cover"
        />

        {/* Article Title */}
        <Text style={styles.articleTitle}>What is body fat percentage?</Text>

        {/* Article Text */}
        <Text style={styles.articleText}>
            Body fat percentage is the amount of fat your body carries compared 
            to your total body weight. Unlike weight alone, it gives a clearer 
            picture of your overall health and fitness level.
        </Text>

        {/* Article Title */}
        <Text style={styles.articleTitle}>Why Does Body Fat Percentage Matter?</Text>

        {/* Article Text */}
        <Text style={styles.articleText}>Your body needs some fat to function 
            properly — it helps with hormone balance, energy storage, and 
            protecting your organs. However, too much or too little body fat 
            can affect your health.
        </Text>
            
           
        <Text style={styles.articleText}>
            When too high there is increased risk of heart disease, diabetes, and low energy. 
            When too low you develop hormone issues, fatigue, and reduced strength
        </Text>

         <Text style={styles.articleText}>Your body needs some fat to function 
            properly — it helps with hormone balance, energy storage, and 
            protecting your organs. However, too much or too little body fat 
            can affect your health.</Text>
            
        <Text style={styles.articleTitle}>Healthy Ranges (General)</Text>   
        <Text style={styles.articleText}>
            Men: 10–20%
        </Text>
        <Text style={styles.articleText}>
            Women: 18–28%
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

  scroll: {
    flexGrow: 1,
    padding: 20,
    
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    marginTop: 50,
  },

  card: {
    backgroundColor: "rgb(255, 255, 255)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
image: {
  width: "100%",
  height: 280,
  borderRadius: 15,
  marginBottom: 15,
},

articleTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#000",
  marginBottom: 10,
},

articleText: {
  fontSize: 14,
  color: "#444",
  marginBottom: 10,
  lineHeight: 20,
},
 

});