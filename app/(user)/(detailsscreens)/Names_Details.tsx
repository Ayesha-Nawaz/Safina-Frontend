import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { UserContext } from "@/context/UserContext";
import CustomAlert from "@/components/CustomAlert";
import Loader from "@/components/Loader";

const { width } = Dimensions.get("window");

const NamesDetails = () => {
  const params = useLocalSearchParams();
  const { id } = params; // Get the MongoDB _id from params
  const { user } = useContext(UserContext);
  // State for name details
  const [nameDetails, setNameDetails] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // State for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    showCancel: false,
    cancelText: "Cancel",
    onConfirm: () => setAlertVisible(false),
    onCancel: () => setAlertVisible(false),
  });

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Audio state
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  // Fetch name details using MongoDB ID
  useEffect(() => {
    const fetchNameDetails = async () => {
      try {
        setIsDataLoading(true);
        console.log(`Fetching details for MongoDB ID: ${id}`);

        // Fetch data from API using the MongoDB _id parameter
        const response = await axios.get(`${BASE_URL}/asmaulhusna/${id}`);
        console.log("Fetched Name Details:", response.data);

        if (!response.data) {
          throw new Error("No data received from API");
        }

        setNameDetails(response.data);
        // Check if audio is available
        setAudioAvailable(!!response.data.audio);
      } catch (err) {
        console.error("Error fetching name details:", err);
        setError("Failed to load name details");
        setAlertConfig({
          title: "Error",
          message: "Failed to load name details. Please try again later.",
          type: "error",
          confirmText: "OK",
          onConfirm: () => setAlertVisible(false),
        });
        setAlertVisible(true);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (id) {
      fetchNameDetails();
    }
  }, [id]);

  // Debug - Check if audio is available
  useEffect(() => {
    if (nameDetails?.audio) {
      console.log("Audio URL:", nameDetails.audio);
      setAudioAvailable(!!nameDetails.audio);
    }
  }, [nameDetails]);

  // Audio functions
  async function playSound() {
    try {
      if (!nameDetails?.audio) {
        setAudioAvailable(false);
        setAlertConfig({
          title: "Audio Unavailable",
          message: "No audio is available for this name.",
          type: "info",
          confirmText: "OK",
          onConfirm: () => setAlertVisible(false),
        });
        setAlertVisible(true);
        return;
      }

      if (sound) {
        setIsPlaying(true);
        await sound.playAsync();
      } else if (nameDetails?.audio) {
        setIsLoading(true);
        console.log("Loading audio from:", nameDetails.audio);
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: nameDetails.audio },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          setSound(newSound);
          setIsPlaying(true);
        } catch (error) {
          console.error("Error loading audio:", error);
          setAlertConfig({
            title: "Audio Error",
            message: "There was a problem playing the audio or there is no audio yet. Please try again later.",
            type: "error",
            confirmText: "OK",
            onConfirm: () => setAlertVisible(false),
          });
          setAlertVisible(true);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error playing sound:", error);
      setIsPlaying(false);
      setIsLoading(false);
      setAlertConfig({
        title: "Audio Error",
        message: "There was a problem playing the audio or there is no audio yet. Please try again later.",
        type: "error",
        confirmText: "OK",
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    }
  }

  async function pauseSound() {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  }

  // Toggle audio play/pause
  const toggleAudio = () => {
    if (isPlaying) {
      pauseSound();
    } else {
      playSound();
    }
  };

  function onPlaybackStatusUpdate(status) {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  }

  // Pulse animation for audio button
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  useEffect(() => {
    // Clean up sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    // Start animations once data is loaded
    if (!isDataLoading && nameDetails) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ]).start();
    }
  }, [isDataLoading, nameDetails]);

  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "ur" : "en"));
  };

  const getGradientColors = () => {
    const gradients = [
      ["#FF9A9E", "#FAD0C4"],
      ["#A18CD1", "#FBC2EB"],
      ["#96E6A1", "#D4FC79"],
      ["#FFDEE9", "#B5FFFC"],
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Loading indicator while fetching data
  if (isDataLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/name.jpeg")}
        style={styles.background}
        blurRadius={3}
      >
       <Loader text= 'Loading Name........'/>
      </ImageBackground>
    );
  }

  // Error state
  if (error || !nameDetails) {
    return (
      <ImageBackground
        source={require("@/assets/images/name.jpeg")}
        style={styles.background}
        blurRadius={3}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load name details</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsDataLoading(true);
              setError(null);
              // Retry fetching the data
              axios.get(`${BASE_URL}/asmaulhusna/${id}`)
                .then(response => {
                  setNameDetails(response.data);
                  setAudioAvailable(!!response.data.audio);
                })
                .catch(err => {
                  console.error("Error retrying fetch:", err);
                  setError("Failed to load name details");
                  setAlertConfig({
                    title: "Error",
                    message: "Failed to load name details. Please try again later.",
                    type: "error",
                    confirmText: "OK",
                    onConfirm: () => setAlertVisible(false),
                  });
                  setAlertVisible(true);
                })
                .finally(() => {
                  setIsDataLoading(false);
                });
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/name.jpeg")}
      style={styles.background}
      blurRadius={3}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <BlurView intensity={90} tint="light" style={styles.blurContainer}>
            <LinearGradient
              colors={getGradientColors()}
              style={styles.gradientOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.numberContainer}>
                <Text style={styles.numberText}>{nameDetails.number}</Text>
              </View>

              <TouchableOpacity
                style={styles.languageButton}
                onPress={toggleLanguage}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E8E"]}
                  style={styles.langButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.languageButtonText}>
                    {language === "en" ? "✨ اردو ✨" : "✨ English ✨"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.contentSection}>
                <Text style={styles.arabicText}>{nameDetails.arabic}</Text>
                
                {/* Audio Button with Circle and Animation */}
                <View style={styles.audioButtonContainer}>
                  <TouchableOpacity 
                    style={styles.audioButton} 
                    onPress={toggleAudio} 
                    activeOpacity={0.7}
                    disabled={isLoading || !audioAvailable}
                  >
                    <Animated.View
                      style={[
                        styles.audioIconContainer,
                        { 
                          transform: [
                            { scale: isPlaying ? pulseAnim : 1 }
                          ],
                          backgroundColor: !audioAvailable ? 'rgba(200,200,200,0.5)' : 'rgba(255,255,255,0.9)'
                        },
                      ]}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#4CAF50" size="large" />
                      ) : (
                        <Ionicons
                          name={isPlaying ? "pause-circle" : "play-circle"}
                          size={60}
                          color="#4CAF50"
                        />
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                  
                  {!audioAvailable && (
                    <Text style={styles.audioUnavailableText}>
                      Audio unavailable
                    </Text>
                  )}
                </View>

                {language === "en" ? (
                  <Text style={styles.transliterationText}>
                    {nameDetails.transliteration}
                  </Text>
                ) : (
                  <Text style={styles.urduText}>{nameDetails.urdu}</Text>
                )}

                <View style={styles.divider} />

                <View style={styles.meaningSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      language === "ur" && styles.urduSectionTitle,
                    ]}
                  >
                    {language === "en" ? "✨ Meaning ✨" : "✨ معنی ✨"}
                  </Text>
                  <Text
                    style={[
                      styles.meaningText,
                      language === "ur" && styles.urduMeaningText,
                    ]}
                  >
                    {language === "en" ? nameDetails.meaning : nameDetails.urduMeaning}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.explanationSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      language === "ur" && styles.urduSectionTitle,
                    ]}
                  >
                    {language === "en" ? "✨ Explanation ✨" : "✨ وضاحت ✨"}
                  </Text>
                  <Text
                    style={[
                      styles.explanationText,
                      language === "ur" && styles.urduExplanationText,
                    ]}
                  >
                    {language === "en" ? nameDetails.details : nameDetails.urduExplanation}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </ScrollView>

      {/* Render CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        showCancel={alertConfig.showCancel}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={() => setAlertVisible(false)}
      />
    </ImageBackground>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF6B6B",
    fontFamily: "Poppins-SemiBold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  errorText: {
    fontSize: 16,
    color: "#E53935",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
  mainCard: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: 30,
  },
  gradientOverlay: {
    padding: 15,
    minHeight: 200,
    borderColor: "rgba(255,255,255,0.3)",
  },
  numberContainer: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 8,
    minWidth: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  numberText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontFamily: "Poppins-Bold",
  },
  audioButtonContainer: {
    alignItems: "center",
    marginVertical: 5,
  },
  audioButton: {
    marginVertical: 2,
  },
  audioIconContainer: {
    backgroundColor: "#FFF",
    borderRadius: 40,
    padding: 4,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#ebb5d5",
  },
  audioUnavailableText: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Poppins-Regular",
  },
  languageButton: {
    alignSelf: "center",
    marginVertical: 15,
    width: width * 0.5,
  },
  langButtonGradient: {
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  languageButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  contentSection: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 25,
    padding: 15,
    marginTop: 10,
  },
  arabicText: {
    fontSize: 40,
    color: "#FF6B6B",
    textAlign: "center",
    fontFamily: "AmiriQuranColored",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  transliterationText: {
    fontSize: 20,
    color: "#666",
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    marginTop: 5,
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(255,107,107,0.2)",
    marginVertical: 18,
    borderRadius: 1,
  },
  meaningSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#FF6B6B",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  urduSectionTitle: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 26,
    lineHeight: 40,
  },
  meaningText: {
    fontSize: 17,
    color: "#444",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: 28,
  },
  explanationSection: {
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    color: "#555",
    textAlign: "justify",
    fontFamily: "Poppins-Regular",
    lineHeight: 26,
  },
  urduText: {
    fontSize: 22,
    color: "#666",
    textAlign: "center",
    fontFamily: "NotoNastaliqUrdu-Regular",
    marginBottom: 15,
    lineHeight: 45,
  },
  urduMeaningText: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 19,
    lineHeight: 40,
    textAlign: "center",
  },
  urduExplanationText: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 18,
    lineHeight: 40,
    textAlign: "center",
  },
});

export default NamesDetails;