import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertService from '../services/AlertService';

const ALERT_ICONS = {
  aggression: { icon: 'person-outline', color: '#C4C44A' },
  weapon: { icon: 'warning-outline', color: '#FF4500' },
  fatigue: { icon: 'warning-outline', color: '#FF0000' },
};

function timeAgo(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const RecentAlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    AlertService.getRecentAlerts(5, 0)
      .then((result) => {
        if (cancelled) return;
        const rawAlerts = Array.isArray(result?.data) ? result.data : [];
        setAlerts(
          rawAlerts.map((raw) => {
            const formatted = AlertService.formatAlert(raw);
            const iconInfo = ALERT_ICONS[formatted.type] || ALERT_ICONS.aggression;
            return {
              id: formatted.id,
              type: formatted.title,
              location: formatted.location,
              time: timeAgo(formatted.timestamp),
              iconName: iconInfo.icon,
              iconColor: iconInfo.color,
            };
          })
        );
      })
      .catch((e) => !cancelled && setError(e.message || 'Failed to load alerts'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Alerts</Text>

      {loading && <ActivityIndicator color="#4A9EFF" style={styles.centered} />}

      {!loading && error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && alerts.length === 0 && (
        <Text style={styles.emptyText}>No alerts yet</Text>
      )}

      {!loading && !error && alerts.length > 0 && (
        <View style={styles.alertsGrid}>
          {alerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <LinearGradient colors={['#404040', '#000000', '#404040']} style={styles.alertGradient}>
                <View style={styles.iconContainer}>
                  <Ionicons name={alert.iconName} size={30} color={alert.iconColor} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={styles.locationTime}>
                    {alert.location} • {alert.time}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(64,64,64,0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555555',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  centered: { marginVertical: 12 },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  emptyText: { color: '#8B92A7', fontSize: 13 },
  alertsGrid: {
    gap: 16,
  },
  alertItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555555',
    overflow: 'hidden',
    marginBottom: 16,
  },
  alertGradient: {
    backgroundColor: 'rgba(64,64,64,0.3)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 20,
  },
  textContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default RecentAlertsList;
