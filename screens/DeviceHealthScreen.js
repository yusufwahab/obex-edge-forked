import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DeviceHealthScreen = ({ navigation }) => {
  const CircularProgress = ({ percentage }) => {
    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgressBackground}>
          <View style={[styles.circularProgressFill, { transform: [{ rotate: `${(percentage / 100) * 180}deg` }] }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
          <Text style={styles.progressLabel}>Overall</Text>
        </View>
      </View>
    );
  };

  const ProgressBar = ({ percentage, color }) => (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Device Health</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <LinearGradient
            colors={['#666666', '#FFFFFF', '#666666']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
          />
        </View>

      {/* System Health Card */}
      <View style={styles.section}>
        <View style={styles.systemHealthCard}>
          <Text style={styles.cardTitle}>System Health</Text>
          <CircularProgress percentage={50} />
          <View style={styles.statusIndicators}>
            <View style={styles.statusItem}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Devices Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Devices (2)</Text>
        
        {/* Device Card */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <View>
              <Text style={styles.deviceName}>Front-door Camera</Text>
              <Text style={styles.deviceLocation}>Main Entrance</Text>
              <Text style={styles.lastSeen}>Last seen: 2mins ago</Text>
            </View>
            <View style={styles.healthBadge}>
              <Text style={styles.healthBadgeText}>98% Health ✓</Text>
            </View>
          </View>

          {/* Device Metrics */}
          <View style={styles.metricsContainer}>
            {/* Battery */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#00FF00' }]}>
                  <Ionicons name="battery-full" size={24} color="#00FF00" />
                </View>
                <Text style={styles.metricLabel}>Battery</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={85} color="#00FF00" />
                <Text style={styles.metricPercentage}>85%</Text>
              </View>
            </View>

            {/* Signal Strength */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#4A9EFF' }]}>
                  <Ionicons name="wifi" size={24} color="#4A9EFF" />
                </View>
                <Text style={styles.metricLabel}>Signal Strength</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={92} color="#4A9EFF" />
                <Text style={styles.metricPercentage}>92%</Text>
              </View>
            </View>

            {/* Storage Used */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#A78BFA' }]}>
                  <Ionicons name="server" size={24} color="#A78BFA" />
                </View>
                <Text style={styles.metricLabel}>Storage Used</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={50} color="#A78BFA" />
                <Text style={styles.metricPercentage}>50%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Back-yard Camera Device Card */}
        <View style={[styles.deviceCard, styles.deviceCardSpacing]}>
          <View style={styles.deviceHeader}>
            <View>
              <Text style={styles.deviceName}>Back-yard Camera</Text>
              <Text style={styles.deviceLocation}>Garden Area</Text>
              <Text style={styles.lastSeen}>Last seen: 1h ago</Text>
            </View>
            <View style={[styles.healthBadge, styles.offlineHealthBadge]}>
              <Text style={styles.offlineHealthBadgeText}>Offline ✗</Text>
            </View>
          </View>

          {/* Device Metrics */}
          <View style={styles.metricsContainer}>
            {/* Battery */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#FF0000' }]}>
                  <Ionicons name="battery-dead" size={24} color="#FF0000" />
                </View>
                <Text style={styles.metricLabel}>Battery</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={12} color="#FF0000" />
                <Text style={styles.metricPercentage}>12%</Text>
              </View>
            </View>

            {/* Signal Strength */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#FF0000' }]}>
                  <Ionicons name="cellular" size={24} color="#FF0000" />
                </View>
                <Text style={styles.metricLabel}>Signal Strength</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={0} color="#FF0000" />
                <Text style={styles.metricPercentage}>0%</Text>
              </View>
            </View>

            {/* Storage Used */}
            <View style={styles.metricRow}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { borderColor: '#4A9EFF' }]}>
                  <Ionicons name="server" size={24} color="#4A9EFF" />
                </View>
                <Text style={styles.metricLabel}>Storage Used</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <ProgressBar percentage={62} color="#4A9EFF" />
                <Text style={styles.metricPercentage}>62%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="apps" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="bar-chart" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add" size={24} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="time" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={20} color="#8B92A7" />
        </TouchableOpacity>
      </View>
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  divider: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  gradientLine: {
    height: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  systemHealthCard: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 20,
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 140,
    height: 140,
  },
  circularProgressBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: '#2A2A2A',
    borderTopColor: '#4A9EFF',
    borderRightColor: '#4A9EFF',
    borderBottomColor: '#2A2A2A',
    borderLeftColor: '#2A2A2A',
  },
  circularProgressFill: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: 'transparent',
    borderTopColor: '#4A9EFF',
    borderRightColor: '#4A9EFF',
    top: -12,
    left: -12,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  progressPercentage: {
    fontSize: 44,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 14,
    color: '#8B92A7',
  },
  statusIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginRight: 6,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 6,
  },
  onlineText: {
    color: '#00FF00',
    fontSize: 14,
  },
  offlineText: {
    color: '#FF0000',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  deviceCard: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  deviceCardSpacing: {
    marginTop: 24,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 13,
    color: '#8B92A7',
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#8B92A7',
  },
  healthBadge: {
    backgroundColor: 'rgba(0,255,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  healthBadgeText: {
    fontSize: 13,
    color: '#00FF00',
    fontWeight: '500',
  },
  offlineHealthBadge: {
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  offlineHealthBadgeText: {
    fontSize: 13,
    color: '#FF0000',
    fontWeight: '500',
  },
  metricsContainer: {
    gap: 16,
  },
  metricRow: {
    flexDirection: 'column',
    gap: 8,
  },
  metricIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    position: 'relative',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricPercentage: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: 14,
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#555555',
  },
  navItem: {
    padding: 8,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
});

export default DeviceHealthScreen;