import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated as RNAnimated,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../../context/UserContext";
import { BASE_URL } from "@/Ipconfig/ipconfig";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { router } from "expo-router";
import Loader from "@/components/Loader";
import * as Haptics from "expo-haptics";
import CustomAlert from "@/components/CustomAlert";

const { width } = Dimensions.get("window");

// Modern gradient color schemes with vibrant, youthful palettes
const COLOR_SCHEMES = [
  ["#A755E4", "#6A33E2"], // Lightened Purple gradient
  ["#FF6A88", "#FF6B4F"], // Lightened Sunset orange
  ["#6A90F0", "#A179F0"], // Lightened Electric blue to purple
  ["#33C6E8", "#339FC7"], // Lightened Aqua blue
  ["#FFA33F", "#FFD860"], // Lightened Amber gold
  ["#8462C3", "#F1C2DC"], // Lightened Mystic purple to pink
  ["#61378F", "#E28A8A"], // Lightened Midnight to coral
  ["#6782E2", "#C18AC6"], // Lightened Royal blue to lilac
  ["#33C6D9", "#33E0C8"], // Lightened Teal gradient
  ["#F135A3", "#FF8080"], // Lightened Hot pink to coral
];

// Categories for filtering with new modern icons
const CATEGORIES = [
  { name: "All", icon: "grid-outline" },
  { name: "Kalma", icon: "document-text-outline" },
  { name: "Dua", icon: "heart-outline" },
  { name: "Story", icon: "book-outline" },
];

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [alertVisible, setAlertVisible] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);

  // Animation refs
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(50)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.95)).current;
  const cardScale = useSharedValue(1);
  const cardRotation = useSharedValue(0);

  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.spring(translateY, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredBookmarks(bookmarks);
    } else {
      setFilteredBookmarks(bookmarks.filter(item => item.contentType === selectedCategory));
    }
  }, [selectedCategory, bookmarks]);

  const navigateToContent = (bookmark) => {
    if (navigating) return;
    setNavigating(true);

    try {
      const { contentId, contentType } = bookmark;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      switch (contentType) {
        case "Kalma":
          router.push({
            pathname: "(detailsscreens)/Kalma_Details",
            params: { id: contentId },
          });
          break;
        case "Story":
          router.push({
            pathname: "(detailsscreens)/StoriesDetails",
            params: { id: contentId },
          });
          break;
        case "Dua":
          router.push({
            pathname: "(detailsscreens)/Dua_Details",
            params: { id: contentId },
          });
          break;
        default:
          navigation.navigate("ContentDetails", {
            contentType,
            contentId,
            source: "bookmarks",
          });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Navigation Error",
        "Could not navigate to the content. The content may no longer be available."
      );
    } finally {
      setTimeout(() => setNavigating(false), 1000);
    }
  };

  const handleCardPress = (bookmark) => {
    cardScale.value = withSequence(withSpring(0.95), withSpring(1));
    cardRotation.value = withSequence(
      withTiming(-2, { duration: 100 }),
      withTiming(2, { duration: 100 }),
      withTiming(0, { duration: 100 }, (finished) => {
        if (finished) runOnJS(navigateToContent)(bookmark);
      })
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }));

  const fetchUserCredentials = async () => {
    try {
      const [storedUserId, storedUserToken] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("userToken"),
      ]);
      if (storedUserId) setUserId(storedUserId);
      if (storedUserToken) setUserToken(storedUserToken);
    } catch (error) {
      console.error("Error fetching user credentials:", error);
    }
  };

  const fetchBookmarks = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/bookmarks/${userId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      Alert.alert("Error", "Failed to fetch bookmarks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserCredentials();
  }, []);

  useEffect(() => {
    if (userId) fetchBookmarks();
  }, [userId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBookmarks();
  }, [userId, userToken]);

  const confirmDelete = (contentId) => {
    setBookmarkToDelete(contentId);
    setAlertVisible(true);
  };

  const handleDelete = async () => {
    if (!userId || !userToken || !bookmarkToDelete) {
      setAlertVisible(false);
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/bookmarks/delete`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { userId, contentId: bookmarkToDelete },
      });

      setBookmarks(prev => prev.filter(b => b.contentId !== bookmarkToDelete));
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      Alert.alert("Error", "Failed to delete bookmark");
    } finally {
      setAlertVisible(false);
      setBookmarkToDelete(null);
    }
  };

  const getContentTypeIcon = (contentType) => {
    const iconMap = {
      Kalma: "document-text-outline",
      Story: "book-outline",
      Dua: "heart-outline",
      default: "bookmark-outline",
    };
    return iconMap[contentType] || iconMap.default;
  };

  const CategorySelector = () => {
    // Map category names to specific colors
    const categoryColors = {
      All: "#FF4081", // Vibrant pink
      Kalma: "#26A69A", // Bright teal
      Dua: "#FFA726", // Warm orange
      Story: "#AB47BC", // Playful purple
    };

    return (
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && {
                  backgroundColor: categoryColors[category.name],
                  borderColor: "rgba(255,255,255,0.6)",
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedCategory(category.name);
              }}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.name ? "white" : "rgba(255,255,255,0.9)"}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBookmarkCard = ({ item, index }) => {
    const contentIcon = getContentTypeIcon(item.contentType);
    const colorScheme = COLOR_SCHEMES[index % COLOR_SCHEMES.length];
    
    const formattedDate = item.timestamp ? 
      new Date(item.timestamp).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : '';

    return (
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <TouchableOpacity
          onPress={() => handleCardPress(item)}
          activeOpacity={0.7}
          style={styles.cardTouchable}
        >
          <LinearGradient
            colors={colorScheme}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Ionicons name={contentIcon} size={28} color="white" />
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.contentType}</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title || 
                  item.contentId
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                }
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                View Your Bookmarked Content
              </Text>

              {formattedDate && (
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => confirmDelete(item.contentId)}
                  style={[styles.actionButton, styles.deleteButton]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={styles.actionText}>Un Bookmark</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleCardPress(item)}
                  style={[styles.actionButton, styles.viewButton]}
                >
                  <Text style={styles.actionText}>Open</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ImageBackground
        source={require("@/assets/images/q2.jpg")}
        style={styles.background}
        blurRadius={15}
      >
        <View style={styles.loaderContainer}>
          <Loader text="Loading Your Collection..." />
        </View>
      </ImageBackground>
    );
  }

  return (
    <RNAnimated.View
      style={[
        styles.mainContainer,
        { opacity: fadeAnim, transform: [{ translateY }, { scale: scaleAnim }] },
      ]}
    >
      <ImageBackground
        source={require("@/assets/images/q2.jpg")}
        style={styles.background}
        blurRadius={8}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.16)', 'rgba(99, 78, 133, 0.6)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>My Bookmarks</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {filteredBookmarks.length} {filteredBookmarks.length === 1 ? "item" : "items"}
                  </Text>
                </View>
              </View>
            </View>

            <CategorySelector />

            <FlatList
              data={filteredBookmarks}
              renderItem={renderBookmarkCard}
              keyExtractor={(item) => item.contentId}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#ffffff"]}
                  tintColor="#ffffff"
                />
              }
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialIcons name="bookmark-border" size={80} color="white" />
                  </View>
                  <Text style={styles.emptyText}>
                    {selectedCategory === "All" 
                      ? "Your collection is empty" 
                      : `No ${selectedCategory} bookmarks`}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {selectedCategory === "All"
                      ? "Save your favorite content to access it easily later"
                      : `Add ${selectedCategory} content to your bookmarks`}
                  </Text>
                  <TouchableOpacity 
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate("index")}
                  >
                    <LinearGradient
                      colors={["#FFCA28", "#FF6D00"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.exploreButtonGradient}
                    >
                      <Text style={styles.exploreButtonText}>Browse Library</Text>
                      <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </LinearGradient>
      </ImageBackground>
      
      <CustomAlert 
        visible={alertVisible}
        title="Remove Bookmark?"
        message="This item will be removed from your bookmarks. This action cannot be undone."
        type="error"
        confirmText="Remove"
        showCancel={true}
        cancelText="Cancel"
        onCancel={() => setAlertVisible(false)}
        onConfirm={handleDelete}
      />
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 13,
    paddingHorizontal: 8,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    color: "white",
    marginBottom: 3,
    textShadowColor: "rgba(78, 40, 104, 0.78)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  countText: {
    color: "white",
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoriesScrollView: {
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)", // Softer pastel-like background
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
   
  },
  selectedCategoryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "white",
    fontFamily: 'Poppins-Bold',
  },
  listContainer: {
    paddingBottom: 80,
  },
  cardContainer: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardTouchable: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  typeText: {
    color: "white",
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 15,
    minHeight: 120,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: "white",
    marginBottom: 3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: "white",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: 'Poppins-Medium',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: "#FF5252", // Bright, kid-friendly red
    borderWidth: 1,
    borderColor: "rgba(255,82,82,0.7)",
  },
  viewButton: {
    backgroundColor: "#00E676", // Vibrant green
    borderWidth: 1,
    borderColor: "rgba(0,230,118,0.7)",
  },
  actionText: {
    color: "white",
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginHorizontal: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 10,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  emptyText: {
    fontSize: 24,
    color: "white",
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 20,
    textAlign: "center",
  },
  exploreButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  exploreButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  exploreButtonText: {
    color: "white",
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});

export default Bookmarks;