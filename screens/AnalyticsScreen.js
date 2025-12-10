import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RecentAlertsList from '../components/RecentAlertsList';
import AddCameraModal from '../components/AddCameraModal';

const AnalyticsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('7 Days');
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);

  const handleAddCamera = (cameraData) => {
    console.log('New camera added:', cameraData);
  };

  const ActivityTimelineChart = () => {
    const yAxisLabels = [24, 20, 16, 12, 8, 4, 0];
    const xAxisLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    const barData = [8, 12, 18, 22, 16, 10, 6];
    
    return (
      <View style={styles.chartWrapper}>
        <View style={styles.chartYAxis}>
          {yAxisLabels.map((value) => (
            <Text key={value} style={styles.yAxisLabel}>{value}</Text>
          ))}
        </View>
        <View style={styles.chartArea}>
          {yAxisLabels.map((value, index) => (
            <View key={value} style={[styles.gridLine, { top: `${index * 16.67}%` }]} />
          ))}
          {xAxisLabels.map((_, index) => (
            <View key={index} style={[styles.verticalGridLine, { left: `${(index / 6) * 100}%` }]} />
          ))}
          <View style={styles.barsContainer}>
            {barData.map((height, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height: `${(height / 24) * 100}%` }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.xAxisContainer}>
          {xAxisLabels.map((label, index) => (
            <Text key={index} style={styles.xAxisLabel}>{label}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
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

      {/* Time Period Filter */}
      <View style={styles.filterContainer}>
        {['7 Days', '30 Days', '90 Days'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.filterTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.iconBackground}>
              <Ionicons name="pulse" size={44} color="#4A9EFF" />
            </View>
            <Text style={styles.metricNumber}>342</Text>
            <Text style={styles.metricLabel}>Total Events</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.iconBackground}>
              <Ionicons name="videocam" size={44} color="#4A9EFF" />
            </View>
            <Text style={styles.metricNumber}>1/2</Text>
            <Text style={styles.metricLabel}>Active Cameras</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.iconBackground}>
              <Ionicons name="time" size={44} color="#4A9EFF" />
            </View>
            <Text style={styles.metricNumber}>1.2s</Text>
            <Text style={styles.metricLabel}>Avg. Response</Text>
          </View>
          <View style={[styles.metricCard, styles.alertCard]}>
            <View style={styles.iconBackground}>
              <Ionicons name="warning" size={44} color="#FF6B6B" />
            </View>
            <Text style={styles.metricNumber}>8</Text>
            <Text style={[styles.metricLabel, styles.alertLabel]}>Alerts Today</Text>
          </View>
        </View>

      {/* Activity Timeline Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Activity Timeline</Text>
          <Text style={styles.chartSubtitle}>Today</Text>
        </View>
        <ActivityTimelineChart />
      </View>

      {/* Recent Alerts List */}
      <RecentAlertsList />

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
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="bar-chart" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowAddCameraModal(true)}
        >
          <Ionicons name="add" size={24} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('DeviceHealth')}
        >
          <Ionicons name="time" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={20} color="#8B92A7" />
        </TouchableOpacity>
      </View>

      <AddCameraModal 
        visible={showAddCameraModal}
        onClose={() => setShowAddCameraModal(false)}
        onComplete={handleAddCamera}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74,158,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#4A1515',
  },
  metricNumber: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#4A9EFF',
  },
  alertLabel: {
    color: '#FF6B6B',
  },
  chartContainer: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#4A9EFF',
  },
  chartWrapper: {
    height: 240,
    backgroundColor: '#1A1A1A',
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 40,
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    color: '#8B92A7',
    fontSize: 12,
    textAlign: 'center',
  },
  chartArea: {
    position: 'absolute',
    left: 40,
    right: 10,
    top: 10,
    bottom: 40,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  verticalGridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#2A2A2A',
  },
  barsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  bar: {
    width: 12,
    backgroundColor: '#4A9EFF',
    borderRadius: 6,
  },
  xAxisContainer: {
    position: 'absolute',
    left: 40,
    right: 10,
    bottom: 0,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xAxisLabel: {
    color: '#8B92A7',
    fontSize: 12,
    textAlign: 'center',
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

export default AnalyticsScreen;