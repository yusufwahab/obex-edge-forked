import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

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
  // ---- animation progress (0 → 1) ----
  const progress = useSharedValue(0);

  // Start animation on mount
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
        easing: Easing.out(Easing.quad),
      }),
      -1, // infinite
      false
    );
  }, []);

  // ------------------- BLUE PART (bottom-right) -------------------
  const blueAnim = useAnimatedStyle(() => {
    const t = progress.value;

    // 0-0.45 : slide in
    const slideT = interpolate(t, [0, 0.45], [0, 1], Extrapolate.CLAMP);
    const offsetX = interpolate(slideT, [0, 1], [OFFSET_X, 0]);
    const offsetY = interpolate(slideT, [0, 1], [OFFSET_Y, 0]);

    // 0.45-0.55 : tiny rotation
    const rotT = interpolate(t, [0.45, 0.55], [0, 1], Extrapolate.CLAMP);
    const blueRot = interpolate(rotT, [0, 1], [12, 0]); // deg

    // 0.55-0.70 : pop scale
    const popT = interpolate(t, [0.55, 0.70], [0, 1], Extrapolate.CLAMP);
    const blueScale = interpolate(popT, [0, 1], [1, 1.05]);

    // 0.70-0.85 : fade out
    const fadeT = interpolate(t, [0.70, 0.85], [0, 1], Extrapolate.CLAMP);
    const blueOpacity = interpolate(fadeT, [0, 1], [1, 0]);

    return {
      left: CENTER_X + offsetX,
      top: CENTER_Y + offsetY,
      transform: [
        { rotate: `${blueRot}deg` },
        { scale: blueScale },
      ] as any,
      opacity: blueOpacity,
    } as any;
  });

  // ------------------- WHITE PART (top-left) -------------------
  const whiteAnim = useAnimatedStyle(() => {
    const t = progress.value;

    const slideT = interpolate(t, [0, 0.45], [0, 1], Extrapolate.CLAMP);
    const offsetX = interpolate(slideT, [0, 1], [-OFFSET_X, 0]);
    const offsetY = interpolate(slideT, [0, 1], [-OFFSET_Y, 0]);

    const rotT = interpolate(t, [0.45, 0.55], [0, 1], Extrapolate.CLAMP);
    const whiteRot = interpolate(rotT, [0, 1], [-12, 0]);

    const popT = interpolate(t, [0.55, 0.70], [0, 1], Extrapolate.CLAMP);
    const whiteScale = interpolate(popT, [0, 1], [1, 1.05]);

    const fadeT = interpolate(t, [0.70, 0.85], [0, 1], Extrapolate.CLAMP);
    const whiteOpacity = interpolate(fadeT, [0, 1], [1, 0]);

    return {
      left: CENTER_X + offsetX,
      top: CENTER_Y + offsetY,
      transform: [
        { rotate: `${whiteRot}deg` },
        { scale: whiteScale },
      ] as any,
      opacity: whiteOpacity,
    } as any;
  });

  // ------------------- COMBINED LOGO (cross-fade in) -------------------
  const combinedAnim = useAnimatedStyle(() => {
    const fadeInT = interpolate(
      progress.value,
      [0.70, 0.85],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: fadeInT,
      left: CENTER_X,
      top: CENTER_Y,
    } as any;
  });

  // ------------------- TEXT PULSE -------------------
  const textAnim = useAnimatedStyle(() => {
    const pulse = interpolate(
      progress.value,
      [0.85, 1],
      [0.6, 1],
      Extrapolate.CLAMP
    );
    return { opacity: pulse };
  });

  return (
    <View style={styles.container}>
      {/* Blue half */}
      <Animated.Image
        source={require('../obex blue.png')}
        style={[styles.logo, blueAnim]}
        resizeMode="contain"
      />

      {/* White half */}
      <Animated.Image
        source={require('../obex white.png')}
        style={[styles.logo, whiteAnim]}
        resizeMode="contain"
      />

      {/* Final combined logo */}
      <Animated.Image
        source={require('../Component 16 (1).png')}
        style={[styles.logo, combinedAnim]}
        resizeMode="contain"
      />

      {/* Loading text */}
      <Animated.Text style={[styles.loadingText, textAnim]}>
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