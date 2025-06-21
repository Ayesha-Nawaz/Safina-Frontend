import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image,
  StatusBar, KeyboardAvoidingView, Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const EditStoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { storyId, title: storyTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [titleUrdu, setTitleUrdu] = useState("");
  const [content, setContent] = useState("");
  const [contentUrdu, setContentUrdu] = useState("");
  const [message, setMessage] = useState("");
  const [messageUrdu, setMessageUrdu] = useState("");
  const [image, setImage] = useState("");
  const [backImage, setBackImage] = useState("");
  const [audio, setAudio] = useState("");

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/story/stories/${storyTitle}`);
      const data = response.data;

      if (!data) {
        Alert.alert("Error", "Story not found.");
        navigation.goBack();
        return;
      }

      setTitle(data.title || "");
      setTitleUrdu(data.titleUrdu || "");
      setContent(data.content || "");
      setContentUrdu(data.contentUrdu || "");
      setMessage(data.message || "");
      setMessageUrdu(data.messageUrdu || "");
      setImage(data.image || "");
      setBackImage(data.backimage || "");
      setAudio(data.audio || "");
    } catch (error) {
      console.error("Error fetching story:", error);
      Alert.alert("Error", "Failed to fetch story data.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async () => {
    if (!title.trim() || !titleUrdu.trim() || !content.trim() || !contentUrdu.trim() || !message.trim() || !messageUrdu.trim()) {
      Alert.alert("Error", "All text fields are required.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${BASE_URL}/story/stories/${storyId}`, {
        title, titleUrdu, content, contentUrdu, message, messageUrdu, image, backimage: backImage, audio
      });

      Alert.alert("Success", "Story updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating story:", error);
      Alert.alert("Error", "Failed to update the story.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, value, setValue, placeholder, multiline = false, keyboardType = "default") => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />
        <ActivityIndicator size="large" color="#4361EE" />
        <Text style={styles.loaderText}>Loading story...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          
          <Text style={styles.title}>Edit Story</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Story Details</Text>
          {renderField("Title (English)", title, setTitle, "Enter title")}
          {renderField("Title (Urdu)", titleUrdu, setTitleUrdu, "Enter title in Urdu")}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Story Content</Text>
          {renderField("Content (English)", content, setContent, "Enter story content...", true)}
          {renderField("Content (Urdu)", contentUrdu, setContentUrdu, "Enter story content in Urdu...", true)}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Story Message</Text>
          {renderField("Message (English)", message, setMessage, "Enter message")}
          {renderField("Message (Urdu)", messageUrdu, setMessageUrdu, "Enter message in Urdu")}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          <Text style={styles.label}>Story Image</Text>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={setImage}
            placeholder="Enter image URL"
            placeholderTextColor="#AAA"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Background Image</Text>
          {backImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: backImage }} style={styles.imagePreview} />
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            value={backImage}
            onChangeText={setBackImage}
            placeholder="Enter background image URL"
            placeholderTextColor="#AAA"
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Audio URL</Text>
          <View style={styles.audioContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={audio}
              onChangeText={setAudio}
              placeholder="Enter audio URL"
              placeholderTextColor="#AAA"
            />
            {audio ? (
              <TouchableOpacity style={styles.audioIcon}>
                <MaterialIcons name="volume-up" size={24} color="#4361EE" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={updateStory}>
            <MaterialIcons name="save" size={20} color="white" />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="close" size={20} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Improved Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FC",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
    color: "#333",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  audioIcon: {
    marginLeft: 12,
    padding: 8,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4361EE",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#4361EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: "#FF5252",
    shadowColor: "#FF5252",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EditStoryScreen;