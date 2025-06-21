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
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

// Move SubDuaItem outside of AddDua component
const SubDuaItem = ({ item, index, onFieldChange, onRemove, canRemove }) => {
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
          onChangeText={(value) => onFieldChange(index, "id", value)}
          placeholder="Enter ID..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title (English)</Text>
        <TextInput
          style={styles.textInput}
          value={item.titleEng}
          onChangeText={(value) => onFieldChange(index, "titleEng", value)}
          placeholder="Enter English title..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Title (Urdu)</Text>
        <TextInput
          style={[styles.textInput, styles.urduInput]}
          value={item.titleUrdu}
          onChangeText={(value) => onFieldChange(index, "titleUrdu", value)}
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
          onChangeText={(value) => onFieldChange(index, "arabic", value)}
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
          onChangeText={(value) => onFieldChange(index, "contentEng", value)}
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
          onChangeText={(value) => onFieldChange(index, "contentUrdu", value)}
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
          onChangeText={(value) => onFieldChange(index, "audio", value)}
          placeholder="Enter audio URL..."
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

export default function AddDua() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    topicUrdu: "",
    image: "",
    duas: [{
      key: `new-0-${uuidv4()}`,
      id: "",
      titleEng: "",
      titleUrdu: "",
      arabic: "",
      contentEng: "",
      contentUrdu: "",
      audio: ""
    }],
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
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
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubDuaChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newDuas = [...prev.duas];
      newDuas[index] = { ...newDuas[index], [field]: value };
      return { ...prev, duas: newDuas };
    });
  }, []);

  const addSubDua = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      duas: [
        ...prev.duas,
        {
          key: `dua-${prev.duas.length}-${uuidv4()}`,
          id: "",
          titleEng: "",
          titleUrdu: "",
          arabic: "",
          contentEng: "",
          contentUrdu: "",
          audio: "",
        },
      ],
    }));
  }, []);

  const removeSubDua = useCallback(
    (index) => {
      if (formData.duas.length > 1) {
        setFormData((prev) => ({
          ...prev,
          duas: prev.duas.filter((_, i) => i !== index),
        }));
      }
    },
    [formData.duas.length]
  );

  const validateForm = () => {
    if (!formData.topic.trim()) {
      Alert.alert("Validation Error", "Please enter a topic");
      return false;
    }
    if (!formData.topicUrdu.trim()) {
      Alert.alert("Validation Error", "Please enter Urdu topic");
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

      await axios.post(`${BASE_URL}/dua/addDua`, dataToSend);
      Alert.alert("Success", "Dua created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating dua:", error);
      Alert.alert("Error", "Failed to create dua. Please try again.");
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
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Icon name={getIconForTopic(formData.topic)} size={32} color="#4ECDC4" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Create New Dua</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Topic Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Topic (English)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.topic}
                  onChangeText={(value) => handleInputChange("topic", value)}
                  placeholder="Enter topic..."
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Topic (Urdu)</Text>
                <TextInput
                  style={[styles.textInput, styles.urduInput]}
                  value={formData.topicUrdu}
                  onChangeText={(value) => handleInputChange("topicUrdu", value)}
                  placeholder="Enter Urdu topic..."
                  placeholderTextColor="#999"
                  textAlign="right"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.image}
                  onChangeText={(value) => handleInputChange("image", value)}
                  placeholder="Enter image URL..."
                  placeholderTextColor="#999"
                />
                {formData.image && (
                  <Image
                    source={{ uri: formData.image }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                    onError={() => Alert.alert("Error", "Invalid image URL")}
                  />
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.subDuaHeader}>
                <Text style={styles.sectionTitle}>Duas</Text>
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
                    <Text style={styles.saveButtonText}>Create Dua</Text>
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
    fontFamily: 'Poppins-Bold'
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    fontFamily: 'Poppins-Medium'
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 6,
    fontFamily: 'Poppins-Regular'
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
    fontFamily: 'Poppins-Regular'
  },
  arabicInput: {
    fontFamily: "Amiri-Regular",
    fontSize: 16,
    minHeight: 60,
  },
  urduInput: {
    fontFamily: "NotoNastaliqUrdu-Regular",
    fontSize: 14,
    minHeight: 40,
    textAlign: "right",
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
    fontFamily: 'Poppins-Medium'
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
    fontFamily: 'Poppins-Medium'
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