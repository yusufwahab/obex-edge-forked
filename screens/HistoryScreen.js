import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import RTSPPlayer from '../components/RTSPPlayer';

// Per-type copy used only as a fallback when the real alert didn't carry its own
// location/description (e.g. the Dashboard's demo "simulate alert" buttons, which
// have no backing alert record at all).
const ALERT_TYPE_FALLBACKS = {
  weapon: {
    title: 'Weapon Detection Alert',
    location: 'Security Zone',
    severity: 'Critical',
    description: 'Weapon detected in monitored area.',
    actions: 'Security team dispatched, area secured, authorities notified, incident escalated to emergency response.',
  },
  fatigue: {
    title: 'Driver Fatigue Alert',
    location: 'Driver Seat',
    severity: 'High',
    description: 'Driver fatigue detected through behavioral analysis.',
    actions: 'Driver alerted, safe stopping location suggested, emergency contacts notified.',
  },
  aggression: {
    title: 'Aggressive Passengers Detected',
    location: 'Vehicle Interior',
    severity: 'Critical',
    description: 'Aggressive behavior detected among passengers.',
    actions: 'Emergency protocols activated, authorities contacted, driver alerted immediately.',
  },
};

const HistoryScreen = ({ navigation, route }) => {
  const { alertType, rtspUrl, recordingUrl, location, description, timestamp } = route.params || {};

  const getAlertData = () => {
    const alertTime = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();
    const fallback = ALERT_TYPE_FALLBACKS[alertType] || ALERT_TYPE_FALLBACKS.aggression;

    return {
      title: fallback.title,
      details: {
        location: location || fallback.location,
        timestamp: alertTime,
        severity: fallback.severity,
        description: description || fallback.description,
        actions: fallback.actions,
      },
    };
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
            // Stitched incident clip uploaded to S3 by the edge device — a finite
            // video file, not a live stream, so this uses expo-av directly rather
            // than the VLC/RTSP-oriented RTSPPlayer.
            <Video
              source={{ uri: recordingUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay
            />
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
            <Ionicons name="time" size={16} color="#4A9EFF" />
            <Text style={styles.detailLabel}>Timestamp:</Text>
            <Text style={styles.detailValue}>{alertData.details.timestamp}</Text>
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