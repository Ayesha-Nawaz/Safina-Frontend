import React, { useState, useEffect, useContext } from "react";
import { View, ActivityIndicator, Animated, Text, StyleSheet, Dimensions } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/components/useColorScheme";
import { fonts } from "@/assets/data/fonts";
import { UserContext, UserProvider } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

// Beautiful Loading Component with Colorful Gradient
function AppLoader({ colorScheme }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [dotAnim1] = useState(new Animated.Value(0));
  const [dotAnim2] = useState(new Animated.Value(0));
  const [dotAnim3] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [shimmerAnim] = useState(new Animated.Value(0));
  const [gradientAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
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

    // Gradient animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Animated dots
    const animateDots = () => {
      const animateDot = (anim, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateDot(dotAnim1, 0);
      animateDot(dotAnim2, 200);
      animateDot(dotAnim3, 400);
    };

    animateDots();
  }, []);

  const isDark = colorScheme === 'dark';
  
  // Light and vibrant gradient colors
  const backgroundGradient = isDark 
    ? ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    : ['#ff9a9e', '#fecfef', '#fecfef', '#a8edea', '#fed6e3', '#ffd89b'];

  const logoGradient = isDark 
    ? ['#667eea', '#764ba2'] 
    : ['#ff6b6b', '#ee5a24'];

  const accentColors = isDark 
    ? ['#667eea', '#764ba2', '#f093fb', '#f5576c']
    : ['#ff9a9e', '#fad0c4', '#a8edea', '#fed6e3'];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const floatTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
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
      
      {/* Animated Gradient Circles */}
      <Animated.View 
        style={[
          styles.gradientCircle,
          {
            transform: [{ rotate: spin }]
          }
        ]}
      >
        <LinearGradient
          colors={[accentColors[0] + '40', accentColors[1] + '20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.gradientCircle2,
          {
            transform: [{ rotate: spin }]
          }
        ]}
      >
        <LinearGradient
          colors={[accentColors[2] + '30', accentColors[3] + '15']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Floating Particles with Gradients */}
      <View style={styles.particlesContainer}>
        {accentColors.map((color, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.particle,
              {
                top: height * (0.1 + (index * 0.2)),
                left: width * (0.1 + (index * 0.15)),
                opacity: shimmerOpacity,
                transform: [
                  { translateY: floatTransform },
                  { rotate: spin },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={[color + '60', color + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ))}
      </View>
      
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
              transform: [{ scale: pulseAnim }]
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
              S
            </Animated.Text>
          </View>
        </Animated.View>

        {/* App Name with Gradient Text Effect */}
        <Animated.View style={styles.appNameContainer}>
          <LinearGradient
            colors={isDark ? ['#ffffff', '#f0f0f0'] : ['#2d3748', '#4a5568']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
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
        </Animated.View>

        {/* Loading Dots with Gradient */}
        <View style={styles.dotsContainer}>
          {[dotAnim1, dotAnim2, dotAnim3].map((anim, index) => (
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
                colors={[accentColors[index] || accentColors[0], accentColors[index + 1] || accentColors[1]]}
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
          Loading your experience...
        </Animated.Text>
      </Animated.View>

      {/* Additional Floating Elements */}
      <Animated.View 
        style={[
          styles.floatingRing,
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
          colors={[accentColors[0] + '30', 'transparent']}
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
  gradientCircle: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: width * 0.9,
    top: -width * 0.4,
    left: -width * 0.4,
    overflow: 'hidden',
  },
  gradientCircle2: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    bottom: -width * 0.3,
    right: -width * 0.3,
    overflow: 'hidden',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameContainer: {
    marginBottom: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
  },
  floatingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 1,
    overflow: 'hidden',
  },
});

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

function AppContent() {
  const { user, loading } = useContext(UserContext);
  const [fontsLoaded] = useFonts(fonts);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return <AppLoader colorScheme={colorScheme} />;
  }

  // Show user or auth layout based on login
  return user ? (
    <UserLayoutNav colorScheme={colorScheme} />
  ) : (
    <AuthLayoutNav colorScheme={colorScheme} />
  );
}

function AuthLayoutNav({ colorScheme }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="(authentication)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

function UserLayoutNav({ colorScheme }) {
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="(user)" options={{ headerShown: false }} />
        <Stack.Screen name="(zadmin)" options={{ headerShown: false }} />
        <Stack.Screen name="(zforgetpassword)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}