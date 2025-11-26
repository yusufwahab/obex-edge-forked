import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RTSPPlayer from '../components/RTSPPlayer';

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
      name: 'Back Yard Camera',
      url: 'rtsp://admin:password@192.168.1.101:554/stream1',
      isActive: false
    }
  ]);

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
        <View style={styles.placeholder} />
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
            <Text style={styles.inputLabel}>RTSP URL:</Text>
            <TextInput
              style={styles.urlInput}
              value={rtspUrl}
              onChangeText={setRtspUrl}
              placeholder="rtsp://username:password@ip:port/stream"
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

        {/* Saved Streams */}
        <View style={styles.savedStreamsContainer}>
          <Text style={styles.sectionTitle}>Saved Cameras</Text>
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
                <Text style={[
                  styles.streamName,
                  stream.isActive && styles.streamNameActive
                ]}>
                  {stream.name}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#666666" 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stream Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>RTSP Streaming Tips:</Text>
          <Text style={styles.infoText}>• Use TCP for more reliable connection</Text>
          <Text style={styles.infoText}>• Lower resolution reduces latency</Text>
          <Text style={styles.infoText}>• Ensure camera supports RTSP protocol</Text>
          <Text style={styles.infoText}>• Check network connectivity</Text>
        </View>
      </ScrollView>
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
  streamName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  streamNameActive: {
    color: '#4A9EFF',
    fontWeight: '600',
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
});

export default LiveStreamScreen;