import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const DuaCard = ({ item, language, onPlayRecording }) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const cardBounce = useSharedValue(1);
  const cardSlide = useSharedValue(50);
  const cardOpacity = useSharedValue(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    cardBounce.value = withSequence(withSpring(1.05), withSpring(1);
    cardSlide.value = withSpring(0, { damping: 12, stiffness: 100 });
    cardOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { scale: cardBounce.value },
      { translateY: cardSlide.value },
    ],
    opacity: cardOpacity.value,
  }));

  const speakerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: interpolate(rotate.value, [0, 180], [1, 1.2]) },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePlayPress = () => {
    rotate.value = withSequence(
      withTiming(360, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withTiming(0, { duration: 0 })
    );
    onPlayRecording(item.audio);
  };

  const toggleAudio = async () => {
    try {
      if (!item.audio) return;

      if (!sound) {
        const { sound } = await Audio.Sound.createAsync({ uri: item.audio });
        setSound(sound);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
            setSound(null);
          }
        });

        await sound.playAsync();
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <Animated.View style={[styles.duaCard, animatedStyle]}>
      <TouchableOpacity>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.audioButton}
            onPress={toggleAudio}
          >
            <Animated.View style={[styles.audioIconContainer]}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={45}
                color="#4CAF50"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Text style={styles.arabic}>{item.arabic}</Text>
        <Text
          style={[
            styles.translation,
            {
              fontFamily:
                language === "urdu"
                  ? "NotoNastaliqUrdu-Regular"
                  : "Poppins-Regular",
            },
          ]}
        >
          {language === "english"
            ? item.english_translation
            : item.urdu_translation}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  duaCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 10,
    borderColor: "#053198",
    borderWidth: 2,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  audioButton: {
    borderRadius: 25,
    marginVertical: 5,
    alignItems: "center",
  },
  audioIconContainer: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#2e5dcb',
  },
  arabic: {
    fontSize: 23,
    color: "#4ca710",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "AmiriQuranColored",
  },
  translation: {
    fontSize: 17,
    color: "#3498DB",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});

export default React.memo(DuaCard);