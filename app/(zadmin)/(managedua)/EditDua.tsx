import "react-native-get-random-values";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { v4 as uuidv4 } from "uuid";

// Move SubDuaItem component outside to prevent recreation on each render
const SubDuaItem = ({ item, index, onFieldChange, onRemove, canRemove }) => {
  const handleLocalChange = useCallback((field, value) => {
    onFieldChange(index, field, value);
  }, [index, onFieldChange]);

  return (
    <View style={styles.subDuaCard}>
      <View style={styles.subDuaHeader}>
        <Text style={styles.subDuaTitle}>Dua {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(index)}>
            <Icon name="close-circle" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>ID</Text>
        <TextInput
          style={styles.textInput}
          value={item.id}
          onChangeText={(value) => handleLocalChange("id", value)}
          placeholder="Enter ID..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title (English)</Text>
        <TextInput
          style={styles.textInput}
          value={item.titleEng}
          onChangeText={(value) => handleLocalChange("titleEng", value)}
          placeholder="Enter English title..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title (Urdu)</Text>
        <TextInput
          style={[styles.textInput, styles.urduInput]}
          value={item.titleUrdu}
          onChangeText={(value) => handleLocalChange("titleUrdu", value)}
          placeholder="Enter Urdu title..."
          placeholderTextColor="#999"
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Arabic Text</Text>
        <TextInput
          style={[styles.textInput, styles.arabicInput]}
          value={item.arabic}
          onChangeText={(value) => handleLocalChange("arabic", value)}
          placeholder="Enter Arabic text..."
          placeholderTextColor="#999"
          multiline
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Content (English)</Text>
        <TextInput
          style={styles.textInput}
          value={item.contentEng}
          onChangeText={(value) => handleLocalChange("contentEng", value)}
          placeholder="Enter English content..."
          placeholderTextColor="#999"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Content (Urdu)</Text>
        <TextInput
          style={[styles.textInput, styles.urduInput]}
          value={item.contentUrdu}
          onChangeText={(value) => handleLocalChange("contentUrdu", value)}
          placeholder="Enter Urdu content..."
          placeholderTextColor="#999"
          multiline
          textAlign="right"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Audio URL</Text>
        <TextInput
          style={styles.textInput}
          value={item.audio}
          onChangeText={(value) => handleLocalChange("audio", value)}
          placeholder="Enter audio URL..."
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

export default function EditDua() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dua } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    topicUrdu: "",
    image: "",
    duas: [],
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!dua) {
      Alert.alert("Error", "No dua data provided. This screen is for editing existing duas only.");
      navigation.goBack();
      return;
    }

    setFormData({
      topic: dua.topic || "",
      topicUrdu: dua.topicUrdu || "",
      image: dua.image || "",
      duas: dua.duas?.map((item, index) => ({
        key: `dua-${item.id || index}`,
        id: String(item.id ?? ""),
        titleEng: item.titleEng || "",
        titleUrdu: item.titleUrdu || "",
        arabic: item.arabic || "",
        contentEng: item.contentEng || "",
        contentUrdu: item.contentUrdu || "",
        audio: item.audio || "",
      })) || [],
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [dua, navigation]);

  const handleSubDuaChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newDuas = [...prev.duas];
      newDuas[index] = { ...newDuas[index], [field]: value };
      return { ...prev, duas: newDuas };
    });
  }, []);

  const handleFieldChange = useCallback(
    debounce((field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }, 100),
    []
  );

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const addSubDua = useCallback(() => {
    setFormData((prev) => {
      const newDuas = [
        ...prev.duas,
        {
          key: `dua-${prev.duas.length}`,
          id: "",
          titleEng: "",
          titleUrdu: "",
          arabic: "",
          contentEng: "",
          contentUrdu: "",
          audio: "",
        },
      ];

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      return { ...prev, duas: newDuas };
    });
  }, []);

  const removeSubDua = useCallback(
    (index) => {
      if (formData.duas.length > 1) {
        setFormData((prev) => ({
          ...prev,
          duas: prev.duas.filter((_, i) => i !== index),
        }));
      } else {
        Alert.alert("Cannot Remove", "At least one dua must remain in the topic.");
      }
    },
    [formData.duas.length]
  );

  const validateForm = () => {
    if (!formData.topic.trim() || !formData.topicUrdu.trim() || !formData.image.trim()) {
      Alert.alert("Validation Error", "Please fill all topic fields (Topic, Topic Urdu, Image URL)");
      return false;
    }

    if (formData.duas.length === 0) {
      Alert.alert("Validation Error", "Please add at least one dua");
      return false;
    }

    for (let i = 0; i < formData.duas.length; i++) {
      const subDua = formData.duas[i];
      const id = String(subDua.id ?? "").trim();
      const audio = String(subDua.audio ?? "").trim();
      if (
        !id ||
        !subDua.titleEng.trim() ||
        !subDua.titleUrdu.trim() ||
        !subDua.arabic.trim() ||
        !subDua.contentEng.trim() ||
        !subDua.contentUrdu.trim() ||
        !audio
      ) {
        Alert.alert("Validation Error", `Please fill all fields for dua ${i + 1}, including audio`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dataToSend = {
        topic: formData.topic,
        topicUrdu: formData.topicUrdu,
        image: formData.image,
        duas: formData.duas.map(({ key, ...rest }) => rest),
      };

      await axios.put(`${BASE_URL}/dua/updateDua/${dua._id}`, dataToSend);
      Alert.alert("Success", "Dua updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating dua:", error);
      Alert.alert("Error", "Failed to update dua. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIconForTopic = (topic) => {
    switch (topic.toLowerCase()) {
      case "eating": return "food";
      case "sleeping": return "bed";
      case "ablution": return "water-outline";
      case "travel": return "airplane";
      case "mosque": return "mosque";
      case "home": return "home";
      case "dressing": return "tshirt-crew";
      case "drinking": return "cup";
      case "prayer": return "hands-pray";
      case "washroom": return "toilet";
      default: return "hands-pray";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.header}>
              <Icon name={getIconForTopic(formData.topic)} size={32} color="#4ECDC4" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Edit Dua</Text>
              <Text style={styles.topicName}>{formData.topic}</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Topic Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Topic (English)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.topic}
                  onChangeText={(value) => handleFieldChange("topic", value)}
                  placeholder="Enter topic in English..."
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Topic (Urdu)</Text>
                <TextInput
                  style={[styles.textInput, styles.urduInput]}
                  value={formData.topicUrdu}
                  onChangeText={(value) => handleFieldChange("topicUrdu", value)}
                  placeholder="Enter topic in Urdu..."
                  placeholderTextColor="#999"
                  textAlign="right"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.image}
                  onChangeText={(value) => handleFieldChange("image", value)}
                  placeholder="Enter image URL..."
                  placeholderTextColor="#999"
                />
              </View>
              {formData.image && (
                <Image
                  source={{ uri: formData.image }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}
            </View>

            <View style={styles.formSection}>
              <View style={styles.subDuaHeader}>
                <Text style={styles.sectionTitle}>Manage Sub-Duas</Text>
                <TouchableOpacity style={styles.addButton} onPress={addSubDua}>
                  <Icon name="plus-circle" size={24} color="#4ECDC4" />
                  <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
              </View>

              {formData.duas.map((item, index) => (
                <SubDuaItem
                  key={item.key}
                  item={item}
                  index={index}
                  onFieldChange={handleSubDuaChange}
                  onRemove={removeSubDua}
                  canRemove={formData.duas.length > 1}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.saveButtonContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={styles.saveButtonContent}>
                    <Icon name="content-save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Update Dua</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f5f5f5",
    opacity: 0.9,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  backButtonContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 30,
  },
  backButton: {
    backgroundColor: "#FF6B6B",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  topicName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
    fontFamily: 'Poppins-Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },
  topicUrdu: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7f8c8d",
    marginBottom: 8,
    textAlign: "right",
    fontFamily: "NotoNastaliqUrdu-Bold",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginTop: 8,
  },
  subDuaCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  subDuaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subDuaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    fontFamily: 'Poppins-Medium',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#e8f8f7",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ECDC4",
    marginLeft: 6,
    fontFamily: 'Poppins-Medium',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 6,
    fontFamily: 'Poppins-Regular',
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#e9ecef",
    minHeight: 40,
    fontFamily: 'Poppins-Regular',
  },
  arabicInput: {
    fontFamily: "AmiriQuranColored",
    fontSize: 16,
    minHeight: 60,
  },
  urduInput: {
    fontFamily: "NotoNastaliqUrdu-Bold",
    fontSize: 14,
    minHeight: 40,
    textAlign: "right",
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  saveButton: {
    backgroundColor: "#4ECDC4",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
    fontFamily: 'Poppins-Bold'
  },
});