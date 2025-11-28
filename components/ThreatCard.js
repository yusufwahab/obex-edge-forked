import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ThreatCard = ({ visible, onExpand }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous opacity pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.touchable} onPress={onExpand}>
      <View style={styles.header}>
        <View style={styles.criticalBadge}>
          <Text style={styles.criticalText}>CRITICAL</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle" size={24} color="#991b1b" />
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={10} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.title}>Threat</Text>
          <Text style={styles.description}>Aggression Detected</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.threatLabel}>Threat Level</Text>
          <Text style={styles.threatPercentage}>96%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '96%' }]} />
        </View>
      </View>

      <View style={styles.expandIcon}>
        <Ionicons name="chevron-up" size={16} color="#9ca3af" />
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  touchable: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  criticalBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  criticalText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 1,
  },
  content: {
    marginBottom: 8,
  },
  mainInfo: {
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    color: '#9ca3af',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  threatLabel: {
    color: '#9ca3af',
    fontSize: 10,
  },
  threatPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  expandIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default ThreatCard;