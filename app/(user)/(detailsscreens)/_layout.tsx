import React from 'react';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function DetailsLayout() {
  // Function to create header background component with gradient
  const createGradientHeader = (colors) => {
    return () => (
      <LinearGradient
        colors={colors}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    );
  };

  return (
    <Stack>
      <Stack.Screen 
        name="Dua_Details" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(['#A18CD1', '#FBC2EB']),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Kalma_Details" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(['#FF9A9E', '#FAD0C4']),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="StoriesDetails" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(['#E0C3FC', '#8EC5FC']),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Names_Details" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(['#ebb5d5', '#ffd1e3']),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="EventsDetail" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(["#FF61D2", "#FE9090"]),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="AsmaulnabiDetails" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(['#ebb5d5', '#ffd1e3']),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Namaz_Details" 
        options={{ 
          title: '', 
          headerBackground: createGradientHeader(["#4E65FF", "#92EFFD"]),
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }} 
      />
    </Stack>
  );
}