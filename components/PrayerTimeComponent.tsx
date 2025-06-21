import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Image,
  StatusBar,
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Country, City } from "country-state-city";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import Loader from "./Loader";

const { width, height } = Dimensions.get("window");

const PrayerTimeComponent = () => {
  // States
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isCityPickerVisible, setCityPickerVisible] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const locationAnimation = useRef(new Animated.Value(-30)).current;
  
  // Lottie animation ref
  const lottieRef = useRef(null);

  // Prayer icons with gradient colors for each prayer
  const prayerInfo = {
    Fajr: {
      icon: "weather-sunset-up",
      gradient: ["#4286f4", "#373B44"],
      description: "Morning Prayer",
    },
    Sunrise: {
      icon: "weather-sunset",
      gradient: ["#FF9500", "#FF5E3A"],
      description: "Sunrise",
    },
    Dhuhr: {
      icon: "weather-sunny",
      gradient: ["#3498db", "#2980b9"],
      description: "Noon Prayer", 
    },
    Asr: {
      icon: "weather-partly-cloudy",
      gradient: ["#1D976C", "#93F9B9"],
      description: "Afternoon Prayer",
    },
    Maghrib: {
      icon: "weather-sunset-down",
      gradient: ["#614385", "#516395"],
      description: "Sunset Prayer",
    },
    Isha: {
      icon: "weather-night",
      gradient: ["#141E30", "#243B55"],
      description: "Night Prayer",
    },
    Sunset: {
      icon: "weather-sunset",
      gradient: ["#EB3349", "#F45C43"],
      description: "Sunset",
    },
    
  };

  // Fetch all countries
  const countries = Country.getAllCountries();

  // Fetch cities for the selected country
  const cities = selectedCountry ? City.getCitiesOfCountry(selectedCountry.isoCode) : [];

  // Filter countries based on search query
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  // Filter cities based on search query
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Determine next prayer
  useEffect(() => {
    if (prayerTimes.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      // Convert prayer times to minutes since midnight
      const prayerTimesInMinutes = prayerTimes.map(prayer => {
        const [hour, minute] = prayer.time.split(':').map(Number);
        return {
          ...prayer,
          minutesSinceMidnight: hour * 60 + minute
        };
      });

      // Find the next prayer
      let next = prayerTimesInMinutes.find(prayer => 
        prayer.minutesSinceMidnight > currentTimeMinutes
      );

      // If no prayer is found, it means all prayers for today have passed
      if (!next) {
        next = prayerTimesInMinutes[0]; // Tomorrow's first prayer
      }

      setNextPrayer(next);
    }
  }, [prayerTimes, currentTime]);

  // Handle country selection
  const handleCountrySelect = (country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country);
    setCountry(country.name);
    setCity(""); // Reset city when country changes
    setCountryPickerVisible(false);
    setCountrySearchQuery(""); // Clear search query
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCity(city);
    setCity(city.name);
    setCityPickerVisible(false);
    setCitySearchQuery(""); // Clear search query
  };

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Check if the city and country are selected
      if (!city || !country) {
        throw new Error("Please select a city and country.");
      }

      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // If city is valid, proceed with prayer times API
      const response = await axios.get("https://api.aladhan.com/v1/timingsByCity", {
        params: {
          city,
          country,
          method: 1, // University of Islamic Sciences, Karachi
          school: 1, // Shafi'i
          adjustment: 1,
        },
      });

      const timings = response.data.data.timings;
      const formattedTimes = Object.keys(timings)
        .filter((key) =>
          ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Sunset"].includes(key)
        )
        .map((key) => ({
          name: key,
          time: timings[key],
          icon: prayerInfo[key].icon,
          gradient: prayerInfo[key].gradient,
          description: prayerInfo[key].description,
        }));

      setPrayerTimes(formattedTimes);
      animateItems();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error fetching prayer times. Please try again later.");
      setPrayerTimes([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const animateItems = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    headerAnimation.setValue(0);
    locationAnimation.setValue(-30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(locationAnimation, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    if (city && country) {
      fetchPrayerTimes();
    }
    
    // Initial animation for header
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [city, country]);

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchPrayerTimes();
  };

  // Format time with AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Calculate time remaining until next prayer
  const calculateTimeRemaining = (prayerTime) => {
    if (!prayerTime) return '';
    
    const now = new Date();
    const [hours, minutes] = prayerTime.time.split(':').map(Number);
    
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0);
    
    // If prayer time is earlier today, it must be for tomorrow
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diffMs = prayerDate - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };

  const renderPrayerItem = ({ item, index }) => {
    const isNext = nextPrayer && nextPrayer.name === item.name;
    
    return (
      <Animated.View
        style={[
          styles.prayerItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(index * 0.4 + 1)) }],
          },
          isNext && styles.nextPrayerItem
        ]}
      >
        <LinearGradient
          colors={item.gradient || ["#4c669f", "#3b5998", "#192f6a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prayerGradient}
        >
          <BlurView intensity={isNext ? 50 : 20} tint="light" style={styles.blurContainer}>
            {isNext && (
              <View style={styles.nextPrayerBadge}>
                <Text style={styles.nextPrayerText}>NEXT</Text>
              </View>
            )}
            <View style={styles.prayerContent}>
              <View style={styles.prayerHeader}>
                <MaterialCommunityIcons name={item.icon} size={30} color="#fff" style={styles.prayerIcon} />
                <View>
                  <Text style={styles.prayerName}>{item.name}</Text>
                  <Text style={styles.prayerDescription}>{item.description}</Text>
                  {isNext && (
                    <Text style={styles.timeRemaining}>{calculateTimeRemaining(item)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.prayerTime}>{formatTime(item.time)}</Text>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      
      <View
        style={styles.background}
      >
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: headerAnimation,
              transform: [{ translateY: Animated.multiply(headerAnimation, new Animated.Value(-20)) }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>
            Prayer Times
            <Text style={styles.emoji}> 🕌</Text>
          </Text>
          
          {city && country && (
            <Animated.View 
              style={{
                opacity: headerAnimation,
                transform: [{ translateY: locationAnimation }]
              }}
            >
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#018163" />
                <Text style={styles.locationText}>{city}, {country}</Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <View style={styles.searchContainer}>
          {/* Country Picker */}
          <TouchableOpacity
            style={styles.inputWrapper}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCountryPickerVisible(true);
            }}
          >
            <LinearGradient
              colors={["#ffffff", "#f5f5f5"]}
              style={styles.inputGradient}
            >
              <Ionicons
                name="earth"
                size={20}
                color="#018163"
                style={styles.inputIcon}
              />
              <Text style={[styles.input, !country && styles.placeholder]}>
                {country || "Select Country"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </LinearGradient>
          </TouchableOpacity>

          {/* City Picker */}
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              !selectedCountry && styles.disabledInput
            ]}
            activeOpacity={selectedCountry ? 0.7 : 1}
            onPress={() => {
              if (selectedCountry) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCityPickerVisible(true);
              } else {
                setError("Please select a country first");
                setTimeout(() => setError(null), 3000);
              }
            }}
          >
            <LinearGradient
              colors={["#ffffff", "#f5f5f5"]}
              style={styles.inputGradient}
            >
              <Ionicons
                name="location"
                size={20}
                color={selectedCountry ? "#018163" : "#999"}
                style={styles.inputIcon}
              />
              <Text style={[
                styles.input, 
                !city && styles.placeholder,
                !selectedCountry && styles.disabledText
              ]}>
                {city || "Select City"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={selectedCountry ? "#666" : "#999"} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Country Picker Modal */}
        <Modal
          visible={isCountryPickerVisible}
          transparent={true}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={() => setCountryPickerVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Country</Text>
                    <TouchableOpacity onPress={() => setCountryPickerVisible(false)}>
                      <Ionicons name="close-circle" size={24} color="#018163" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search country"
                      placeholderTextColor="#666"
                      value={countrySearchQuery}
                      onChangeText={setCountrySearchQuery}
                    />
                    {countrySearchQuery ? (
                      <TouchableOpacity onPress={() => setCountrySearchQuery("")}>
                        <Ionicons name="close" size={20} color="#666" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  
                  <FlatList
                    data={filteredCountries}
                    keyExtractor={(item) => item.isoCode}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => handleCountrySelect(item)}
                      >
                        <Text style={styles.modalItemText}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* City Picker Modal */}
        <Modal
          visible={isCityPickerVisible}
          transparent={true}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={() => setCityPickerVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select City in {country}</Text>
                    <TouchableOpacity onPress={() => setCityPickerVisible(false)}>
                      <Ionicons name="close-circle" size={24} color="#018163" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search city"
                      placeholderTextColor="#666"
                      value={citySearchQuery}
                      onChangeText={setCitySearchQuery}
                    />
                    {citySearchQuery ? (
                      <TouchableOpacity onPress={() => setCitySearchQuery("")}>
                        <Ionicons name="close" size={20} color="#666" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  
                  {filteredCities.length > 0 ? (
                    <FlatList
                      data={filteredCities}
                      keyExtractor={(item) => item.name}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => handleCitySelect(item)}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                      )}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>
                        No cities found. Try a different search.
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {error && (
          <Animated.View 
            style={[
              styles.errorContainer,
              {
                opacity: fadeAnim
              }
            ]}
          >
            <Ionicons name="alert-circle" size={24} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
        
        {loading ? (
          <Loader text="loading Prayer time" />
        ) : (
          <FlatList
            data={prayerTimes}
            renderItem={renderPrayerItem}
            keyExtractor={(item) => item.name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              !error && !loading && (
                <View style={styles.emptyContainer}>
                  <LottieView
                    source={require('@/assets/images/namaz.jpeg')}
                    style={styles.emptyAnimation}
                    autoPlay
                    loop
                  />
                  <Text style={styles.emptyText}>
                    Select your location to see prayer times
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 34,
    fontFamily: "Poppins-Bold",
    color: "#018163",
    textAlign: "center",
    textShadowColor: "rgba(1, 129, 99, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  emoji: {
    fontSize: 30,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: "rgba(1, 129, 99, 0.1)",
    borderRadius: 15,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#018163",
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 15,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 0,
  },
  disabledInput: {
    opacity: 0.7,
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
  },
  inputIcon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  placeholder: {
    color: "#999",
  },
  disabledText: {
    color: "#aaa",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255, 205, 210, 0.8)",
    borderRadius: 15,
    marginBottom: 15,
  },
  errorText: {
    flex: 1,
    color: "#D32F2F",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    marginLeft: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    color: "#018163",
    marginTop: 15,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
    padding: 10,
  },
  prayerItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextPrayerItem: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  prayerGradient: {
    borderRadius: 20,
  },
  blurContainer: {
    padding: 20,
    overflow: "hidden",
  },
  nextPrayerBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFC107",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  nextPrayerText: {
    color: "#000",
    fontSize: 10,
    fontFamily: "Poppins-Bold",
  },
  prayerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  prayerIcon: {
    marginRight: 15,
  },
  prayerName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  prayerDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeRemaining: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF9C4",
    marginTop: 4,
  },
  timeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    
  },
  prayerTime: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width - 40,
    maxHeight: height * 0.7,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#018163",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyAnimation: {
    width: 200,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
});


export default PrayerTimeComponent;