import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddCameraModal from '../components/AddCameraModal';
import RTSPPlayer from '../components/RTSPPlayer';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from 'expo-av';
import SecurityAlertModal from '../components/SecurityAlertModal';
import ThreatCard from '../components/ThreatCard';
import CameraTunnelService from '../services/CameraTunnelService';
import PermissionService from '../services/PermissionService';

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [showThreatCard, setShowThreatCard] = useState(false);
  const [frpcLogs, setFrpcLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecurityAlert(true);
    }, 10000);
    
    // Auto-start tunneling on app launch
    initializeAndStartTunnel();
    
    // Setup FRPC log listener
    const logUnsubscribe = CameraTunnelService.onFRPCLog((log) => {
      console.log('FRPC Log:', log);
      setFrpcLogs(prev => {
        const newLogs = [...prev, { timestamp: new Date().toLocaleTimeString(), message: log }];
        return newLogs.slice(-50); // Keep last 50 logs
      });
    });
    
    return () => {
      clearTimeout(timer);
      logUnsubscribe && logUnsubscribe();
    };
  }, []);
  
  const initializeAndStartTunnel = async () => {
    try {
      console.log('🚀 Initializing FRPC tunnel...');
      
      // Request permissions first
      console.log('🔐 Requesting permissions...');
      const permissionsGranted = await PermissionService.requestAllPermissions();
      if (!permissionsGranted) {
        console.warn('⚠️ Some permissions denied, continuing with limited functionality');
      }
      
      // Install FRPC binary first
      console.log('💾 Installing FRPC binary...');
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.FRPCModule && NativeModules.FRPCModule.installFRPCBinary) {
          const binaryPath = await NativeModules.FRPCModule.installFRPCBinary();
          console.log('✅ FRPC binary installed at:', binaryPath);
        }
      } catch (installError) {
        console.error('❌ FRPC binary installation failed:', installError.message);
        throw new Error('Binary installation failed: ' + installError.message);
      }
      
      // Save default FRPS config if not exists
      const existingConfig = await CameraTunnelService.loadFRPSConfig();
      if (!existingConfig) {
        console.log('📝 Creating default FRPS config...');
        await CameraTunnelService.saveFRPSConfig(
          'staging.ai.avzdax.com',
          7000,
          '30PWz5yr0zf7lUALdMauzcxsHs5_3y1BfJdrVJVV8aVAzteNf'
        );
        console.log('✅ Default FRPS config created');
      } else {
        console.log('✅ FRPS config already exists');
      }
      
      // Add default camera if no cameras exist
      const existingCameras = await CameraTunnelService.getCameras();
      if (existingCameras.length === 0) {
        console.log('📷 Creating default camera...');
        await CameraTunnelService.addCamera(
          'Default Camera',
          '192.168.1.10',
          554,
          557
        );
        console.log('✅ Default camera created');
      } else {
        console.log(`✅ Found ${existingCameras.length} existing cameras`);
      }
      
      // Run diagnostics first
      console.log('🔍 Running FRPC diagnostics...');
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.FRPCModule && NativeModules.FRPCModule.runComprehensiveDiagnostics) {
          const diagnostics = await NativeModules.FRPCModule.runComprehensiveDiagnostics();
          console.log('📊 FRPC Diagnostics:', diagnostics);
          
          if (diagnostics.issues && diagnostics.issues.length > 0) {
            console.warn('⚠️ FRPC Issues found:', diagnostics.issues);
          }
          if (diagnostics.warnings && diagnostics.warnings.length > 0) {
            console.warn('⚠️ FRPC Warnings:', diagnostics.warnings);
          }
        }
      } catch (diagError) {
        console.error('❌ Diagnostics failed:', diagError.message);
      }
      
      // Test binary execution
      console.log('🧪 Testing FRPC binary execution...');
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.FRPCModule && NativeModules.FRPCModule.testFRPCExecution) {
          const testResult = await NativeModules.FRPCModule.testFRPCExecution();
          console.log('🧪 Binary test result:', testResult);
        }
      } catch (testError) {
        console.error('❌ Binary test failed:', testError.message);
      }
      
      // Start tunnel automatically
      console.log('🔄 Starting FRPC tunnel...');
      const result = await CameraTunnelService.setupAndStart();
      console.log('🎯 Auto-start tunnel result:', result);
      
      if (result.success) {
        console.log('🎉 FRPC tunnel started successfully!');
      } else {
        console.error('❌ FRPC tunnel failed to start:', result.message);
        
        // Additional debugging for binary issues
        try {
          const { NativeModules } = require('react-native');
          if (NativeModules.FRPCModule && NativeModules.FRPCModule.checkBinaryPermissions) {
            const permissions = await NativeModules.FRPCModule.checkBinaryPermissions();
            console.log('🔐 Binary permissions:', permissions);
          }
        } catch (permError) {
          console.error('❌ Permission check failed:', permError.message);
        }
        
        // Show user-friendly message
        console.log('📝 Note: FRPC auto-start failed. This is common in development builds.');
        console.log('📝 Try using a preview or production build for full FRPC functionality.');
        console.log('📝 You can still test manually from the Live Stream screen.');
      }
      
    } catch (error) {
      console.error('💥 Failed to auto-start tunnel:', error);
      console.error('Error details:', error.message);
      
      // Don't crash the app, just log the error
      console.log('📝 App will continue without FRPC auto-start');
      console.log('📝 Manual tunnel control available in Live Stream screen');
    }
  };

  const handleCloseSecurityAlert = () => {
    setShowSecurityAlert(false);
    setShowThreatCard(true);
    // Auto-scroll to threat card after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleExpandThreatCard = () => {
    setShowThreatCard(false);
    setShowSecurityAlert(true);
  };
  const [cameras, setCameras] = useState([
    {
      id: 1,
      name: 'Front-door Camera',
      location: 'Main Entrance',
      rtspUrl: null,
      isOnline: true
    },
    {
      id: 2,
      name: 'John Vehicle Cam',
      location: 'Garden Area',
      rtspUrl: null,
      isOnline: true,
      hasWeaponDetection: true
    },
    {
      id: 3,
      name: 'Security Alert Camera',
      location: 'Weapon Detection Zone',
      rtspUrl: null,
      isOnline: true,
      hasWeaponDetection: true,
      isAlert: true
    }
  ]);

  const handleAddCamera = (cameraData) => {
    const newCamera = {
      id: Date.now(),
      name: cameraData.name,
      location: 'New Location',
      rtspUrl: cameraData.rtspUrl,
      isOnline: true
    };
    setCameras(prev => [...prev, newCamera]);
  };

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
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            <View style={styles.notificationDot} />
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

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            Welcome, <Text style={styles.nameAccent}>Name</Text>
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

        {/* Live Stream Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.liveStreamButton}
            onPress={() => navigation.navigate('LiveStream')}
          >
            <Ionicons name="videocam" size={24} color="#FFFFFF" />
            <Text style={styles.liveStreamText}>Live RTSP Stream</Text>
            <Ionicons name="chevron-forward" size={20} color="#4A9EFF" />
          </TouchableOpacity>
        </View>

        {/* Security Alert Modal */}
        <SecurityAlertModal 
          visible={showSecurityAlert}
          onClose={handleCloseSecurityAlert}
        />

        {/* My Cameras Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Cameras ({cameras.length})</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddCameraModal(true)}
            >
              <Ionicons name="add" size={16} color="#4A9EFF" style={styles.addIcon} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Camera Grid */}
          <View style={styles.cameraGrid}>
            {cameras.map((camera) => (
              <View key={camera.id} style={styles.cameraCard}>
                <LinearGradient
                  colors={['#333333', '#2A3A4A']}
                  style={styles.cameraFullContainer}
                >
                  <View style={styles.cameraHeader}>
                    <View style={[styles.onlineBadge, !camera.isOnline && styles.offlineBadge]}>
                      <View style={camera.isOnline ? styles.onlineDot : styles.offlineDot} />
                      <Text style={camera.isOnline ? styles.onlineText : styles.offlineText}>
                        {camera.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cameraIconArea}>
                    {camera.id === 1 ? (
                      <>
                        <VideoPlayer style={styles.videoPlayer} />
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      </>
                    ) : camera.id === 2 ? (
                      <>
                        <VideoPlayer style={styles.videoPlayer} weaponDetection={true} />
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      </>
                    ) : camera.id === 3 ? (
                      <TouchableOpacity 
                        style={styles.cameraIconArea}
                        onPress={() => navigation.navigate('History', { weaponDetection: true })}
                      >
                        <VideoPlayer style={styles.videoPlayer} weaponDetection={true} />
                        <View style={[styles.liveIndicator, styles.alertIndicator]}>
                          <Ionicons name="warning" size={12} color="#FFFFFF" />
                          <Text style={styles.liveText}>ALERT</Text>
                        </View>
                      </TouchableOpacity>
                    ) : camera.rtspUrl ? (
                      <>
                        <View style={styles.videoStream}>
                          <Text style={styles.streamingText}>RTSP Stream Ready</Text>
                          <Text style={styles.urlText}>{camera.rtspUrl}</Text>
                        </View>
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>READY</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="videocam" size={48} color="#666666" />
                        <View style={styles.playOverlay}>
                          <Ionicons name="play" size={16} color="#FFFFFF" />
                        </View>
                      </>
                    )}
                  </View>
                </LinearGradient>
                <View style={styles.cameraInfo}>
                  <Text style={styles.cameraName}>{camera.name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#CCCCCC" />
                    <Text style={styles.cameraLocation}>{camera.location}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Ionicons name="time" size={14} color="#CCCCCC" />
                    <Text style={styles.cameraStatus}>
                      {camera.isOnline ? 'Active 2h • 12 Events Today' : 'Inactive • Last seen 1h ago'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Add Camera Card */}
            <TouchableOpacity 
              style={[styles.cameraCard, styles.addCameraCard]}
              onPress={() => setShowAddCameraModal(true)}
            >
              <View style={styles.addCameraIcon}>
                <Ionicons name="add" size={48} color="#4A9EFF" />
              </View>
              <Text style={styles.addCameraText}>Add New Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FRPC Logs Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logsHeader}
            onPress={() => setShowLogs(!showLogs)}
          >
            <Text style={styles.sectionTitle}>FRPC Logs ({frpcLogs.length})</Text>
            <Ionicons 
              name={showLogs ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          {showLogs && (
            <View style={styles.logsContainer}>
              {frpcLogs.length > 0 ? (
                <ScrollView 
                  style={styles.logsList}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {frpcLogs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                      <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                      <Text style={styles.logMessage}>{log.message}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noLogsContainer}>
                  <Text style={styles.noLogsText}>No FRPC logs yet</Text>
                  <Text style={styles.noLogsSubtext}>Logs will appear when tunnel is active</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Threat Card - appears below camera section when modal is closed */}
        <ThreatCard 
          visible={showThreatCard}
          onExpand={handleExpandThreatCard}
        />

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  addIcon: {
    marginRight: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cameraGrid: {
    gap: 16,
  },
  cameraCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.2,
    borderColor: '#555555',
  },
  cameraFullContainer: {
    height: 180,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 12,
  },
  cameraIconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#666666',
    borderRadius: 20,
    padding: 8,
  },
  cameraInfo: {
    backgroundColor: '#333333',
    padding: 16,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineBadge: {
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF00',
    marginRight: 4,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF0000',
    marginRight: 4,
  },
  onlineText: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: '500',
  },
  offlineText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: '500',
  },
  cameraName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraLocation: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 4,
  },
  cameraStatus: {
    color: '#CCCCCC',
    fontSize: 12,
    marginLeft: 4,
  },
  addCameraCard: {
    backgroundColor: 'rgba(74,158,255,0.1)',
    borderColor: '#4A9EFF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  addCameraIcon: {
    marginBottom: 12,
  },
  addCameraText: {
    color: '#4A9EFF',
    fontSize: 16,
    fontWeight: '500',
  },
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
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },

  liveStreamButton: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  liveStreamText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  
  // FRPC Logs Styles
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  logsContainer: {
    backgroundColor: 'rgba(32,32,32,0.9)',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
  },
  logsList: {
    maxHeight: 180,
    padding: 12,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  logTimestamp: {
    color: '#4A9EFF',
    fontSize: 12,
    fontFamily: 'monospace',
    width: 80,
    marginRight: 8,
  },
  logMessage: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
  },
  noLogsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noLogsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  noLogsSubtext: {
    color: '#555',
    fontSize: 12,
  },
});

export default DashboardScreen;