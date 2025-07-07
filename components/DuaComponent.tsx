import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, RefreshControl, TextInput } from 'react-native';
import { Link } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/assets/data/color';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Loader from './Loader';
import { BASE_URL } from '@/Ipconfig/ipconfig';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 150;

const DuaComponent = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const scrollY = new Animated.Value(0);

  const getRandomColor = () => {
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2;
    do {
      color2 = colors[Math.floor(Math.random() * colors.length)];
    } while (color2 === color1);
    return [color1, color2];
  };

  const fetchDuas = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${BASE_URL}/dua/getDua`);
      setTopics(response.data);
      setFilteredTopics(response.data);
    } catch (error) {
      console.error("Error fetching duas: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDuas();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const filtered = topics.filter(
        item => 
          item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.topicUrdu.includes(searchQuery)
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, topics]);

  const handleClearSearch = () => {
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderTopicItem = ({ item, index }) => {
    const inputRange = [-1, 0, ITEM_HEIGHT * index, ITEM_HEIGHT * (index + 2)];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
    });
    
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.5],
    });

    return (
      <Link
        href={{
          pathname: "(detailsscreens)/Dua_Details",
          params: {
            id: item._id
          },
        }}
        asChild
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Animated.View style={[
            styles.animatedContainer,
            { transform: [{ scale }], opacity }
          ]}>
            <LinearGradient
              colors={getRandomColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.duaItem}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="book-open-variant" size={36} color="black" />
              </View>
              <Text style={styles.kalmaTitle}>{item.topic}</Text>
              <Text style={styles.kalmaText}>{item.topicUrdu}</Text>
              {item.image && (
                <View style={styles.imageIndicator}>
                  <MaterialCommunityIcons name="image" size={36} color="black" />
                </View>
              )}
              <View style={styles.shine} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderNoResults = () => (
    <View style={styles.noResultsContainer}>
      <MaterialCommunityIcons name="magnify-close" size={60} color="#A18CD1" />
      <Text style={styles.noResultsText}>No duas found matching "{searchQuery}"</Text>
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={handleClearSearch}
      >
        <Text style={styles.resetButtonText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for duas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Feather name="x-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {topics.length === 0 && !refreshing ? (
        <Loader text="Loading Duas... "/>
      ) : filteredTopics.length === 0 && isSearching ? (
        renderNoResults()
      ) : (
        <Animated.FlatList
          data={filteredTopics}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.duaListContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchDuas} colors={["#A18CD1"]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'System',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 5,
  },
  duaListContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  animatedContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
    marginVertical: 10,
  },
  duaItem: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  imageIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  kalmaTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#333",
    textShadowColor: 'rgb(242, 178, 178)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  kalmaText: {
    fontSize: 20,
    fontFamily: "NotoNastaliqUrdu-Bold",
    color: "#333",
    textAlign: 'center',
    textShadowColor: 'rgb(242, 178, 178)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    lineHeight:45
  },
  shine: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 50,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '45deg' }],
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    marginTop: 15,
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#555',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#A18CD1',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  }
});

export default DuaComponent;