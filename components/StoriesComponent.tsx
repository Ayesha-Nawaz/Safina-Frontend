import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Link } from "expo-router";
import axios from "axios";
import { colors } from "@/assets/data/color"; // Colors array
import { Story } from "@/types/types";
import Loader from "./Loader";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import { Ionicons } from "@expo/vector-icons";

const StoriesComponent: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("prophet"); // Default active tab
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Function to get a random color
  const getRandomColor = (colorArray: string[]): string => {
    const randomIndex = Math.floor(Math.random() * colorArray.length);
    return colorArray[randomIndex];
  };

  // Fetch stories data from the backend
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

  useEffect(() => {
    fetchStories();
  }, []);

  // Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchStories();
  };

  // Switch tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Filter stories based on active tab and search query
  const filteredStories = stories.filter((story) => {
    // First filter by tab
    const matchesTab = activeTab === "prophet"
      ? story.type === "prophet"
      : story.type !== "prophet";
      
    // Then filter by search query if there is one
    const matchesSearch = searchQuery.trim() === "" || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  // Function to render a story item
  const renderStoryItem = ({ item }: { item: Story }) => {
    const randomColor = getRandomColor(colors); // Random pastel color

    return (
      <Link
        href={{
          pathname: "(detailsscreens)/StoriesDetails",
          params: {
            id: item._id,
          },
        }}
        style={[
          styles.storyCard,
          {
            backgroundColor: randomColor,
            borderLeftColor: randomColor,
            borderLeftWidth: 10,
          },
        ]}
      >
        <Text style={styles.storyTitle}>{item.title}</Text>
      </Link>
    );
  };

  // Empty state component when no stories match the search
  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No stories found</Text>
      <Text style={styles.emptyText}>
        We couldn't find any stories matching "{searchQuery}"
      </Text>
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => setSearchQuery("")}
      >
        <Text style={styles.resetButtonText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loader text="Loading stories..." />;
  }

  return (
    <View style={styles.mainContainer}>
      {/* Tab headers */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "prophet" ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabChange("prophet")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "prophet" ? styles.activeTabText : null,
            ]}
          >
            Prophet Stories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "other" ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabChange("other")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "other" ? styles.activeTabText : null,
            ]}
          >
            Other Stories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search bar - moved below header */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stories list container */}
      <View style={styles.container}>
        <FlatList
          data={filteredStories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            filteredStories.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={searchQuery.trim() !== "" ? EmptyStateComponent : null}
        />
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%", // Full width of screen
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderWidth: 2,
    borderColor: "#fff", // Light gray color
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.3)",
  },
  activeTab: {
    backgroundColor: "#8EC5FC", // Blue color when active
  },
  inactiveTab: {
    backgroundColor: "#E0C3FC", // Purple color when inactive
  },
  tabText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textTransform: "capitalize",
  },
  activeTabText: {
    fontFamily: "Poppins-Bold", // Bold font for active tab
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
    paddingVertical: 6,
  },
  listContainer: {
    padding: 10,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  storyCard: {
    padding: 17,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  storyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    textShadowColor: "#ddedfb",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#555",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#8EC5FC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
});

export default StoriesComponent;