import React, { useState, useEffect, useRef } from "react";
import Modal from "react-native-modal";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ManageDuaContent() {
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchDuas();
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for add button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const fetchDuas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/dua/getDua`);
      setDuas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching duas:", err);
      setError("Failed to load duas. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this dua?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDelete(id),
        },
      ]
    );
  };

  const performDelete = async (id) => {
    try {
      setIsDeleting(true);
      await axios.delete(`${BASE_URL}/dua/deleteDua/${id}`);
      
      // Remove the item from the local state immediately for better UX
      setDuas(prevDuas => prevDuas.filter(dua => dua._id !== id));
      
      // Show success message
      Alert.alert("Success", "Dua deleted successfully!");
      
    } catch (err) {
      console.error("Error deleting dua:", err);
      Alert.alert("Error", "Failed to delete dua. Please try again.");
      // Refresh the list in case of error to ensure consistency
      fetchDuas();
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToEdit = (dua) => {
    navigation.navigate("EditDua", { dua });
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

  const getColorForTopic = (topic) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    ];
    const index = topic.length % colors.length;
    return colors[index];
  };

  const AnimatedDuaItem = ({ item, index }) => {
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemSlideAnim = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(itemSlideAnim, {
          toValue: 0,
          delay: index * 100,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const topicColor = getColorForTopic(item.topic);

    return (
      <Animated.View
        style={[
          styles.duaItem,
          {
            opacity: itemFadeAnim,
            transform: [
              { translateY: itemSlideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: topicColor + '20' }]}>
          <Icon name={getIconForTopic(item.topic)} size={28} color={topicColor} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.duaText, { color: topicColor }]}>{item.topic}</Text>
          <View style={styles.duasBadge}>
            <Text style={styles.duaSubText}>Duas: {item.duas ? item.duas.length : 0}</Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.urduText}>{item.topicUrdu}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => navigateToEdit(item)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              <Icon name="pencil" size={14} color="white" />
              <Text style={styles.ButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.deleteButton,
                isDeleting && styles.disabledButton
              ]}
              onPress={() => handleDelete(item._id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="delete" size={14} color="white" />
                  <Text style={styles.ButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderDuaItem = ({ item, index }) => (
    <AnimatedDuaItem item={item} index={index} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.addButtonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={() => navigation.navigate("AddDua")}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <View style={styles.addButtonContent}>
                <Icon name="plus-circle" size={28} color="#fff" style={styles.addIcon} />
                <Text style={styles.AddButtonText}>Add New Dua</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading your duas...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FF6B6B" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchDuas}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              <Icon name="refresh" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={duas}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderDuaItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="book-open-variant" size={60} color="#4ECDC4" />
                <Text style={styles.emptyText}>No duas found!</Text>
                <Text style={styles.emptySubText}>Start by adding your first dua</Text>
              </View>
            }
          />
        )}
      </Animated.View>
      
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          disabled={isDeleting}
        >
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5f5f5',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  backButton: { 
    backgroundColor: '#FF6B6B', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 6,
  },
  addButtonContainer: {
    marginBottom: 16,
    marginTop: 12,
  },
  addButton: {
    backgroundColor: "#4ECDC4",
    width: "90%",
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    marginRight: 8,
  },
  list: {
    width: "100%",
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 8,
  },
  duaItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  duaText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    fontFamily:'Poppins-Bold'
  },
  duasBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  duaSubText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    fontFamily: 'Poppins-Regular',
  },
  rightContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  urduText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    writingDirection: "rtl",
    fontFamily: 'NotoNastaliqUrdu-Bold'
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    flexDirection: 'row',
    elevation: 3,
  },
  editButton: {
    backgroundColor: "#45B7D1",
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
  },
  disabledButton: {
    opacity: 0.6,
  },
  ButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: 'Poppins-Medium'
  },
  AddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: 'Poppins-Bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    fontFamily: 'Poppins-Regular'
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 4,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    color: "#2c3e50",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
    fontFamily: 'Poppins-Regular'
  },
  retryButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Poppins-Medium'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 20,
    color: "#2c3e50",
    marginTop: 16,
    fontWeight: "600",
    fontFamily: 'Poppins-Bold'
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 6,
    fontWeight: "400",
    fontFamily: 'Poppins-Regular'
  },
});