import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RTSPPlayer from '../components/RTSPPlayer';

const HistoryScreen = ({ navigation, route }) => {
  const { alertType, rtspUrl, recordingUrl, timestamp } = route.params || {};

  const getAlertData = () => {
    const alertTime = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();
    
    if (alertType === 'weapon') {
      return {
        title: 'Weapon Detection Alert',
        details: {
          location: 'Security Zone',
          camera: 'Security Alert Camera',
          timestamp: alertTime,
          duration: 'Live Feed (30s before alert)',
          severity: 'Critical',
          description: 'Weapon detected in monitored area. Showing live RTSP feed from 30 seconds before alert was triggered.',
          actions: 'Security team dispatched, area secured, authorities notified, incident escalated to emergency response.'
        }
      };
    } else if (alertType === 'fatigue') {
      return {
        title: 'Driver Fatigue Alert',
        details: {
          location: 'Driver Seat',
          camera: 'Interior Camera',
          timestamp: alertTime,
          duration: 'Live Feed (30s before alert)',
          severity: 'High',
          description: 'Driver fatigue detected through behavioral analysis. Showing live RTSP feed from 30 seconds before alert was triggered.',
          actions: 'Driver alerted, safe stopping location suggested, emergency contacts notified.'
        }
      };
    } else {
      return {
        title: 'Aggressive Passengers Detected',
        details: {
          location: 'Vehicle Interior',
          camera: 'Interior Camera',
          timestamp: alertTime,
          duration: 'Live Feed (30s before alert)',
          severity: 'Critical',
          description: 'Aggressive behavior detected among passengers. Showing live RTSP feed from 30 seconds before alert was triggered.',
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
          {recordingUrl ? (
            <Text style={styles.recordingText}>Recording: {recordingUrl}</Text>
          ) : rtspUrl ? (
            <RTSPPlayer
              rtspUrl={rtspUrl}
              style={styles.video}
              showControls={true}
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons name="videocam-off" size={48} color="#666" />
              <Text style={styles.noVideoText}>No camera feed available</Text>
            </View>
          )}
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
  noVideoContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
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