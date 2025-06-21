import React from 'react';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Custom Gradient Components for Each Screen
const EventsHeader = () => (
  <LinearGradient
    colors={["#FF61D2", "#FE9090"]} // Gradient for Events screen
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  />
);

const ScheduleHeader = () => (
  <LinearGradient
    colors={["#4E65FF", "#92EFFD"]} // Gradient for Schedule screen
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  />
);

const PrayerTimeHeader = () => (
  <LinearGradient
    colors={["#8FD3F4", "#84FAB0"]} // Gradient for PrayerTime screen
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  />
);

export default function StoriesLayout() {
  return (
    <Stack>
      {/* Events Screen */}
      <Stack.Screen
        name="Events"
        options={{
          title: '',
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerBackground: () => <EventsHeader />, // Custom gradient for Events
        }}
      />

      {/* Schedule Screen */}
      <Stack.Screen
        name="Schedule"
        options={{
          title: '',
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerBackground: () => <ScheduleHeader />, // Custom gradient for Schedule
        }}
      />

      {/* PrayerTime Screen */}
      <Stack.Screen
        name="PrayerTime"
        options={{
          title: '',
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerBackground: () => <PrayerTimeHeader />, // Custom gradient for PrayerTime
        }}
      />
    </Stack>
  );
}