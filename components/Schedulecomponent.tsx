import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ImageBackground,
  RefreshControl, // Add this import
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { colors } from "@/assets/data/color";
import ScheduleModal from "@/components/ScheduleModalComponent";
import CustomAlert from "@/components/CustomAlert"; // Import CustomAlert
import { UserContext } from "@/context/UserContext";
import Loader from "./Loader";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const { width } = Dimensions.get("window");

const Schedule = () => {
  const { user } = useContext(UserContext);
  const [scheduleData, setScheduleData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [userToken, setUserToken] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // CustomAlert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    confirmText: "OK",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Helper function to show custom alerts
  const showAlert = (config) => {
    setAlertConfig({
      ...alertConfig,
      ...config,
    });
    setAlertVisible(true);
  };

  const checkExpiredSchedules = (schedules) => {
    const currentTime = new Date();
    return schedules.filter((schedule) => {
      const expirationTime = new Date(schedule.createdAt);
      expirationTime.setDate(
        expirationTime.getDate() + schedule.durationWeeks * 7
      );
      return currentTime <= expirationTime;
    });
  };

  const fetchUserDataAndSchedules = async (isRefresh = false) => {
    try {
      // Only show loading spinner on initial load, not on refresh
      if (!isRefresh) {
        setIsLoading(true);
      }

      const token = await AsyncStorage.getItem("userToken");
      const userId = user._id;

      if (!token || !userId) {
        if (!isRefresh) setIsLoading(false);
        if (isRefresh) setRefreshing(false);
        return;
      }

      setUserToken(token);

      const scheduleResponse = await axios.get(
        `${BASE_URL}/schedule/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const validSchedules = checkExpiredSchedules(scheduleResponse.data || []);
      const sortedSchedules = validSchedules.sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

      setScheduleData(sortedSchedules);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (!isLoading && !isRefresh) {
        showAlert({
          title: "Error",
          message: "Failed to fetch schedules. Please try again.",
          type: "error",
        });
      }
    } finally {
      if (!isRefresh) setIsLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDataAndSchedules(true);
  };

  useEffect(() => {
    fetchUserDataAndSchedules();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const checkInterval = setInterval(() => {
      setScheduleData((prevData) => checkExpiredSchedules(prevData));
    }, 60000);

    return () => clearInterval(checkInterval);
  }, []);

  const handleAddOrEditSchedule = async (title, time, durationWeeks) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        showAlert({
          title: "Error",
          message: "Please log in to continue",
          type: "error",
        });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Validate the time format first
      if (!validateScheduleInput(title, time, durationWeeks)) return;

      // Convert time to 24-hour format
      const timeIn24 = convertTo24Hour(time);
      if (!timeIn24) {
        showAlert({
          title: "Time Format Error",
          message:
            "Please specify time in 12-hour format\nExample: 9am, 9:00 pm",
          type: "error",
        });
        return;
      }

      if (editingTask) {
        const updates = {
          title: title.trim() || editingTask.title,
          time: timeIn24, // Use the converted time directly
          durationWeeks: parseInt(durationWeeks) || editingTask.durationWeeks,
          color: editingTask.color,
        };

        try {
          await axios.put(
            `${BASE_URL}/schedule/${editingTask._id}`,
            updates,
            config
          );

          setModalVisible(false);
          setEditingTask(null);
          showAlert({
            title: "Success",
            message: "Schedule updated successfully",
            type: "success",
          });
        } catch (updateError) {
          console.error("Update Error Details:", updateError);

          showAlert({
            title: "Update Error",
            message:
              updateError.response?.data?.message ||
              "Failed to update schedule. Please check your input.",
            type: "error",
          });
          return;
        }
      } else {
        const newSchedulePayload = {
          userId,
          title: title.trim(),
          time: timeIn24,
          durationWeeks: parseInt(durationWeeks),
          color: getRandomGradient(),
        };

        try {
          await axios.post(`${BASE_URL}/schedule`, newSchedulePayload, config);

          setModalVisible(false);
          setEditingTask(null);
          showAlert({
            title: "Success",
            message: "Schedule created successfully",
            type: "success",
          });
        } catch (createError) {
          console.error("Create Error Details:", createError);

          showAlert({
            title: "Create Error",
            message:
              createError.response?.data?.message ||
              "Failed to create schedule. Please check your input.",
            type: "error",
          });
          return;
        }
      }

      await fetchUserDataAndSchedules();
    } catch (error) {
      console.error("Save schedule error:", error);
      showAlert({
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
      });
    }
  };

  const handleDeleteSchedule = async (id) => {
    showAlert({
      title: "Delete Schedule",
      message: "Are you sure you want to delete this schedule?",
      type: "warning",
      showCancel: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onCancel: () => setAlertVisible(false),
      onConfirm: async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          if (!token) {
            showAlert({
              title: "Error",
              message: "Please log in to continue",
              type: "error",
            });
            return;
          }

          await axios.delete(`${BASE_URL}/schedule/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          await fetchUserDataAndSchedules();
          showAlert({
            title: "Success",
            message: "Schedule deleted successfully",
            type: "success",
          });
        } catch (error) {
          console.error("Delete schedule error:", error);
          showAlert({
            title: "Error",
            message: "Failed to delete schedule",
            type: "error",
          });
        }
      },
    });
  };

  const convertTo24Hour = (time12h) => {
    try {
      if (!time12h) return null;

      // If already in 24-hour format, return as is
      if (/^\d{2}:\d{2}$/.test(time12h)) return time12h;

      // Normalize input
      time12h = time12h.trim().toLowerCase();

      // Comprehensive regex to match various time formats
      const match = time12h.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
      if (!match) return null;

      let [, hours, minutes, period] = match;
      hours = parseInt(hours);
      minutes = minutes || "00";

      // Time conversion logic
      if (period === "am") {
        if (hours === 12) hours = 0;
      } else if (period === "pm") {
        if (hours === 12) {
          hours = 12;
        } else {
          hours += 12;
        }
      }

      return `${String(hours).padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    } catch (error) {
      console.error("Time conversion error:", error);
      return null;
    }
  };

  const validateScheduleInput = (title, time, durationWeeks) => {
    if (title && title.trim().length < 2) {
      showAlert({
        title: "Error",
        message: "Title must be at least 2 characters long",
        type: "error",
      });
      return false;
    }

    if (!time || time.trim() === "") {
      showAlert({
        title: "Time Format Error",
        message: "Please specify time\nExamples: 8:20 am, 9:11 pm, 5 pm",
        type: "error",
      });
      return false;
    }

    // More flexible time format validation
    const timeRegex = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;
    if (!timeRegex.test(time.trim())) {
      showAlert({
        title: "Time Format Error",
        message:
          "Use format: hour[:minutes] am/pm\nExamples: 8:20 am, 9:11 pm, 5 pm",
        type: "error",
      });
      return false;
    }

    const duration = parseInt(durationWeeks);
    if (!duration || duration < 1 || duration > 52) {
      showAlert({
        title: "Error",
        message: "Duration must be between 1 and 52 weeks",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const getRandomGradient = () => {
    const colors = [
      "#D1C4E9",
      "#FFA5A5",
      "#FFD3B5",
      "#B5E2FF",
      "#FFECB3",
      "#E6E6FA",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderScheduleItem = ({ item, index }) => {
    const itemScale = new Animated.Value(1);

    const handlePress = () => {
      Animated.sequence([
        Animated.spring(itemScale, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.spring(itemScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Animated.View
        style={[
          styles.scheduleItem,
          {
            opacity: fadeAnim,
            transform: [{ scale: itemScale }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffe4eb", "#c5cff7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scheduleGradient}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              toggleTaskCompletion(item._id);
              handlePress();
            }}
          >
            <View
              style={[
                styles.checkbox,
                completedTasks.has(item._id) && styles.checkboxChecked,
              ]}
            >
              {completedTasks.has(item._id) && (
                <Ionicons name="checkmark" size={16} color="black" />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.scheduleContent}>
            <View style={styles.scheduleHeader}>
              <Text
                style={[
                  styles.scheduleTitle,
                  completedTasks.has(item._id) && styles.completedText,
                ]}
              >
                {item.title}
              </Text>
              <View style={styles.scheduleTime}>
                <Ionicons name="time-outline" size={18} color="black" />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>

            <View style={styles.scheduleMeta}>
              <View style={styles.durationBadge}>
                <Ionicons name="calendar-outline" size={16} color="black" />
                <Text style={styles.durationText}>
                  {item.durationWeeks}{" "}
                  {item.durationWeeks === 1 ? "week" : "weeks"}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingTask(item);
                    setModalVisible(true);
                  }}
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Ionicons name="pencil" size={20} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteSchedule(item._id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Ionicons name="trash-outline" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <CustomAlert
            visible={alertVisible}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            showCancel={alertConfig.showCancel}
            confirmText={alertConfig.confirmText}
            cancelText={alertConfig.cancelText}
            onClose={() => setAlertVisible(false)}
            onConfirm={alertConfig.onConfirm}
            onCancel={alertConfig.onCancel}
          />
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSubtitle}>
            Keep track of your activities
          </Text>
        </View>

        <FlatList
          data={scheduleData}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.scheduleList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4158D0', '#C850C0']} // Android colors
              tintColor="#4158D0" // iOS color
              title="Pull to refresh" // iOS title
              titleColor="#666666" // iOS title color
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#4E65FF" />

              <Text style={styles.emptyText}>
                {isLoading ? (
                  <Loader text="Loading Schedule..." />
                ) : (
                  "No schedules yet"
                )}
              </Text>
              <Text style={styles.emptySubtext}>
                {!isLoading && "Tap the + button to add your first schedule"}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
              Alert.alert("Error", "Please log in to continue");
              return;
            }
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={["#4158D0", "#C850C0"]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={30} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        <ScheduleModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditingTask(null);
          }}
          onSave={handleAddOrEditSchedule}
          editingTask={editingTask}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout styles
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },

  // Header styles
  header: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Poppins-Bold",
    color: "#000080",
    marginBottom: 3,
    textShadowColor: "rgba(235, 224, 224, 0.94)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#616162",
    textAlign: "center",
    textShadowColor: "rgba(243, 237, 237, 0.94)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Schedule list styles
  scheduleList: {
    padding: 16,
    paddingBottom: 100,
  },
  scheduleItem: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },

  // Schedule item container styles
  scheduleGradient: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },

  // Title and text styles
  scheduleTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "black",
    marginRight: 12,
    marginLeft: 12,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "rgba(75, 70, 70, 0.53)",
  },
  timeText: {
    marginLeft: 4,
    fontSize: 13,
    color: "black",
    fontFamily: "Poppins-SemiBold",
  },
  durationText: {
    marginLeft: 4,
    fontSize: 14,
    color: "black",
    fontFamily: "Poppins-SemiBold",
  },

  // Badge styles
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Action buttons styles
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  // Checkbox styles
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "black",
    marginTop: 25,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "gray",
    borderColor: "gray",
  },

  // Schedule meta information
  scheduleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Add button styles
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    shadowColor: "#4158D0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state styles
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    marginTop: 16,
    fontFamily: "Poppins-SemiBold",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#666666",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
});

export default Schedule;