import React from 'react';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/components/useColorScheme';

export default function DuaLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Manage Dua Content', 
            headerShown:true
          }} 
        />
        <Stack.Screen 
          name="EditDua" 
          options={{ 
            title: 'Edit Dua Content', 
            headerShown:false
          }} 
        />
      <Stack.Screen 
          name="AddDua" 
          options={{ 
            title: 'Add Dua Content', 
            headerShown:false
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}