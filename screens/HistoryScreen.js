import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const HistoryScreen = ({ navigation, route }) => {
  const { alertType, weaponDetection } = route.params || {};

  const getAlertData = () => {
    if (weaponDetection) {
      return {
        title: 'Weapon Detection Alert',
        video: require('../Video5.mp4'),
        details: {
          location: 'Security Zone',
          camera: 'Security Alert Camera',
          timestamp: '2024-01-15 18:22:45',
          duration: '00:03:12',
          severity: 'Critical',
          description: 'Weapon detected in monitored area. Advanced AI analysis identified potential threat object requiring immediate attention.',
          actions: 'Security team dispatched, area secured, authorities notified, incident escalated to emergency response.'
        }
      };
    } else if (alertType === 'unauthorized') {
      return {
        title: 'Unauthorized Passenger Detected',
        video: require('../Video 1.mp4'),
        details: {
          location: 'Vehicle Front Seat',
          camera: 'Front-door Camera',
          timestamp: '2024-01-15 14:32:18',
          duration: '00:02:45',
          severity: 'High',
          description: 'An unauthorized individual was detected attempting to access the vehicle. The person was not recognized by the facial recognition system and triggered a security alert.',
          actions: 'Security team notified, vehicle locked automatically, incident logged for review.'
        }
      };
    } else {
      return {
        title: 'Aggressive Passengers Detected',
        video: require('../video3.mp4'),
        details: {
          location: 'Vehicle Interior',
          camera: 'Interior Camera',
          timestamp: '2024-01-15 16:45:22',
          duration: '00:01:38',
          severity: 'Critical',
          description: 'Aggressive behavior detected among passengers. Elevated voice levels and sudden movements triggered the behavioral analysis system.',
          actions: 'Emergency protocols activated, authorities contacted, driver alerted immediately.'
        }
      };
    }
  };

  const alertData = getAlertData();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>History</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Alert Title */}
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle}>{alertData.title}</Text>
          <View style={[styles.severityBadge, alertData.details.severity === 'Critical' ? styles.criticalBadge : styles.highBadge]}>
            <Text style={styles.severityText}>{alertData.details.severity}</Text>
          </View>
        </View>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            source={alertData.video}
            style={styles.video}
            shouldPlay={false}
            isLooping={true}
            resizeMode="cover"
            useNativeControls={true}
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#4A9EFF" />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{alertData.details.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="videocam" size={16} color="#4A9EFF" />
            <Text style={styles.detailLabel}>Camera:</Text>
            <Text style={styles.detailValue}>{alertData.details.camera}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#4A9EFF" />
            <Text style={styles.detailLabel}>Timestamp:</Text>
            <Text style={styles.detailValue}>{alertData.details.timestamp}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="timer" size={16} color="#4A9EFF" />
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{alertData.details.duration}</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{alertData.details.description}</Text>
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions Taken</Text>
            <Text style={styles.actionsText}>{alertData.details.actions}</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  alertHeader: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  criticalBadge: {
    backgroundColor: '#dc2626',
  },
  highBadge: {
    backgroundColor: '#f59e0b',
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(64,64,64,0.3)',
    borderRadius: 8,
  },
  detailLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  descriptionSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  descriptionText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'rgba(64,64,64,0.3)',
    padding: 12,
    borderRadius: 8,
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionsText: {
    color: '#4A9EFF',
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: 'rgba(74,158,255,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default HistoryScreen;