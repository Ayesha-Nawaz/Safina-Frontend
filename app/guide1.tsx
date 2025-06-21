import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function GuideScreen1() {
  return (
    <LinearGradient
      colors={['#E1BEE7', '#F8BBD9', '#E3F2FD']} // Purple to pink to light blue
      style={styles.container}
    >
      <View style={styles.guideContainer}>
        

        <Animatable.View 
          animation="bounceIn" 
          duration={1200} 
          style={styles.titleContainer}
        >
          <LinearGradient
            colors={['#7B1FA2', '#AD1457', '#C2185B']} // Purple to maroon gradient
            style={styles.titleGradient}
          >
            <Text style={styles.guideTitle}>Assalamu Alaikum!</Text>
            <Text style={styles.subtitle}>Young Muslim Explorer</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          duration={1000}
          delay={400}
          style={styles.textContainer}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(240,248,255,0.9)']}
            style={styles.textGradient}
          >
            <Text style={styles.guideText}>
              Begin your beautiful journey of learning about Islam! 
            </Text>
            <Text style={styles.subText}>
              Discover stories, prayers, and amazing Islamic teachings!
            </Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.View
          animation="bounceIn"
          duration={1200}
          delay={800}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => router.push('guide2')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E91E63', '#9C27B0', '#673AB7']} // Pink to purple gradient
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.guideButtonText}>Next </Text>
              <Ionicons name="arrow-forward-circle" size={24} color="white" style={styles.buttonArrow} />
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
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
 
  titleContainer: {
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  titleGradient: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily:'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontFamily:'Poppins-SemiBold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  textGradient: {
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  guideText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4A148C', // Deep purple
   fontFamily:'Poppins-SemiBold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#7B1FA2', // Purple
    fontFamily:'Poppins-SemiBold',
  },
  buttonContainer: {
    borderRadius: 15,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
      },
  guideButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700', // Golden border
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderRadius: 30,
  },
  guideButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});