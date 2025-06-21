import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '@/context/UserContext';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function GuideScreen3() {
  const { showAlert } = useContext(UserContext);

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenGuide', 'true');
      router.push('(authentication)');
    } catch (error) {
      console.error('Error saving guide completion:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save guide completion',
        type: 'error',
      });
    }
  };

  return (
    <LinearGradient
      colors={['#F3E5F5', '#E1BEE7', '#BBDEFB']} // Pastel purple to pink to blue
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <Animatable.View 
          animation="rotate" 
          iterationCount="infinite" 
          duration={7000}
          easing="ease-in-out"
          style={[styles.floatingShape, styles.shape1]}
        />
        <Animatable.View 
          animation="rotate" 
          iterationCount="infinite" 
          duration={9000}
          easing="ease-in-out"
          style={[styles.floatingShape, styles.shape2]}
        />
        <Animatable.View 
          animation="rotate" 
          iterationCount="infinite" 
          duration={11000}
          easing="ease-in-out"
          style={[styles.floatingShape, styles.shape3]}
        />
      </View>

      <View style={styles.guideContainer}>
        {/* Main Title Section */}
        <Animatable.View 
          animation="zoomIn" 
          duration={1400}
          easing="ease-out-cubic" 
          style={styles.titleContainer}
        >
          <LinearGradient
            colors={['#D81B60', '#7B1FA2', '#512DA8']} // Pink to purple to deep purple
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            <Text style={styles.arabicText}>بِسْمِ اللَّهِ</Text>
            <Text style={styles.guideTitle}>Ready to Begin!</Text>
            <Text style={styles.subtitle}>Your Islamic Journey Starts Now</Text>
          </LinearGradient>
        </Animatable.View>

        {/* Motivational Message */}
        <Animatable.View
          animation="fadeInUpBig"
          duration={1200}
          delay={400}
          easing="ease-out"
          style={styles.messageContainer}
        >
          <LinearGradient
            colors={['rgba(255,245,250,0.95)', 'rgba(225,245,255,0.9)']} // Pastel pink to light blue
            style={styles.messageGradient}
          >
            <Text style={styles.guideText}>
              Alhamdulillah! Embark on a vibrant journey of Islamic discovery! 🌈
            </Text>
            <Text style={styles.subMessage}>
              May Allah guide and bless your path! 🤲
            </Text>
          </LinearGradient>
        </Animatable.View>

        {/* Success Elements */}
        <Animatable.View
          animation="zoomIn"
          duration={1000}
          delay={800}
          easing="ease-out"
          style={styles.successElements}
        >
          <LinearGradient
            colors={['#FCE4EC', '#E1BEE7', '#BBDEFB']} // Pastel pink to purple to blue
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successElementsGradient}
          >
            {[
              { emoji: '🏆', label: 'Ready!' },
              { emoji: '📚', label: 'Learn!' },
              { emoji: '🌟', label: 'Shine!' },
            ].map((badge, index) => (
              <Animatable.View
                key={index}
                animation="bounceIn"
                duration={800}
                delay={1000 + index * 200}
                style={styles.successBadge}
              >
                <LinearGradient
                  colors={['#EC407A', '#AB47BC']} // Pink to purple
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeText}>{badge.emoji}</Text>
                </LinearGradient>
                <Text style={styles.badgeLabel}>{badge.label}</Text>
              </Animatable.View>
            ))}
          </LinearGradient>
        </Animatable.View>

        {/* Action Button */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2200}
          delay={1200}
          style={styles.buttonContainer}
        >
          <TouchableOpacity 
            style={styles.guideButton} 
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#EC407A', '#AB47BC', '#42A5F5']} // Pink to purple to blue
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.guideButtonText}>Begin Journey!</Text>
                <Ionicons name="arrow-forward-circle" size={Math.min(width * 0.06, 24)} color="white" style={styles.buttonArrow} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:20,
    paddingTop:70,
  },
  titleContainer: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
    marginBottom: height * 0.03,
  },
  titleGradient: {
    padding:10,
    borderRadius: 30,
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: height * 0.015,
    fontFamily: 'Amiri-Regular', // Ensure font availability or use fallback
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  guideTitle: {
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-ExtraBold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: height * 0.008,
  },
  subtitle: {
    fontSize: Math.min(width * 0.042, 17),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  messageContainer: {
    width: width * 0.88,
    borderRadius: 25,
    marginBottom: height * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  messageGradient: {
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    borderRadius: 25,
    borderLeftWidth: 5,
    borderLeftColor: '#D81B60',
  },
  guideText: {
    fontSize: Math.min(width * 0.042, 17),
    textAlign: 'center',
    color: '#4A148C', // Deep purple
    lineHeight: height * 0.03,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: height * 0.012,
  },
  subMessage: {
    fontSize: Math.min(width * 0.037, 15),
    textAlign: 'center',
    color: '#6A1B9A', // Purple
    lineHeight: height * 0.025,
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  successElements: {
    width: width * 0.88,
    marginBottom: height * 0.05,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  successElementsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.03,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD54F', // Pastel gold
  },
  successBadge: {
    alignItems: 'center',
    borderRadius: 25,
    padding: width * 0.025,
    width: width * 0.22,
  },
  badgeGradient: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.01,
    borderWidth: 2,
    borderColor: '#FFD54F', // Pastel gold
  },
  badgeText: {
    fontSize: Math.min(width * 0.07, 28),
    color: '#FFF',
  },
  badgeLabel: {
    fontSize: Math.min(width * 0.032, 13),
    fontFamily: 'Poppins-Bold',
    color: '#4A148C', // Deep purple
    textAlign: 'center',
  },
  buttonContainer: {
    borderRadius: 35,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
    width: width * 0.75,
    alignSelf: 'center',
  },
  guideButton: {
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFD54F', // Pastel gold
  },
  buttonGradient: {
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.08,
    borderRadius: 35,
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
  },
  guideButtonText: {
    color: '#FFF',
    fontSize: Math.min(width * 0.058, 23),
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  buttonArrow: {
    marginTop: height * 0.01,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Math.min(width * 0.032, 13),
    fontFamily: 'Poppins-Medium',
    fontStyle: 'italic',
    marginTop: height * 0.008,
  },
});