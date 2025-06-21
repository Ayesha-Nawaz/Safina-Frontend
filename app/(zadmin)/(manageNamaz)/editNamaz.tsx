import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Loader from "@/components/Loader";
import { BASE_URL } from "@/Ipconfig/ipconfig";

interface NamazItem {
  _id: string;
  id: number;
  category: string;
  arabic: string;
  english_translation: string;
  urdu_translation: string;
}

const EditNamazScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params as { item: NamazItem };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<NamazItem, "_id" | "id">>({
    category: item.category,
    arabic: item.arabic,
    english_translation: item.english_translation,
    urdu_translation: item.urdu_translation,
  });

  useEffect(() => {
    navigation.setOptions({
      title: `Edit ${item.category}`,
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <MaterialCommunityIcons name="content-save" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, formData]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (
      !formData.category ||
      !formData.arabic ||
      !formData.english_translation ||
      !formData.urdu_translation
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/namaz/namaz/${item._id}`, formData);
      Alert.alert("Success", "Namaz item updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating namaz item:", error);
      Alert.alert("Error", "Failed to update namaz item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Saving Changes..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={(text) => handleChange("category", text)}
          placeholder="Enter category"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Arabic Text</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.arabic}
          onChangeText={(text) => handleChange("arabic", text)}
          placeholder="Enter Arabic text"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>English Translation</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.english_translation}
          onChangeText={(text) => handleChange("english_translation", text)}
          placeholder="Enter English translation"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Urdu Translation</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.urdu_translation}
          onChangeText={(text) => handleChange("urdu_translation", text)}
          placeholder="Enter Urdu translation"
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F4F7FC",
  },
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 200,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditNamazScreen;