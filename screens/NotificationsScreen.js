import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationsScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();
  
  const notifications = [
    {
      id: 1,
      type: 'Weapon Detection Alert',
      message: 'Weapon detected in Security Zone - Immediate attention required',
      time: '1 minute ago',
      icon: 'shield',
      iconColor: '#FF4500',
      unread: true,
      weaponDetection: true,
    },
    {
      id: 2,
      type: 'Unauthorized Passenger Detected',
      message: 'Unauthorized access attempt at Front-door Camera',
      time: '2 minutes ago',
      icon: 'warning',
      iconColor: '#FF0000',
      unread: true,
      alertType: 'unauthorized',
    },
    {
      id: 3,
      type: 'Aggressive Passengers Detected',
      message: 'Aggressive behavior detected in vehicle interior',
      time: '15 minutes ago',
      icon: 'person',
      iconColor: '#C4C44A',
      unread: true,
      alertType: 'aggressive',
    },
    {
      id: 4,
      type: 'System Alert',
      message: 'Back-yard Camera went offline',
      time: '1 hour ago',
      icon: 'alert-circle',
      iconColor: '#FF6B6B',
      unread: false,
    },
    {
      id: 5,
      type: 'Security Update',
      message: 'System health check completed successfully',
      time: '3 hours ago',
      icon: 'checkmark-circle',
      iconColor: '#00FF00',
      unread: false,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>Unread</Text>
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

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {notifications
            .filter(notification => filter === 'all' || (filter === 'unread' && notification.unread))
            .map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[styles.notificationItem, notification.unread && styles.unreadItem]}
              onPress={() => {
                if (notification.weaponDetection) {
                  navigation.navigate('History', { weaponDetection: true });
                } else if (notification.alertType) {
                  navigation.navigate('History', { alertType: notification.alertType });
                }
              }}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name={notification.icon} size={24} color={notification.iconColor} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationType}>{notification.type}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {notification.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={20} color="#8B92A7" />
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  activeFilter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000000',
  },
  divider: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  gradientLine: {
    height: 2,
  },
  notificationsList: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    backgroundColor: 'rgba(64,64,64,0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#999999',
  },
  unreadItem: {
    backgroundColor: 'rgba(74,158,255,0.1)',
    borderColor: '#4A9EFF',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationType: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8B92A7',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A9EFF',
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navItem: {
    padding: 8,
    borderRadius: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

export default NotificationsScreen;