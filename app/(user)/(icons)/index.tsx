import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Note: In a real implementation, you would need to install:
// - expo-linear-gradient
// - and ensure you have the Poppins font family loaded

const SafinaPoster = () => {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#7b2cbf', '#5a189a', '#3c096c']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: 'https://placeholder.com/logo' }} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>SAFINA</Text>
          <Text style={styles.tagline}>A Vessel of Knowledge</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#f5edff', '#eae2fd', '#d9d4f4']}
        style={styles.bodyGradient}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INTRODUCTION</Text>
          <Text style={styles.sectionText}>
            Safina is an engaging Islamic learning application designed to connect 
            children with their faith through interactive and enjoyable educational 
            experiences. The app creates a supportive environment where young Muslims 
            can explore Islamic teachings, track their progress, and participate in 
            community events - all through a colorful, child-friendly interface.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>KEY FEATURES</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🌙</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Fun Learning Content</Text>
              <Text style={styles.featureDescription}>
                Interactive Quran stories, animated Islamic history, 
                gamified prayer learning, and Islamic art activities
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📚</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDescription}>
                Personalized dashboards, achievement badges,
                visual milestones, and parent monitoring
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🕌</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Upcoming Events</Text>
              <Text style={styles.featureDescription}>
                Community gatherings, Islamic holiday celebrations,
                Quran competitions, and online workshops
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>⏰</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Daily Schedule</Text>
              <Text style={styles.featureDescription}>
                Prayer time reminders, daily Quran verses,
                weekly lesson planning, and learning routines
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>WHY SAFINA?</Text>
          
          <View style={styles.whyRow}>
            <View style={styles.whyItem}>
              <Text style={styles.whyItemTitle}>Engaging</Text>
              <Text style={styles.whyItemText}>
                Colorful graphics and interactive elements for young learners
              </Text>
            </View>
            
            <View style={styles.whyItem}>
              <Text style={styles.whyItemTitle}>Educational</Text>
              <Text style={styles.whyItemText}>
                Age-appropriate content building strong Islamic foundations
              </Text>
            </View>
          </View>
          
          <View style={styles.whyRow}>
            <View style={styles.whyItem}>
              <Text style={styles.whyItemTitle}>Community-Focused</Text>
              <Text style={styles.whyItemText}>
                Connecting children with peers while strengthening Islamic identity
              </Text>
            </View>
            
            <View style={styles.whyItem}>
              <Text style={styles.whyItemTitle}>Supportive</Text>
              <Text style={styles.whyItemText}>
                Guiding children through their spiritual journey with positive reinforcement
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.downloadSection}>
          <Text style={styles.downloadText}>Download Now and Join the Journey!</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Safina - Making Islamic Learning Fun</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5edff',
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  tagline: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontStyle: 'italic',
    color: '#ffffff',
    marginBottom: 10,
  },
  bodyGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5a189a',
    marginBottom: 10,
  },
  sectionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5a189a',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0c6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: '#5a189a',
    marginBottom: 5,
  },
  featureDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
  },
  whySection: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  whyTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5a189a',
    marginBottom: 15,
    textAlign: 'center',
  },
  whyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  whyItem: {
    width: '48%',
    backgroundColor: '#f0e6ff',
    borderRadius: 10,
    padding: 15,
  },
  whyItemTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#5a189a',
    marginBottom: 5,
  },
  whyItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#333333',
  },
  downloadSection: {
    backgroundColor: '#7b2cbf',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  downloadText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#5a189a',
  },
});

export default SafinaPoster;