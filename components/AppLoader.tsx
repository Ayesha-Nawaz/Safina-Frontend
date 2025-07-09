import React, { useState, useEffect } from "react";
import { View, Animated, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Beautiful Kid-Friendly Loading Component
export default function AppLoader({ colorScheme = 'light' }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [starAnim1] = useState(new Animated.Value(0));
  const [starAnim2] = useState(new Animated.Value(0));
  const [starAnim3] = useState(new Animated.Value(0));
  const [starAnim4] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [shimmerAnim] = useState(new Animated.Value(0));
  const [cloudAnim] = useState(new Animated.Value(0));
  const [heartAnim] = useState(new Animated.Value(0));
  const [rainbowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initial fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Gentle scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 30,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Gentle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slow rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Cloud animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Heart animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rainbow animation
    Animated.loop(
      Animated.timing(rainbowAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      })
    ).start();

    // Animated stars
    const animateStars = () => {
      const animateStar = (anim, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateStar(starAnim1, 0);
      animateStar(starAnim2, 300);
      animateStar(starAnim3, 600);
      animateStar(starAnim4, 900);
    };

    animateStars();
  }, []);

  const isDark = colorScheme === 'dark';
  
  // Kid-friendly vibrant colors
  const backgroundGradient = isDark 
    ? ['#667eea', '#764ba2', '#f093fb', '#f5576c']
    : ['#ff9a9e', '#fecfef', '#a8edea', '#fed6e3'];

  const logoGradient = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12'];
  
  const starColors = ['#ffd700', '#ff69b4', '#00ced1', '#32cd32'];
  const heartColors = ['#ff1744', '#e91e63', '#9c27b0', '#673ab7'];
  const cloudColors = ['#ffffff', '#e3f2fd', '#f3e5f5', '#e8f5e8'];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  const cloudTransform = cloudAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width, -100],
  });

  const heartScale = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const rainbowOpacity = rainbowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating Clouds */}
      <Animated.View 
        style={[
          styles.cloud,
          {
            transform: [{ translateX: cloudTransform }],
            top: height * 0.15,
          }
        ]}
      >
        <View style={styles.cloudShape}>
          <LinearGradient
            colors={cloudColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.cloud,
          {
            transform: [{ translateX: cloudTransform }],
            top: height * 0.8,
          }
        ]}
      >
        <View style={styles.cloudShape}>
          <LinearGradient
            colors={cloudColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </Animated.View>

      {/* Animated Stars */}
      <View style={styles.starsContainer}>
        {[starAnim1, starAnim2, starAnim3, starAnim4].map((anim, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.star,
              {
                top: height * (0.1 + (index * 0.2)),
                left: width * (0.1 + (index * 0.2)),
                opacity: anim,
                transform: [
                  { scale: anim },
                  { rotate: spin }
                ]
              }
            ]}
          >
            <Text style={[styles.starText, { color: starColors[index] }]}>⭐</Text>
          </Animated.View>
        ))}
      </View>

      {/* Floating Hearts */}
      <Animated.View 
        style={[
          styles.heart,
          {
            top: height * 0.25,
            right: width * 0.1,
            opacity: heartAnim,
            transform: [{ scale: heartScale }]
          }
        ]}
      >
        <Text style={[styles.heartText, { color: heartColors[0] }]}>💖</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.heart,
          {
            top: height * 0.65,
            left: width * 0.1,
            opacity: heartAnim,
            transform: [{ scale: heartScale }]
          }
        ]}
      >
        <Text style={[styles.heartText, { color: heartColors[1] }]}>💜</Text>
      </Animated.View>

      {/* Rainbow Arc */}
      <Animated.View 
        style={[
          styles.rainbow,
          { 
            opacity: rainbowOpacity,
            transform: [{ rotate: spin }]
          }
        ]}
      >
        <LinearGradient
          colors={['#ff0000', '#ff8c00', '#ffd700', '#32cd32', '#00ced1', '#4169e1', '#8a2be2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.loaderContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: floatTransform }
            ]
          }
        ]}
      >
        {/* Main Logo with Gradient */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateY: bounceTransform }
              ]
            }
          ]}
        >
          <View style={styles.logoCircle}>
            <LinearGradient
              colors={logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.Text 
              style={[
                styles.logoText,
                { opacity: shimmerOpacity }
              ]}
            >
              🌟
            </Animated.Text>
          </View>
        </Animated.View>

        {/* App Name with Fun Styling */}
        <Animated.View style={styles.appNameContainer}>
          <Animated.Text 
            style={[
              styles.appName,
              { 
                opacity: fadeAnim,
                transform: [{ scale: shimmerOpacity }]
              }
            ]}
          >
            Safina
          </Animated.Text>
          <Text style={styles.appSubtitle}>✨ Your Adventure Awaits! ✨</Text>
        </Animated.View>

        {/* Fun Loading Dots */}
        <View style={styles.dotsContainer}>
          {[starAnim1, starAnim2, starAnim3].map((anim, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.dot,
                { 
                  opacity: anim,
                  transform: [{ scale: anim }]
                }
              ]}
            >
              <LinearGradient
                colors={[logoGradient[index], logoGradient[index + 1] || logoGradient[0]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          ))}
        </View>

        {/* Loading Text */}
        <Animated.Text 
          style={[
            styles.loadingText,
            { 
              color: isDark ? '#ffffff' : '#2d3748',
              opacity: shimmerOpacity
            }
          ]}
        >
          🎈 Getting ready for fun! 🎈
        </Animated.Text>
      </Animated.View>

      {/* Decorative Elements */}
      <Animated.View 
        style={[
          styles.decorativeRing,
          {
            opacity: shimmerOpacity,
            transform: [
              { rotate: spin },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[logoGradient[0] + '20', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  logoText: {
    fontSize: 50,
    textAlign: 'center',
  },
  appNameContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    zIndex: 1,
  },
  starText: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heart: {
    position: 'absolute',
    zIndex: 1,
  },
  heartText: {
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cloud: {
    position: 'absolute',
    zIndex: 1,
  },
  cloudShape: {
    width: 80,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 0.7,
  },
  rainbow: {
    position: 'absolute',
    width: 150,
    height: 75,
    borderRadius: 75,
    top: height * 0.3,
    overflow: 'hidden',
    zIndex: 1,
  },
  decorativeRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: 'transparent',
    zIndex: 0,
    overflow: 'hidden',
  },
});