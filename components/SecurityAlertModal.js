import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SecurityAlertModal = ({ visible, onClose }) => {
  const [isWeaponDetection, setIsWeaponDetection] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsWeaponDetection(false);
      
      // Change to weapon detection after 10 seconds
      const weaponTimer = setTimeout(() => {
        setIsWeaponDetection(true);
      }, 10000);
      
      // Entry animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Pulse animation (3 times)
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
          ]),
          { iterations: 3 }
        ),
      ]).start();

      // Opacity pulse for glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      return () => clearTimeout(weaponTimer);
    } else {
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
      opacityAnim.setValue(0);
      setIsWeaponDetection(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalText}>CRITICAL</Text>
          </View>
          

        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Alert Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={50} color="#FF0000" />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Aggression Detected</Text>
          <Text style={styles.description}>Aggressive behavior detected in vehicle interior.</Text>

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.metaText}>Vehicle front seat</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="shield" size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.metaText}>Front-door Camera</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.metaText}>1h ago</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Threat Level */}
        <View style={styles.threatHeader}>
          <Text style={styles.threatLabel}>Threat Level</Text>
          <Text style={styles.threatPercentage}>96%</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={['#4CAF50', '#FDD835', '#FF5722']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: '96%' }]}
          />
          <View style={styles.triangleIndicator} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
  },
  container: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 350,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FF0000',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  criticalBadge: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    width: 140,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criticalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 110,
    height: 110,
    backgroundColor: 'rgba(80, 20, 20, 1)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  metadata: {
    gap: 13,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threatLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '400',
  },
  threatPercentage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'visible',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
  },
  triangleIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '92%',
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF0000',
  },
});

export default SecurityAlertModal;