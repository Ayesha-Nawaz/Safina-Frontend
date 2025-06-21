import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { Dua, DuaCategoryProps } from "@/types/types";

// Map of categories to their corresponding image paths using require (using lowercased keys for case insensitivity)
const categoryImages = {
  "qayyam": require('@/assets/images/qayyamcartoon.jpg'),
  "rukkuh": require('@/assets/images/rukuhCartoon.jpg'), 
  "sajdah": require('@/assets/images/sajdahCartoon.jpg'),
  "tashhad": require('@/assets/images/tashhad.png'),
  "salam": require('@/assets/images/salamImage.png'),
};

const DuaCategory = ({ category, duas }: DuaCategoryProps) => {
  // Normalize category key for case-insensitivity
  const categoryKey = category.trim().toLowerCase();
  const categoryImage = categoryImages[categoryKey] || require('@/assets/images/qayyamcartoon.jpg'); // Fallback image

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.categoryCard}>
        <Image source={categoryImage} style={styles.image} />
        
        <Text style={styles.categoryHeading}>{category}</Text>
        
        <FlatList
          data={duas}
          horizontal={false}
          keyExtractor={(item) => item.id?.toString() || `${item.arabic}_${Math.random()}`}
          renderItem={({ item }) => (
            <View style={styles.duaCard}>
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Text style={styles.translation}>{item.translation}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 25,
  },
  categoryHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#206a9c',
    textAlign: 'center',
    marginVertical: 10,
  },
  duaCard: {
    padding: 15,
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  arabic: {
    fontSize: 22,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 8,
  },
  translation: {
    fontSize: 18,
    color: '#27AE60',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 15,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 15,
    margin: 15,
  },
  noImageText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
  },
});

export default DuaCategory;