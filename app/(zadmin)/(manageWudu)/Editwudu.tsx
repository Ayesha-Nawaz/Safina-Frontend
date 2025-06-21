import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Loader from "@/components/Loader";

interface WuduStep {
  _id: string;
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  stepNumber: number;
}

const EditWuduScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { step } = route.params as { step: WuduStep };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<WuduStep, "_id">>({
    titleEn: step.titleEn,
    titleUr: step.titleUr,
    descriptionEn: step.descriptionEn,
    descriptionUr: step.descriptionUr,
    stepNumber: step.stepNumber,
  });

  useEffect(() => {
    navigation.setOptions({
      title: `Edit Step ${step.stepNumber}`,
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <MaterialCommunityIcons name="content-save" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, formData]);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (
      !formData.titleEn ||
      !formData.titleUr ||
      !formData.descriptionEn ||
      !formData.descriptionUr
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/wudu/wudu/${step._id}`, formData);
      Alert.alert("Success", "Wudu step updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating wudu step:", error);
      let errorMessage = "Failed to update wudu step. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader text="saving...."/>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumberText}>Step {formData.stepNumber}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>English Title</Text>
        <TextInput
          style={styles.input}
          value={formData.titleEn}
          onChangeText={(text) => handleChange("titleEn", text)}
          placeholder="Enter English title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Urdu Title</Text>
        <TextInput
          style={[styles.input, { textAlign: "right" }]}
          value={formData.titleUr}
          onChangeText={(text) => handleChange("titleUr", text)}
          placeholder="اردو عنوان درج کریں"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>English Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.descriptionEn}
          onChangeText={(text) => handleChange("descriptionEn", text)}
          placeholder="Enter English description"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Urdu Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, { textAlign: "right" }]}
          value={formData.descriptionUr}
          onChangeText={(text) => handleChange("descriptionUr", text)}
          placeholder="اردو تفصیل درج کریں"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#455A64",
  },
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  stepNumberContainer: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  stepNumberText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#263238",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CFD8DC",
    elevation: 1,
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 200,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#CFD8DC",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#455A64",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditWuduScreen;