import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from "expo-router";
import { Names } from "@/types/types";
import { colors } from "@/assets/data/color";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import axios from "axios";
import Loader from "./Loader";

const AsmaUlHusnaComp: React.FC = () => {
  const [data, setData] = useState<Names[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // 🔥 Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/asmaulhusna/names`);
        console.log("Fetched Data:", response.data); // 🔍 Check API response
  
        if (!response.data || response.data.length === 0) {
          throw new Error("No data received from API"); // Handle empty response
        }

        // Sort data by the 'number' field in ascending order
        const sortedData = response.data.sort((a: Names, b: Names) => a.number - b.number);
        setData(sortedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (axios.isAxiosError(err)) {
          console.error("Axios error details:", err.response?.data);
        }
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const animatePress = (pressed: boolean) => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: { item: Names }) => {
    const color1 = getRandomColor();
    const color2 = getRandomColor();

    return (
      <Link
        href={{
          pathname: "/Names_Details",
          params: {
            id: item._id, 
          },
        }}
        asChild
      >
        <TouchableOpacity
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
        >
          <Animated.View style={[styles.itemContainer, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={[color1, color2]} style={styles.gradientBackground}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>
              <Text style={styles.itemArabic}>{item.arabic}</Text>
              <Text style={styles.itemTransliteration}>{item.transliteration}</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  if (loading) {
    return (
      <Loader text="Loading AsmaulHusna..." /> // Using Loader component for loading state
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>✨Beautiful Names of Allah✨</Text>
      <FlatList
        data={data} // Using sorted data
        renderItem={renderItem}
        keyExtractor={(item) => item.number.toString()}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    color: "#c60068",
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  grid: {
    justifyContent: "space-around",
    marginBottom: 15,
  },
  itemContainer: {
    width: 150,
    height: 140,
    margin: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  numberBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  itemArabic: {
    fontSize: 28,
    color: "#dd016e",
    textAlign: "center",
    fontFamily: "Amiri-Bold",
  },
  itemTransliteration: {
    fontSize: 13,
    color: "#f3552c",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Poppins-Bold",
  },
});

export default AsmaUlHusnaComp;