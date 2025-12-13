import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  Easing,
} from 'react-native';

// ------------------------------------------------------------------
// 1. CONSTANTS
// ------------------------------------------------------------------
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LOGO_SIZE = Math.min(SCREEN_W * 0.45, 200); // max 200 dp
const DURATION = 2000; // ms
const CENTER_X = SCREEN_W / 2 - LOGO_SIZE / 2;
const CENTER_Y = SCREEN_H / 2 - LOGO_SIZE / 2;

// Offsets for start positions (relative to final center)
const OFFSET_X = LOGO_SIZE * 0.5; // reduced offset for better alignment
const OFFSET_Y = LOGO_SIZE * 0.5;

// ------------------------------------------------------------------
// 2. COMPONENT
// ------------------------------------------------------------------
const LogoLoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 1000,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      {/* Combined logo */}
      <Animated.Image
        source={require('../logo-combined.png')}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />

      {/* Loading text */}
      <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
        Loading...
      </Animated.Text>
    </View>
  );
};

// ------------------------------------------------------------------
// 4. STYLES
// ------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  loadingText: {
    position: 'absolute',
    bottom: SCREEN_H / 2 - 100,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LogoLoadingScreen;