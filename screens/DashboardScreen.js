import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from 'expo-av';
import SecurityAlertModal from '../components/SecurityAlertModal';
import ThreatCard from '../components/ThreatCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginSuccessModal from '../components/LoginSuccessModal';
import CameraSetupModal from '../components/CameraSetupModal';
import { useAlerts } from '../hooks/useAlerts';

const DashboardScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentAlert, isAlertVisible, closeAlert, showFullAlert, simulateAlert, startAlertMonitoring } = useAlerts();
  const [showThreatCard, setShowThreatCard] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(route?.params?.showLoginSuccess || false);
  const [showOnboardingCards, setShowOnboardingCards] = useState(false);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [alertType, setAlertType] = useState('aggression');
  const scrollViewRef = useRef(null);

  // Show ThreatCard when new alert arrives
  useEffect(() => {
    if (currentAlert && !isAlertVisible) {
      setShowThreatCard(true);
    }
  }, [currentAlert, isAlertVisible]);

  useEffect(() => {
    // Load notifications
    loadNotifications();

    // Load user profile for dynamic name
    loadUserProfile();

    // Start alert monitoring
    startAlertMonitoring();
  }, []);

  const handleCloseSecurityAlert = () => {
    closeAlert();
    setShowThreatCard(true);
    // Auto-scroll to threat card after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const createNotification = async (alertType) => {
    const alertTypes = {
      aggression: {
        type: 'Aggressive Passengers Detected',
        message: 'Aggressive behavior detected in vehicle interior',
        icon: 'person',
        iconColor: '#C4C44A'
      },
      weapon: {
        type: 'Weapon Detection Alert', 
        message: 'Weapon detected in Security Zone - Immediate attention required',
        icon: 'shield',
        iconColor: '#FF4500'
      },
      fatigue: {
        type: 'Driver Fatigue Alert',
        message: 'Driver fatigue detected - Pull over safely',
        icon: 'warning',
        iconColor: '#FF0000'
      }
    };

    const notification = {
      id: Date.now(),
      ...alertTypes[alertType],
      time: 'Just now',
      timestamp: new Date().toISOString(),
      unread: true,
      alertType
    };

    try {
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      notifications.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      setNotifications(notifications);
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const AuthService = require('../services/auth').default;
      const userProfile = await AuthService.getUserProfile();
      setUserName(userProfile.username || userProfile.email || 'User');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Try to get cached user data
      try {
        const AuthService = require('../services/auth').default;
        const cachedUser = await AuthService.getUser();
        if (cachedUser) {
          setUserName(cachedUser.username || cachedUser.email || 'User');
        }
      } catch (cacheError) {
        console.error('Failed to load cached user:', cacheError);
      }
    }
  };

  const handleExpandThreatCard = () => {
    setShowThreatCard(false);
    showFullAlert(); // Show SecurityAlertModal when expanding ThreatCard
  };
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('Name');

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.headerRight}>
            <View style={styles.alertButtonsContainer}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.weaponAlertButton]}
                onPress={() => {
                  const AlertService = require('../services/AlertService').default;
                  AlertService.simulateAlert('aggression');
                }}
              >
                <Ionicons name="warning" size={12} color="#212121" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.alertButton, styles.intruderAlertButton]}
                onPress={() => {
                  const AlertService = require('../services/AlertService').default;
                  AlertService.simulateAlert('weapon');
                }}
              >
                <Ionicons name="person" size={12} color="#212121" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.alertButton, styles.motionAlertButton]}
                onPress={() => {
                  const AlertService = require('../services/AlertService').default;
                  AlertService.simulateAlert('fatigue');
                }}
              >
                <Ionicons name="walk" size={12} color="#212121" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {notifications.length > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider}>
          <LinearGradient
            colors={['#666666', '#FFFFFF', '#666666']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
          />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            Welcome, <Text style={styles.nameAccent}>{userName}</Text>
          </Text>
          <Text style={styles.subtitle}>Your Security Overview</Text>
        </View>

        {/* System Status Card */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View style={styles.statusContent}>
              <View style={styles.statusBox}>
                <View style={styles.statusHeader}>
                  <View style={styles.greenDot} />
                  <Text style={styles.statusTitle}>System Status</Text>
                </View>
                <TouchableOpacity 
                  style={styles.systemHealthBox}
                  onPress={() => navigation.navigate('DeviceHealth')}
                >
                  <LinearGradient
                    colors={['#404040', '#000000', '#404040']}
                    style={styles.gradientBox}
                  >
                    <Text style={styles.systemHealthText}>System Health</Text>
                    <Text style={styles.healthPercentage}>50%</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.statusBox}>
                <Text style={styles.operationalText}>All Systems Operational</Text>
                <TouchableOpacity 
                  style={styles.seeDetailsLink}
                  onPress={() => navigation.navigate('Analytics')}
                >
                  <LinearGradient
                    colors={['#404040', '#000000', '#404040']}
                    style={styles.gradientBox}
                  >
                    <View style={styles.seeDetailsContent}>
                      <Text style={styles.seeDetailsText}>See Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#4A9EFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location"
              placeholderTextColor="#666666"
            />
          </View>
        </View>

        {/* Add Camera Card */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addCameraCard}
            onPress={() => navigation.navigate('AddCamera')}
          >
            <View style={styles.addCameraIconCircle}>
              <Ionicons name="add" size={24} color="#4A9EFF" />
            </View>
            <View style={styles.addCameraTextContainer}>
              <Text style={styles.addCameraTitle}>Add Camera</Text>
              <Text style={styles.addCameraSubtitle}>Scan for ONVIF cameras or enter one manually</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B92A7" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewCamerasLink}
            onPress={() => navigation.navigate('Cameras')}
          >
            <Text style={styles.viewCamerasLinkText}>View My Cameras</Text>
            <Ionicons name="chevron-forward" size={14} color="#4A9EFF" />
          </TouchableOpacity>
        </View>

        {/* Login Success Modal */}
        <LoginSuccessModal 
          visible={showLoginSuccess}
          onClose={() => {
            setShowLoginSuccess(false);
            setShowCameraSetup(true);
          }}
        />

        {/* Security Alert Modal */}
        <SecurityAlertModal 
          visible={isAlertVisible}
          onClose={handleCloseSecurityAlert}
          alertData={currentAlert}
          alertType={currentAlert?.type || alertType}
        />

        {/* Threat Card */}
        <View style={styles.section}>
          <ThreatCard
            visible={showThreatCard}
            onExpand={handleExpandThreatCard}
            onCancel={() => setShowThreatCard(false)}
            alertData={currentAlert}
            alertType={currentAlert?.type || alertType}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="apps" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="bar-chart" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Cameras')}
        >
          <Ionicons name="videocam" size={20} color="#8B92A7" />
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

      <CameraSetupModal
        visible={showCameraSetup}
        onClose={() => setShowCameraSetup(false)}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  dashboardTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  nameAccent: {
    color: '#4A9EFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B92A7',
    marginTop: 4,
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
  statusContainer: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  statusContent: {
    flexDirection: 'row',
    gap: 16,
  },
  statusBox: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginRight: 8,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  operationalText: {
    color: '#00FF00',
    fontSize: 14,
    marginBottom: 8,
  },
  systemHealthBox: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  seeDetailsLink: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  gradientBox: {
    padding: 16,
    alignItems: 'flex-start',
    minHeight: 80,
    justifyContent: 'center',
  },
  systemHealthText: {
    color: '#8B92A7',
    fontSize: 14,
    marginBottom: 8,
  },
  healthPercentage: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  seeDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeDetailsText: {
    color: '#4A9EFF',
    fontSize: 14,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addCameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  addCameraIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74,158,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  addCameraTextContainer: { flex: 1 },
  addCameraTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  addCameraSubtitle: { color: '#8B92A7', fontSize: 12 },
  viewCamerasLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  viewCamerasLinkText: { color: '#4A9EFF', fontSize: 14, fontWeight: '500' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingTop: 12,
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
  videoStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  streamingText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  urlText: {
    color: '#8B92A7',
    fontSize: 10,
    textAlign: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weaponDetectionIndicator: {
    backgroundColor: 'rgba(255,107,107,0.9)',
    paddingHorizontal: 8,
  },
  alertIndicator: {
    backgroundColor: 'rgba(255,69,0,0.9)',
    paddingHorizontal: 8,
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  alertButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weaponAlertButton: {
    backgroundColor: '#212121',
  },
  intruderAlertButton: {
    backgroundColor: '#212121',
  },
  motionAlertButton: {
    backgroundColor: '#212121',
  },
});

export default DashboardScreen;