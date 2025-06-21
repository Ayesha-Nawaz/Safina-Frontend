// ScheduleModalComponent.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

const ScheduleModal = ({ visible, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("1");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalTime, setOriginalTime] = useState("");
  const [originalDuration, setOriginalDuration] = useState("");
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const headerBounceAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = {
    title: useRef(new Animated.Value(1)).current,
    time: useRef(new Animated.Value(1)).current,
    duration: useRef(new Animated.Value(1)).current,
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(height);
      fadeAnim.setValue(0);

      Animated.parallel([
        // Keep your existing animations
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Add these new animations
        Animated.loop(
          Animated.sequence([
            Animated.timing(headerBounceAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(headerBounceAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      // Keep your existing close animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (editingTask) {
      // Convert 24-hour time back to 12-hour format for editing
      const convertTo12Hour = (time24h) => {
        if (!time24h) return "";

        const [hours, minutes] = time24h.split(":");
        const hourNum = parseInt(hours);

        if (hourNum === 0) return `12:${minutes || "00"} am`;
        if (hourNum === 12) return `12:${minutes || "00"} pm`;

        if (hourNum > 12) {
          return `${hourNum - 12}:${minutes || "00"} pm`;
        }

        return `${hourNum}:${minutes || "00"} am`;
      };

      const formattedTime = convertTo12Hour(editingTask.time);

      setTitle(editingTask.title);
      setTime(formattedTime);
      setDurationWeeks(editingTask.durationWeeks?.toString() || "1");

      // Set original values for comparison
      setOriginalTitle(editingTask.title);
      setOriginalTime(formattedTime);
      setOriginalDuration(editingTask.durationWeeks?.toString() || "1");
    } else {
      // Reset all fields when not editing
      setTitle("");
      setTime("");
      setDurationWeeks("1");
      setOriginalTitle("");
      setOriginalTime("");
      setOriginalDuration("1");
    }
  }, [editingTask]);

  const handleSave = () => {
    Animated.sequence([
      Animated.timing(scaleAnims.title, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims.title, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const updates = {};

      if (editingTask) {
        if (title !== originalTitle) updates.title = title;
        if (time !== originalTime) updates.time = time;
        if (durationWeeks !== originalDuration)
          updates.durationWeeks = parseInt(durationWeeks);
      } else {
        updates.title = title;
        updates.time = time;
        updates.durationWeeks = parseInt(durationWeeks);
      }

      onSave(
        updates.title || originalTitle,
        updates.time || originalTime,
        updates.durationWeeks || parseInt(originalDuration)
      );

      setTitle("");
      setTime("");
      setDurationWeeks("1");
      setOriginalTitle("");
      setOriginalTime("");
      setOriginalDuration("");
    });
  };

  const animateInput = (anim) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const shakeButton = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            backgroundColor: "rgba(17, 25, 40, 0.75)",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { translateY: slideAnim },
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.glassEffect} />

          <View style={styles.headerContainer}>
            <Animated.Text
              style={[
                styles.modalHeader,
                {
                  transform: [{ scale: headerBounceAnim }],
                },
              ]}
            >
              {editingTask ? "✨ Edit Schedule" : "✨ New Schedule"}
            </Animated.Text>
          </View>

          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ scale: scaleAnims.title }] },
            ]}
          >
            <Text style={styles.inputLabel}>Activity Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dua, Story, "
              value={title}
              onChangeText={setTitle}
              onFocus={() => animateInput(scaleAnims.title)}
              placeholderTextColor="#9CA3AF"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ scale: scaleAnims.time }] },
            ]}
          >
            <Text style={styles.inputLabel}>
              Set time to receive notifications
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 9 am, 5 pm"
              value={time}
              onChangeText={setTime}
              onFocus={() => animateInput(scaleAnims.time)}
              placeholderTextColor="#9CA3AF"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.inputContainer,
              { transform: [{ scale: scaleAnims.duration }] },
            ]}
          >
            <Text style={styles.inputLabel}>
              Set duration to keep it in schedule for
            </Text>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={[styles.input, styles.durationInput]}
                placeholder="Enter number of weeks (default: 1)"
                value={durationWeeks}
                onChangeText={setDurationWeeks}
                keyboardType="numeric"
                onFocus={() => animateInput(scaleAnims.duration)}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.weeksLabel}>weeks</Text>
            </View>
            <Text style={styles.helperText}>
              Leave empty for default duration (1 week)
            </Text>
          </Animated.View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                shakeButton();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Animated.Text
                style={[
                  styles.modalButtonText,
                  styles.cancelButtonText,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                Cancel
              </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={() => {
                shakeButton();
                handleSave();
              }}
              activeOpacity={0.7}
            >
              <Animated.Text
                style={[
                  styles.modalButtonText,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                {editingTask ? "✓ Save Changes" : "Add"}
              </Animated.Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  modalContent: {
    width: "88%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
    position: "relative",
    overflow: "hidden",
  },
  glassEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 28,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 25,
    fontFamily: "Poppins-Bold",
    color: "#000080",
    textAlign: "center",
    marginBottom: 5,
  },
  // headerSubtext: {
  //   fontSize: 16,fontFamily: "Poppins-Bold",
  //   color: '#6B7280',
  //   textAlign: 'center',
  // },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 5,
    marginLeft: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 13,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#F9FAFB",
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  durationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
    marginRight: 12,
  },
  weeksLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#4B5563",
    marginRight: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: "#000080",
    borderWidth: 0,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtonText: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#4B5563",
  },
  helperText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins-Regular",
    marginTop: 8,
    marginLeft: 4,
  },
});

export default ScheduleModal;
