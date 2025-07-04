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
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const { height } = Dimensions.get("window");

const ScheduleModal = ({ visible, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("1");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalTime, setOriginalTime] = useState("");
  const [originalDuration, setOriginalDuration] = useState("");
  const [timePickerVisible, setTimePickerVisible] = useState(false);
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

  // Time picker state
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const timePickerSlideAnim = useRef(new Animated.Value(height)).current;
  const timePickerFadeAnim = useRef(new Animated.Value(0)).current;

  // Update time display whenever hour, minute, or period changes - both in picker and main input
  useEffect(() => {
    const formattedTime = `${hour}:${minute} ${period}`;
    setTime(formattedTime);
  }, [hour, minute, period]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(height);
      fadeAnim.setValue(0);

      Animated.parallel([
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
      const convertTo12Hour = (time24h) => {
        if (!time24h) return "";
        const [hours, minutes] = time24h.split(":");
        const hourNum = parseInt(hours);

        if (hourNum === 0) return `12:${minutes || "00"} AM`;
        if (hourNum === 12) return `12:${minutes || "00"} PM`;
        if (hourNum > 12) {
          return `${hourNum - 12}:${minutes || "00"} PM`;
        }
        return `${hourNum}:${minutes || "00"} AM`;
      };

      const formattedTime = convertTo12Hour(editingTask.time);
      if (formattedTime) {
        const [hourPart, rest] = formattedTime.split(":");
        const [minutePart, periodPart] = rest.split(" ");
        setHour(hourPart.padStart(2, "0"));
        setMinute(minutePart);
        setPeriod(periodPart);
        setTime(formattedTime);
      } else {
        setHour("12");
        setMinute("00");
        setPeriod("AM");
        setTime("");
      }

      setTitle(editingTask.title);
      setDurationWeeks(editingTask.durationWeeks?.toString() || "1");
      setOriginalTitle(editingTask.title);
      setOriginalTime(formattedTime);
      setOriginalDuration(editingTask.durationWeeks?.toString() || "1");
    } else {
      setTitle("");
      setTime("");
      setHour("12");
      setMinute("00");
      setPeriod("AM");
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
      const formattedTime = `${hour}:${minute} ${period}`;

      if (editingTask) {
        if (title !== originalTitle) updates.title = title;
        if (formattedTime !== originalTime) updates.time = formattedTime;
        if (durationWeeks !== originalDuration)
          updates.durationWeeks = parseInt(durationWeeks);
      } else {
        updates.title = title;
        updates.time = formattedTime;
        updates.durationWeeks = parseInt(durationWeeks);
      }

      onSave(
        updates.title || originalTitle,
        updates.time || originalTime,
        updates.durationWeeks || parseInt(originalDuration)
      );

      setTitle("");
      setTime("");
      setHour("12");
      setMinute("00");
      setPeriod("AM");
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

  const showTimePicker = () => {
    // Set initial time if not already set
    if (!time) {
      const initialTime = `${hour}:${minute} ${period}`;
      setTime(initialTime);
    }
    setTimePickerVisible(true);
    timePickerSlideAnim.setValue(height);
    timePickerFadeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(timePickerSlideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(timePickerFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideTimePicker = () => {
    Animated.parallel([
      Animated.timing(timePickerSlideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(timePickerFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setTimePickerVisible(false));
  };

  const confirmTime = () => {
    const formattedTime = `${hour}:${minute} ${period}`;
    setTime(formattedTime);
    hideTimePicker();
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

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
            <Pressable
              style={styles.timeInput}
              onPress={() => {
                animateInput(scaleAnims.time);
                showTimePicker();
              }}
            >
              <Text style={styles.timeDisplay}>{time || "Select Time"}</Text>
            </Pressable>
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

        <Modal
          animationType="none"
          transparent={true}
          visible={timePickerVisible}
          onRequestClose={hideTimePicker}
        >
          <Animated.View
            style={[
              styles.timePickerOverlay,
              {
                opacity: timePickerFadeAnim,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
            ]}
          >
            <Animated.View
              style={[
                styles.timePickerContent,
                {
                  transform: [{ translateY: timePickerSlideAnim }],
                },
              ]}
            >
              <View style={styles.timePickerGlassEffect} />
              <Text style={styles.timePickerTitle}>SELECT TIME</Text>
              
              {/* Real-time time display */}
              <View style={styles.timeDisplayContainer}>
                <Text style={styles.currentTimeDisplay}>
                  {hour}:{minute} {period}
                </Text>
              </View>

              {/* Labels for pickers */}
              <View style={styles.pickerLabelsContainer}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <Text style={styles.pickerLabel}>Minute</Text>
                <Text style={styles.pickerLabel}>Period</Text>
              </View>

              <View style={styles.timePickerSelectors}>
                <Picker
                  selectedValue={hour}
                  onValueChange={(value) => {
                    setHour(value);
                    const newTime = `${value}:${minute} ${period}`;
                    setTime(newTime);
                  }}
                  style={styles.timePickerSelector}
                  itemStyle={styles.timePickerItem}
                >
                  {hours.map((h) => (
                    <Picker.Item key={h} label={h} value={h} />
                  ))}
                </Picker>
                <Text style={styles.timePickerSeparator}>:</Text>
                <Picker
                  selectedValue={minute}
                  onValueChange={(value) => {
                    setMinute(value);
                    const newTime = `${hour}:${value} ${period}`;
                    setTime(newTime);
                  }}
                  style={styles.timePickerSelector}
                  itemStyle={styles.timePickerItem}
                >
                  {minutes.map((m) => (
                    <Picker.Item key={m} label={m} value={m} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={period}
                  onValueChange={(value) => {
                    setPeriod(value);
                    const newTime = `${hour}:${minute} ${value}`;
                    setTime(newTime);
                  }}
                  style={styles.timePickerSelector}
                  itemStyle={styles.timePickerItem}
                >
                  {periods.map((p) => (
                    <Picker.Item key={p} label={p} value={p} />
                  ))}
                </Picker>
              </View>
              <View style={styles.timePickerButtons}>
                <TouchableOpacity
                  style={styles.timePickerButtonCancel}
                  onPress={hideTimePicker}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timePickerButtonText, styles.cancelButtonText]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timePickerButtonOk}
                  onPress={confirmTime}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timePickerButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
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
  timeInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 13,
    backgroundColor: "#F9FAFB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  timeDisplay: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#111827",
  },
  timePickerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerContent: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    position: "relative",
    overflow: "hidden",
  },
  timePickerGlassEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#000080",
    textAlign: "center",
    marginBottom: 10,
  },
  timeDisplayContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  currentTimeDisplay: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#000080",
    textAlign: "center",
  },
  pickerLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#4B5563",
    textAlign: "center",
    flex: 1,
  },
  timePickerSelectors: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerSelector: {
    flex: 1,
    height: 80,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  timePickerItem: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#111827",
    textAlign: "center",
  },
  timePickerSeparator: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: "#111827",
    marginHorizontal: 5,
  },
  timePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timePickerButtonCancel: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  timePickerButtonOk: {
    flex: 1,
    padding: 12,
    backgroundColor: "#000080",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  timePickerButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
});

export default ScheduleModal;