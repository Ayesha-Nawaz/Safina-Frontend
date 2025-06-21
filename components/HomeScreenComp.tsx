import { useNavigation } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreenComp = () => {
  const navigation = useNavigation();
  const scaleValues = useRef(Array(7).fill(0).map(() => new Animated.Value(1))).current;
  const bounceValues = useRef(Array(7).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Create continuous bouncing animation
    const startBounceAnimation = () => {
      bounceValues.forEach((value, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.spring(value, {
              toValue: -10,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(value, {
              toValue: 0,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    };

    startBounceAnimation();
  }, []);

  const handlePressIn = (index) => {
    Animated.spring(scaleValues[index], {
      toValue: 0.9,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleValues[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const MenuCard = ({ onPress, image, text, index }) => (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          transform: [
            { scale: scaleValues[index] },
            { translateY: bounceValues[index] }
          ]
        }
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => handlePressIn(index)}
        onPressOut={() => handlePressOut(index)}
        style={({ pressed }) => [styles.item]}
      >
        <LinearGradient
          colors={getGradientColors(index)}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          borderRadius={25}
        >
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} />
          </View>
          <Text style={styles.itemText}>{text}</Text>
        </LinearGradient>
      </Pressable> 
    </Animated.View>
  );

  const getGradientColors = (index) => {
    const gradients = [
      ['#FF9A9E', '#FAD0C4'], // Warm pink
      ['#A18CD1', '#FBC2EB'], // Lavender
      ["#4E65FF", "#92EFFD"], // Fresh green
      ['#84FAB0', '#8FD3F4'], // Aqua
      ['#E0C3FC', '#8EC5FC'], // Purple blue
      ['#FFD1FF', '#FAD0C4'], // Soft pink
      ['#FAD0C4', '#FFD1FF']
    ];
    return gradients[index % gradients.length];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.column}>
        <MenuCard
          index={0}
          onPress={() => navigation.navigate("(kalma)")}
          image={require("@/assets/images/kalma.jpeg")}
          text="Kalma's"
        />
        <MenuCard
          index={1}
          onPress={() => navigation.navigate("(duas)")}
          image={require("@/assets/images/duas.jpeg")}
          text="Dua's"
        />
        <MenuCard
          index={2}
          onPress={() => navigation.navigate("(namaz)")}
          image={require("@/assets/images/namaz.jpeg")}
          text="Namaz"
        />
        <MenuCard
          index={3}
          onPress={() => navigation.navigate("(wudu)")}
          image={require("@/assets/images/wudu.png")}
          text="Wudu"
        />
        <MenuCard
          index={4}
          onPress={() => navigation.navigate("(stories)")}
          image={require("@/assets/images/ps.jpg")}
          text="Stories"
        />
        <MenuCard
          index={5}
          onPress={() => navigation.navigate("(asamulhusna)")}
          image={require("@/assets/images/allah-name.jpg")}
          text="AsmaulHusna"
        />
        <MenuCard
          index={6}
          onPress={() => navigation.navigate("(asmaulnabi)")}
          image={require("@/assets/images/name-muhammad.jpg")}
          text="AsmaulNabi"
        />
        {/* <MenuCard
          index={6}
          onPress={() => navigation.navigate("(icons)")}
          text="ICONS"
        />  */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 70,
  },
  column: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 5,
  },
  itemContainer: {
    width: '45%',
    margin: 5,
  },
  item: {
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradient: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 60,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 50,
  },
  itemText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Poppins-Bold",  
    color: '#4A4A4A',
    marginTop: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },  
});

export default HomeScreenComp;