import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RTSPPlayer from '../components/RTSPPlayer';
import NetworkTest from '../components/NetworkTest';
import CameraTunnelService from '../services/CameraTunnelService';
import ModuleTest from '../components/ModuleTest';
import SecurityAlertModal from '../components/SecurityAlertModal';

const { width, height } = Dimensions.get('window');

const LiveStreamScreen = ({ navigation }) => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [savedStreams, setSavedStreams] = useState([
    {
      id: 1,
      name: 'Front Door Camera',
      url: 'rtsp://admin:password@192.168.1.100:554/stream1',
      isActive: false
    },
    {
      id: 2,
      name: 'Backyard Camera',
      url: require('../WeaponDetectionVideo.mp4'),
      isActive: false,
      hasWeaponDetection: true
    }
  ]);
  
  // FRPC Camera State
  const [frpcCameras, setFrpcCameras] = useState([]);
  const [tunnelStatus, setTunnelStatus] = useState({ isActive: false });
  const [loadingFrpc, setLoadingFrpc] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [alertType, setAlertType] = useState('aggression');
  const [isMinimized, setIsMinimized] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const initializeFrpc = async () => {
      try {
        // Test if native module is available
        const { NativeModules } = require('react-native');
        if (NativeModules.FRPCModule) {
          await loadFrpcCameras();
          await loadTunnelStatus();
        } else {
          console.log('FRPC Native module not available - will try fallback methods');
          setTunnelStatus({ isActive: false });
        }
      } catch (error) {
        console.error('FRPC initialization error:', error);
        setTunnelStatus({ isActive: false, error: 'Module error' });
      }
    };
    
    initializeFrpc();
  }, []);
  
  useEffect(() => {
    if (isMinimized) {
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous opacity pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isMinimized]);

  const handleStartStream = () => {
    if (!rtspUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid RTSP URL');
      return;
    }
    
    if (!rtspUrl.startsWith('rtsp://')) {
      Alert.alert('Error', 'URL must start with rtsp://');
      return;
    }

    setIsStreaming(true);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
  };

  const handleStreamError = (error) => {
    console.error('Stream error:', error);
    setIsStreaming(false);
  };

  const handleStreamLoad = (data) => {
    console.log('Stream loaded:', data);
  };

  const selectSavedStream = (stream) => {
    setRtspUrl(stream.url);
    // Update active status
    setSavedStreams(prev => 
      prev.map(s => ({ ...s, isActive: s.id === stream.id }))
    );
  };

  // FRPC Functions
  const loadFrpcCameras = async () => {
    try {
      const cameras = await CameraTunnelService.getCameras();
      setFrpcCameras(cameras);
    } catch (error) {
      console.error('Failed to load FRPC cameras:', error);
      setFrpcCameras([]);
    }
  };

  const loadTunnelStatus = async () => {
    try {
      const status = await CameraTunnelService.getTunnelStatus();
      setTunnelStatus(status);
    } catch (error) {
      console.error('Failed to load tunnel status:', error);
      setTunnelStatus({ isActive: false, error: 'Native module not loaded' });
    }
  };

  const handleStartTunnel = async () => {
    setLoadingFrpc(true);
    try {
      const result = await CameraTunnelService.setupAndStart();
      if (result.success) {
        Alert.alert('Success', 'Tunnel started successfully');
        loadTunnelStatus();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start tunnel');
    } finally {
      setLoadingFrpc(false);
    }
  };

  const handleStopTunnel = async () => {
    try {
      const result = await CameraTunnelService.stopTunnel();
      if (result.success) {
        Alert.alert('Success', 'Tunnel stopped');
        loadTunnelStatus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tunnel');
    }
  };

  const selectFrpcCamera = async (camera) => {
    if (!tunnelStatus.isActive) {
      Alert.alert('Tunnel Not Active', 'Please start the tunnel first');
      return;
    }
    try {
      const streamUrl = await CameraTunnelService.getCameraStreamURL(camera);
      setRtspUrl(streamUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to get camera stream URL');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Live Stream</Text>
        <View style={styles.headerRight}>
          <View style={styles.alertButtonsContainer}>
            <TouchableOpacity 
              style={[styles.alertButton, styles.weaponAlertButton]}
              onPress={() => {
                console.log('Alert button pressed');
                setAlertType('aggression');
                setShowSecurityAlert(true);
              }}
            >
              <Ionicons name="warning" size={12} color="#333333" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.alertButton, styles.intruderAlertButton]}
              onPress={() => {
                setAlertType('weapon');
                setShowSecurityAlert(true);
              }}
            >
              <Ionicons name="person" size={12} color="#333333" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.alertButton, styles.motionAlertButton]}
              onPress={() => {
                setAlertType('fatigue');
                setShowSecurityAlert(true);
              }}
            >
              <Ionicons name="walk" size={12} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stream Player */}
        <View style={styles.playerContainer}>
          {isStreaming ? (
            <RTSPPlayer
              rtspUrl={rtspUrl}
              style={styles.player}
              onError={handleStreamError}
              onLoad={handleStreamLoad}
              showControls={true}
            />
          ) : (
            <View style={styles.placeholderPlayer}>
              <Ionicons name="videocam-outline" size={64} color="#666666" />
              <Text style={styles.placeholderText}>No Stream Active</Text>
            </View>
          )}
        </View>

        {/* Stream Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.urlInputContainer}>
            <Text style={styles.testHint}>💡 Test your local RTSP by pasting your local or staged rtsp the URL below</Text>
            <Text style={styles.inputLabel}>RTSP URL:</Text>
            <TextInput
              style={styles.urlInput}
              value={rtspUrl}
              onChangeText={setRtspUrl}
              placeholder="rtsp://username:password@ipaddress:port/path"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            {!isStreaming ? (
              <TouchableOpacity 
                style={styles.startButton} 
                onPress={handleStartStream}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Start Stream</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.stopButton} 
                onPress={handleStopStream}
              >
                <Ionicons name="stop" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Stop Stream</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FRPC Remote Cameras */}
        <View style={styles.savedStreamsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Remote Cameras (FRPC)</Text>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate('CameraManagement')}
            >
              <Ionicons name="settings" size={16} color="#4A9EFF" />
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tunnel Status */}
          <View style={styles.tunnelStatus}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: tunnelStatus.isActive ? '#4CAF50' : '#F44336' }]} />
              <Text style={styles.statusText}>
                Tunnel: {tunnelStatus.isActive ? 'Active' : tunnelStatus.error || 'Inactive'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.tunnelButton, tunnelStatus.isActive ? styles.stopTunnelButton : styles.startTunnelButton, tunnelStatus.error && styles.disabledButton]}
              onPress={tunnelStatus.isActive ? handleStopTunnel : handleStartTunnel}
              disabled={loadingFrpc}
            >
              {loadingFrpc ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons 
                    name={tunnelStatus.isActive ? "stop" : "play"} 
                    size={16} 
                    color="#FFF" 
                  />
                  <Text style={styles.tunnelButtonText}>
                    {tunnelStatus.isActive ? 'Stop' : 'Start'} Tunnel
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* FRPC Cameras */}
          {frpcCameras.length > 0 ? (
            frpcCameras.filter(cam => cam.enabled).map((camera) => (
              <TouchableOpacity
                key={camera.id}
                style={styles.streamItem}
                onPress={() => selectFrpcCamera(camera)}
              >
                <View style={styles.streamInfo}>
                  <Ionicons name="globe" size={20} color="#4A9EFF" />
                  <View style={styles.streamTextContainer}>
                    <Text style={styles.streamName}>{camera.name}</Text>
                    <Text style={styles.streamUrl}>
                      Remote Port: {camera.remotePort}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No remote cameras configured</Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => navigation.navigate('CameraManagement')}
              >
                <Text style={styles.setupButtonText}>Add Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Saved Streams */}
        <View style={styles.savedStreamsContainer}>
          <Text style={styles.sectionTitle}>Local Cameras</Text>
          {savedStreams.map((stream) => (
            <TouchableOpacity
              key={stream.id}
              style={[
                styles.streamItem,
                stream.isActive && styles.streamItemActive
              ]}
              onPress={() => selectSavedStream(stream)}
            >
              <View style={styles.streamInfo}>
                <Ionicons 
                  name="videocam" 
                  size={20} 
                  color={stream.isActive ? "#4A9EFF" : "#FFFFFF"} 
                />
                <View style={styles.streamTextContainer}>
                  <Text style={[
                    styles.streamName,
                    stream.isActive && styles.streamNameActive
                  ]}>
                    {stream.name}
                  </Text>
                  {stream.hasWeaponDetection && (
                    <View style={styles.weaponDetectionBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#FF6B6B" />
                      <Text style={styles.weaponDetectionText}>Weapon Detection</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Module Test */}
        <ModuleTest />
        
        {/* Network Test */}
        <NetworkTest cameraIP="192.168.1.10" />

        {/* Module Test */}
        <ModuleTest />
        
        {/* Network Test */}
        <NetworkTest cameraIP="192.168.1.10" />

        {/* Stream Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>RTSP Streaming Tips:</Text>
          <Text style={styles.infoText}>• Use TCP for more reliable connection</Text>
          <Text style={styles.infoText}>• Lower resolution reduces latency</Text>
          <Text style={styles.infoText}>• Ensure camera supports RTSP protocol</Text>
          <Text style={styles.infoText}>• Check network connectivity</Text>
        </View>
      </ScrollView>
      
      {/* Security Alert Modal */}
      {showSecurityAlert && (
        <SecurityAlertModal 
          visible={showSecurityAlert && !isMinimized}
          onClose={(action) => {
            if (action === 'minimize') {
              setIsMinimized(true);
            } else {
              setShowSecurityAlert(false);
              setIsMinimized(false);
            }
          }}
          alertType={alertType}
        />
      )}
      
      {/* Minimized Alert */}
      {showSecurityAlert && isMinimized && (
        <Animated.View 
          style={[
            styles.minimizedThreatCard,
            {
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableOpacity style={styles.minimizedTouchable} onPress={() => setIsMinimized(false)}>
            <View style={styles.minimizedHeader}>
              <View style={styles.minimizedCriticalBadge}>
                <Text style={styles.minimizedCriticalText}>CRITICAL</Text>
              </View>
              <View style={styles.minimizedIconContainer}>
                <Ionicons name="person-circle" size={24} color="#991b1b" />
                <View style={styles.minimizedAlertBadge}>
                  <Ionicons name="warning" size={10} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View style={styles.minimizedContent}>
              <View style={styles.minimizedMainInfo}>
                <Text style={styles.minimizedTitle}>Threat</Text>
                <Text style={styles.minimizedDescription}>Alert Active</Text>
              </View>
              
              <View style={styles.minimizedFooter}>
                <Text style={styles.minimizedThreatLabel}>Threat Level</Text>
                <Text style={styles.minimizedThreatPercentage}>96%</Text>
              </View>
              <View style={styles.minimizedProgressBarContainer}>
                <View style={[styles.minimizedProgressBar, { width: '96%' }]} />
              </View>
            </View>

            <View style={styles.minimizedExpandIcon}>
              <Ionicons name="chevron-up" size={16} color="#9ca3af" />
            </View>
            
            <TouchableOpacity 
              style={styles.minimizedCloseButton}
              onPress={(e) => {
                e.stopPropagation();
                setShowSecurityAlert(false);
                setIsMinimized(false);
              }}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playerContainer: {
    height: height * 0.3,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  player: {
    flex: 1,
  },
  placeholderPlayer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 12,
  },
  controlsContainer: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  urlInputContainer: {
    marginBottom: 16,
  },
  testHint: {
    color: '#4A9EFF',
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333333',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4A9EFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savedStreamsContainer: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  streamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
  },
  streamItemActive: {
    backgroundColor: 'rgba(74,158,255,0.2)',
    borderWidth: 1,
    borderColor: '#4A9EFF',
  },
  streamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streamTextContainer: {
    flex: 1,
  },
  streamName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  streamNameActive: {
    color: '#4A9EFF',
    fontWeight: '600',
  },
  weaponDetectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  weaponDetectionText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  // FRPC Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageButtonText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tunnelStatus: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tunnelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  startTunnelButton: {
    backgroundColor: '#4CAF50',
  },
  stopTunnelButton: {
    backgroundColor: '#F44336',
  },
  tunnelButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  streamUrl: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  setupButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  setupButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
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
    backgroundColor: '#333333',
  },
  intruderAlertButton: {
    backgroundColor: '#333333',
  },
  motionAlertButton: {
    backgroundColor: '#333333',
  },
  minimizedThreatCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  minimizedTouchable: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  minimizedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  minimizedCriticalBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  minimizedCriticalText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  minimizedIconContainer: {
    position: 'relative',
  },
  minimizedAlertBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 1,
  },
  minimizedContent: {
    marginBottom: 8,
  },
  minimizedMainInfo: {
    marginBottom: 12,
  },
  minimizedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  minimizedDescription: {
    color: '#9ca3af',
    fontSize: 12,
  },
  minimizedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  minimizedThreatLabel: {
    color: '#9ca3af',
    fontSize: 10,
  },
  minimizedThreatPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  minimizedProgressBarContainer: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  minimizedProgressBar: {
    height: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },
  minimizedExpandIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  minimizedCloseButton: {
    position: 'absolute',
    top: 8,
    right: 30,
    padding: 4,
  },
});

export default LiveStreamScreen;