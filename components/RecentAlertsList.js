import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RecentAlertsList = () => {
  const alerts = [
    {
      id: 1,
      type: 'Motion Detected',
      location: 'Front-door',
      time: '2 mins ago',
      iconName: 'warning-outline',
      iconColor: '#FF0000',
    },
    {
      id: 2,
      type: 'Person Detected',
      location: 'Garage',
      time: '15 mins ago',
      iconName: 'person-outline',
      iconColor: '#C4C44A',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Alerts</Text>
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