import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function GuideScreen2() {
  const features = [
    { id: 1, text: 'Play Islamic Quizzes!', emoji: '🎮', color: '#EC407A', bgColor: '#FCE4EC' }, // Pink
    { id: 2, text: 'Read Prophet Stories!', emoji: '📚', color: '#AB47BC', bgColor: '#F3E5F5' }, // Purple
    { id: 3, text: 'Learn Quran & Hadith!', emoji: '🕌', color: '#42A5F5', bgColor: '#E3F2FD' }, // Blue
    { id: 4, text: 'Set Prayer Schedule!', emoji: '🕐', color: '#C2185B', bgColor: '#FFEBEE' }, // Maroon
    { id: 5, text: 'Islamic Events Calendar!', emoji: '🌙', color: '#FFD54F', bgColor: '#FFF8E1' }, // Pastel gold
    { id: 6, text: 'Track Your Progress!', emoji: '📈', color: '#F06292', bgColor: '#FCE4EC' }, // Pastel pink
  ];

  return (
    <LinearGradient
      colors={['#F3E5F5', '#E1BEE7', '#BBDEFB']} // Pastel purple to pink to blue
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        style={styles.guideContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <Animatable.View animation="zoomIn" duration={1400} easing="ease-out-cubic" style={styles.titleContainer}>
          <LinearGradient
            colors={['#D81B60', '#7B1FA2', '#512DA8']} // Pink to purple to deep purple
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            <Text style={styles.guideTitle}>Amazing Features!</Text>
            <Text style={styles.subtitle}>Explore & Learn Islam</Text>
          </LinearGradient>
        </Animatable.View>

        <Animatable.Text
          animation="fadeInUpBig"
          duration={1200}
          delay={400}
          easing="ease-out"
          style={styles.guideText}
        >
          Dive into exciting Islamic learning adventures awaiting you!
        </Animatable.Text>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <Animatable.View
              key={feature.id}
              animation="zoomIn"
              duration={800}
              delay={600 + index * 200}
              easing="ease-out"
              style={[styles.featureContainer, { backgroundColor: feature.bgColor }]}
            >
              <LinearGradient
                colors={[feature.color, `${feature.color}80`]} // Solid to translucent
                style={[styles.featureIcon, { borderColor: feature.color }]}
              >
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              </LinearGradient>
              <Text style={[styles.featureText, { color: feature.color }]}>
                {feature.text}
              </Text>
              <View style={[styles.featureBorder, { backgroundColor: `${feature.color}60` }]} />
            </Animatable.View>
          ))}
        </View>

        {/* Call to Action */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2200}
          delay={1200}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => router.push('guide3')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#EC407A', '#AB47BC', '#42A5F5']} // Pink to purple to blue
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.guideButtonText}>Let's Begin!</Text>
                <Ionicons name="arrow-forward-circle" size={24} color="white" style={styles.buttonArrow} />
                
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guideContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 25,
    paddingTop: 50,
    paddingBottom: 50,
  },
  titleContainer: {
    borderRadius: 30,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
  },
  titleGradient: {
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-ExtraBold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  guideText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#4A148C',
    lineHeight: 24,
    fontFamily: 'Poppins-SemiBold',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#D81B60',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureContainer: {
    width: '48%',
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  featureEmoji: {
    fontSize: 28,
    color: '#FFF',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  featureBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    opacity: 0.5,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 35,
    shadowColor: '#D81B60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 15,
  },
  guideButton: {
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFD54F', // Pastel gold
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 35,
    alignItems: 'center',
  },
  buttonContent: {
    alignItems: 'center',
  },
  guideButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  buttonArrow: {
    marginTop: 8,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    fontStyle: 'italic',
    marginTop: 6,
  },
});