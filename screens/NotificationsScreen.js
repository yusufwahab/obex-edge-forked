import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import AlertService from '../services/AlertService';

const READ_IDS_KEY = 'read_alert_ids';

const ALERT_ICONS = {
  aggression: { icon: 'person', color: '#C4C44A' },
  weapon: { icon: 'shield', color: '#FF4500' },
  fatigue: { icon: 'warning', color: '#FF0000' },
};

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const NotificationsScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, readIdsRaw] = await Promise.all([
        AlertService.getRecentAlerts(50, 0),
        AsyncStorage.getItem(READ_IDS_KEY),
      ]);
      const readIds = new Set(readIdsRaw ? JSON.parse(readIdsRaw) : []);
      const rawAlerts = Array.isArray(result?.data) ? result.data : [];

      const items = rawAlerts.map((raw) => {
        const formatted = AlertService.formatAlert(raw);
        const iconInfo = ALERT_ICONS[formatted.type] || ALERT_ICONS.aggression;
        return {
          id: String(formatted.id),
          icon: iconInfo.icon,
          iconColor: iconInfo.color,
          type: formatted.title,
          message: formatted.description,
          time: timeAgo(formatted.timestamp),
          unread: !readIds.has(String(formatted.id)),
          alertType: formatted.type,
          rtspUrl: formatted.videoUrl,
          timestamp: formatted.timestamp,
        };
      });

      setNotifications(items);
    } catch (e) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const markAsRead = async (notification) => {
    const updated = notifications.map((n) =>
      n.id === notification.id ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    const readIds = updated.filter((n) => !n.unread).map((n) => n.id);
    await AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify(readIds));
  };

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    await AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify(updated.map((n) => n.id)));
  };

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity style={styles.clearButton} onPress={markAllRead}>
            <Text style={styles.clearText}>Mark All Read</Text>
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

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4A9EFF" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <View style={styles.notificationsList}>
            {notifications
              .filter((notification) => filter === 'all' || (filter === 'unread' && notification.unread))
              .map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, notification.unread && styles.unreadItem]}
                onPress={() => {
                  markAsRead(notification);
                  navigation.navigate('History', {
                    alertType: notification.alertType,
                    rtspUrl: notification.rtspUrl,
                    timestamp: notification.timestamp
                  });
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

            {notifications.length === 0 && (
              <View style={styles.centered}>
                <Ionicons name="notifications-off-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  errorText: { color: '#FF6B6B', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#8B92A7', fontSize: 14, marginTop: 12 },
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
