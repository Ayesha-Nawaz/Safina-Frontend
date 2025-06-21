import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ImageBackground,
  RefreshControl
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

const NamazComponent: React.FC = () => {
  const [namazItems, setNamazItems] = useState<NamazItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchNamazData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/namaz/namaz`);
      setNamazItems(response.data);
    } catch (error) {
      console.error("Error fetching namaz data:", error);
      Alert.alert("Error", "Failed to load namaz data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNamazData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNamazData();
    setRefreshing(false);
  };

  const handleEdit = (item: NamazItem) => {
    navigation.navigate("editNamaz", { item });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this namaz item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/namaz/${id}`);
              // Remove the deleted item from state
              setNamazItems(namazItems.filter(item => item._id !== id));
              Alert.alert("Success", "Namaz item deleted successfully!");
            } catch (error) {
              console.error("Error deleting namaz item:", error);
              Alert.alert("Error", "Failed to delete namaz item. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleViewDetails = (item: NamazItem) => {
    navigation.navigate("NamazDetails", { item });
  };

  const renderNamazItem = ({ item, index }: { item: NamazItem; index: number }) => (
    <TouchableOpacity 
      style={styles.storyCard}
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.cardContainer}>
        <View style={styles.numberContainer}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.storyTitle}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.english_translation.substring(0, 50)}
            {item.english_translation.length > 50 ? "..." : ""}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <MaterialCommunityIcons name="delete" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Loader text="Loading Namaz..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Namaz Guide</Text>
      <Text style={styles.headerSubtitle}>{namazItems.length} items available</Text>
      
      <FlatList
        data={namazItems}
        keyExtractor={(item) => item._id}
        renderItem={renderNamazItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  storyCard: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  numberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
});

export default NamazComponent;