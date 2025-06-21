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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Loader from "@/components/Loader";

const WuduStepsScreen = () => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Fetch wudu steps from API
  const fetchWuduSteps = async () => {
    try {
      console.log(`Fetching wudu steps from: ${BASE_URL}/wudu/wudu`);
      const response = await fetch(`${BASE_URL}/wudu/wudu`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Wudu steps: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched steps:", data.length);
      setSteps(data);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching Wudu steps:", error);
      Alert.alert("Error", "Failed to load Wudu steps. Please try again.");
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  // Add initial wudu steps if none exist
  const addInitialWuduSteps = async () => {
    try {
      setLoading(true);
      console.log(`Adding initial wudu steps at: ${BASE_URL}/wudu/addwudu`);
      await axios.post(`${BASE_URL}/wudu/addwudu`);
      fetchWuduSteps(); // Refresh the list after adding
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Steps already exist, just fetch them
        console.log("Steps already exist, fetching current steps...");
        fetchWuduSteps();
      } else {
        console.error("Error adding wudu steps:", error);
        Alert.alert("Error", "Failed to initialize wudu steps. Please try again later.");
        setLoading(false);
      }
    }
  };

  // Delete a wudu step
  const deleteStep = (id) => {
    if (!id) {
      console.error("Cannot delete step: ID is undefined");
      Alert.alert("Error", "Cannot delete this step. ID is missing.");
      return;
    }

    Alert.alert(
      "Delete Step",
      "Are you sure you want to delete this step?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`Deleting step at: ${BASE_URL}/wudu/wudu/${id}`);
              await axios.delete(`${BASE_URL}/wudu/wudu/${id}`);
              // Refresh steps list after deletion
              fetchWuduSteps();
              Alert.alert("Success", "Step deleted successfully");
            } catch (error) {
              console.error("Error deleting step:", error);
              Alert.alert("Error", `Failed to delete step: ${error.response?.data?.error || error.message}`);
            }
          },
        },
      ]
    );
  };

  // Navigate to edit screen
  const navigateToEdit = (step) => {
    if (!step || !step._id) {
      console.error("Cannot edit step: step or step ID is undefined", step);
      Alert.alert("Error", "Cannot edit this step. Step data is incomplete.");
      return;
    }
    
    console.log("Navigating to edit screen with step:", step._id);
    navigation.navigate("Editwudu", { step });
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchWuduSteps();
  };

  // Effect hook to load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, fetching wudu steps");
      fetchWuduSteps();
    }, [])
  );

  // Render an individual step
  const renderStep = ({ item, index }) => {
    // Validate item has necessary properties
    if (!item || !item._id) {
      console.warn("Received invalid step item:", item);
      return null;
    }
    
    return (
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.stepTitle}>{item.titleEn || "Untitled"}</Text>
            <Text style={styles.stepTitleUrdu}>{item.titleUr || ""}</Text>
          </View>
        </View>
        
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>{item.descriptionEn || "No description available"}</Text>
          <Text style={styles.stepDescriptionUrdu}>{item.descriptionUr || ""}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => navigateToEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => deleteStep(item._id)}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
       <Loader text="Loading wudu"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wudu Steps</Text>
      </View>

      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item._id ? item._id.toString() : Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="water-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>No wudu steps found</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={addInitialWuduSteps}>
              <Text style={styles.emptyButtonText}>Initialize Steps</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#263238",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumberContainer: {
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  titleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#263238",
  },
  stepTitleUrdu: {
    fontSize: 16,
    color: "#455A64",
    textAlign: "right",
  },
  stepContent: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    color: "#455A64",
    marginBottom: 8,
  },
  stepDescriptionUrdu: {
    fontSize: 14,
    color: "#455A64",
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", backgroundColor: "#F5F7FA",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#78909C",
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default WuduStepsScreen;