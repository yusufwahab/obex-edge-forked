import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SecurityAlertModal = ({ visible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
    } else {
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
      opacityAnim.setValue(0);
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Alert Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="person-circle" size={40} color="#991b1b" />
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Threat</Text>
          <Text style={styles.description}>Aggression Detected</Text>

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={12} color="#9ca3af" />
              <Text style={styles.metaText}>Vehicle front seat</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="videocam" size={12} color="#9ca3af" />
              <Text style={styles.metaText}>Front-door Camera</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={12} color="#9ca3af" />
              <Text style={styles.metaText}>1h ago</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.threatLabel}>Threat Level</Text>
          <Text style={styles.threatPercentage}>96%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '96%' }]} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  container: {
    width: 300,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#dc2626',
    padding: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  criticalBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  criticalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -2,
    right: 110,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 2,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
  },
  metadata: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  threatPercentage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
});

export default SecurityAlertModal;