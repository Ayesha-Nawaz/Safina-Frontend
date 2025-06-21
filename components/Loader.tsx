import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const Loader = ({
  text = 'Loading...',
  size = 80,
  primaryColor = '#7C3AED', // Vibrant purple
  accentColors = ['#F472B6', '#60A5FA', '#34D399'], // Pink, Blue, Green
  
}) => {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const dotAnims = accentColors.map(() => ({
    scale: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));
  const textSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main ring rotation
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Gentle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Dot animations
    dotAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 600,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 600,
              delay: index * 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(anim.scale, {
              toValue: 0,
              duration: 600,
              delay: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // Text slide animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(textSlideAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container]}>
      <View style={[styles.loaderContainer, { width: size, height: size }]}>
        {/* Main rotating ring */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderColor: primaryColor,
              transform: [
                { rotate: spin },
                { scale: scaleAnim },
              ],
            },
          ]}
        />
        
        {/* Accent dots */}
        {accentColors.map((color, index) => {
          const angle = (360 / accentColors.length) * index;
          const radius = size * 0.4;
          
          return (
            <Animated.View
              key={color}
              style={[
                styles.dot,
                {
                  backgroundColor: color,
                  width: size * 0.15,
                  height: size * 0.15,
                  transform: [
                    { translateX: radius * Math.cos((angle * Math.PI) / 180) },
                    { translateY: radius * Math.sin((angle * Math.PI) / 180) },
                    { scale: dotAnims[index].scale },
                  ],
                  opacity: dotAnims[index].opacity,
                },
              ]}
            />
          );
        })}
      </View>

      <Animated.Text
        style={[
          styles.text,
          {
            color: primaryColor,
            transform: [{
              translateY: textSlideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            }],
            opacity: textSlideAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.7, 1],
            }),
          },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 1000,
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  dot: {
    position: 'absolute',
    borderRadius: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  text: {
    marginTop: 40,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Loader;