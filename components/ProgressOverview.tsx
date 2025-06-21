import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { UserContext } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Loader from "./Loader";
import ProgressBar from "./ProgressBar";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const ProgressOverview = ({ onViewDetails }) => {
  const [overallContentProgress, setOverallContentProgress] = useState(0);
  const [quizProgress, setQuizProgress] = useState(0);
  const [totalStories, setTotalStories] = useState(10);
  const [totalKalmas, setTotalKalmas] = useState(6);
  const [totalDuas, setTotalDuas] = useState(10);
  const [totalNamazs, setTotalNamazs] = useState(11);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(UserContext);

  const fetchProgress = async () => {
    try {
      if (!user?.user?._id) {
        // Alert.alert("Error", "User not found or not logged in.");
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        // Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const currentUserId = user.user._id;

      const [
        storyProgressResponse,
        kalmaProgressResponse,
        duaProgressResponse,
        namazProgressResponse,
        quizProgressResponse,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/progress/storyprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/kalmaprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/duaprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/namazprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/progress/quizprogress/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Calculate individual progress percentages
      const storyProgress = Math.round(
        (storyProgressResponse.data.length / totalStories) * 100
      );
      const kalmaProgress = Math.round(
        (kalmaProgressResponse.data.length / totalKalmas) * 100
      );
      const duaProgress = Math.round(
        (duaProgressResponse.data.length / totalDuas) * 100
      );
      const namazProgress = Math.round(
        (namazProgressResponse.data.length / totalNamazs) * 100
      );

      // Calculate overall content progress
      const overallProgress = Math.round(
        (storyProgress + kalmaProgress + duaProgress + namazProgress) / 4
      );

      // Calculate quiz progress
      const quizData = quizProgressResponse.data;
      const quizCompletion = quizData.totalQuizzes
        ? Math.round(
            (quizData.attemptedQuizzes / quizData.totalQuizzes) * 100
          )
        : 0;

      setOverallContentProgress(overallProgress);
      setQuizProgress(quizCompletion);
      setTotalQuizzes(quizData.totalQuizzes || 0);
    } catch (error) {
      console.error("Error fetching progress:", error);
      // Alert.alert(
      //   "Error",
      //   error.response?.data?.message || "Failed to fetch progress"
      // );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <Loader text="Loading progress..." />;
  }

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Learning Progress Overview</Text>

        <View style={styles.progressContent}>
          <ProgressBar
            label="Overall Content Progress"
            progressPercentage={overallContentProgress}
            color="#4CAF50"
          />
          <ProgressBar
            label="Quiz Progress"
            progressPercentage={quizProgress}
            color="#2196F3"
          />
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <FontAwesome
            name="arrow-right"
            size={16}
            color="#fff"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressSection: {
    width: "100%",
    marginBottom: 60,
  },
  progressCard: {
    borderRadius: 20,
    padding: 10,
  },
  progressContent: {
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#68007e",
    marginBottom: 20,
    textAlign: "center",
  },
  viewButton: {
    backgroundColor: "#614385",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
    width: "100%",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default ProgressOverview;