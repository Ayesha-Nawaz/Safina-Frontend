import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Use React Navigation
import Loader from "@/components/Loader";
import { BASE_URL } from "@/Ipconfig/ipconfig";

const StoriesComponent: React.FC = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation(); // React Navigation instance

  useEffect(() => {
    fetchStories();
  }, []);

  // Fetch stories from API
  const fetchStories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/story/stories`);
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  // Handle delete
  const deleteStory = async (id: string) => {
    Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/story/stories/${id}`);
            fetchStories();
          } catch (error) {
            console.error("Error deleting story:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Navigate to the EditStoryScreen
  const handleEditStory = (story) => {
    navigation.navigate("EditStory", { storyId: story._id, title: story.title });
  };
  
  
  // Render each story
  const renderStoryItem = ({ item }) => (
    <TouchableOpacity style={styles.storyCard} onPress={() => handleEditStory(item)} activeOpacity={0.7}>
      {/* Story Background Image */}
      <ImageBackground source={{ uri: item.backimage }} style={styles.storyBackground} imageStyle={{ borderRadius: 12 }}>
        <View style={styles.overlay} />
        <View style={styles.storyContent}>
          <Text style={styles.storyTitle}>{item.title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEditStory(item)} style={styles.actionButton}>
              <MaterialCommunityIcons name="pencil" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteStory(item._id)} style={styles.actionButton}>
              <MaterialCommunityIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loader text="Loading stories..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item._id}
        renderItem={renderStoryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  listContent: {
    paddingBottom: 32,
    gap: 16, // Space between items
  },
  storyCard: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    // Improved shadows
    elevation: 4, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  storyBackground: {
    width: "100%",
    height: 160, // Increased height for better aesthetics
    justifyContent: "flex-end", // Align content to bottom
    alignItems: "stretch",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Slightly darker overlay
    borderRadius: 16,
    // Add gradient-like effect
    backgroundGradient: {
      colors: ['transparent', 'rgba(0,0,0,0.7)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
  storyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16, // Add vertical padding
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    flex: 1, // Take available space
    marginRight: 8, // Space between title and actions
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 16, // Increased spacing between buttons
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default StoriesComponent;
