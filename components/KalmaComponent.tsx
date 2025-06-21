import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/assets/data/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Loader from './Loader';
import { BASE_URL } from '@/Ipconfig/ipconfig';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 150;

const KalmaComponent = () => {
  const [kalmas, setKalmas] = useState([]);
  const scrollY = new Animated.Value(0);

  const getRandomColor = () => {
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    let color2;
    do {
      color2 = colors[Math.floor(Math.random() * colors.length)];
    } while (color2 === color1);
    return [color1, color2];
  };

  useEffect(() => {
    const fetchKalmas = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/kalma/kalmas`);
        console.log(response.data);
        setKalmas(response.data);
      } catch (error) {
        console.error("Error fetching kalmas: ", error);
      }
    };
    fetchKalmas();
  }, []);

  const renderKalmaItem = ({ item, index }) => {
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
          pathname: "(detailsscreens)/Kalma_Details",
          params: {
            id: item._id,
            
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
            {
              transform: [{ scale }],
              opacity,
            }
          ]}>
            <LinearGradient
              colors={getRandomColor()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.kalmaItem}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="star-four-points" size={24} color="white" />
              </View>
              
              <Text style={styles.kalmaTitle}>{item.title}</Text>
              <Text style={styles.kalmaText}> {item.titleUrdu} </Text>
              <View style={styles.shine} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  };

  

  return (
    <View style={styles.container}>
      {kalmas.length === 0 ? (
        <Loader text="Loading Kalmas... "/>
      ) : (
        <Animated.FlatList
          data={kalmas}
          renderItem={renderKalmaItem}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={styles.kalmaListContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  kalmaListContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  animatedContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
    marginVertical: 10,
  },
  kalmaItem: {
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
});

export default KalmaComponent;