import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let VLCPlayer;
try {
  VLCPlayer = require('react-native-vlc-media-player').VLCPlayer;
  console.log('VLC Player imported successfully');
} catch (error) {
  console.error('VLC Player import failed:', error);
  VLCPlayer = null;
}

const RTSPPlayer = ({ rtspUrl, style, onError, onLoad, showControls = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const vlcRef = useRef(null);

  const handleLoadStart = () => {
    console.log('VLC Player: Load started for URL:', rtspUrl);
    setLoading(true);
    setError(null);
  };

  const handleLoad = (data) => {
    console.log('VLC Player: Stream loaded successfully:', data);
    setLoading(false);
    setError(null);
    setIsPlaying(true);
    onLoad && onLoad(data);
  };
  
  const handlePlaying = () => {
    console.log('VLC Player: Stream is playing');
    setLoading(false);
    setError(null);
    setIsPlaying(true);
  };
  
  const handleBuffering = () => {
    console.log('VLC Player: Stream buffering');
    // Don't show loading during normal buffering
    // setLoading(true);
  };

  const handleError = (error) => {
    console.error('VLC Player Error:', error);
    console.error('Failed URL:', rtspUrl);
    setLoading(false);
    setError('Failed to load stream');
    onError && onError(error);
  };

  useEffect(() => {
    console.log('RTSPPlayer mounted with URL:', rtspUrl);
    console.log('VLC Player available:', !!VLCPlayer);
    
    const handleAppStateChange = (nextAppState) => {
      console.log('App state changed to:', nextAppState);
      setIsActive(nextAppState === 'active');
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [rtspUrl]);

  if (!VLCPlayer) {
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>VLC Player not available</Text>
        <Text style={styles.urlText}>Requires development build</Text>
      </View>
    );
  }

  if (!rtspUrl) {
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="videocam-outline" size={48} color="#666" />
        <Text style={styles.placeholderText}>No Stream URL</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoWrapper}>
        {isActive && (
          <VLCPlayer
            ref={vlcRef}
            source={{ 
              uri: rtspUrl,
              initOptions: [
                '--network-caching=150',
                '--rtsp-caching=150',
                '--no-audio',
                '--intf=dummy',
                '--extraintf=http',
                '--rtsp-tcp'
              ]
            }}
            autoplay={true}
            style={styles.player}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onPlaying={handlePlaying}
            onBuffering={handleBuffering}
            onError={handleError}
            paused={!isActive}
            bufferConfig={{
              minBufferMs: 500,
              maxBufferMs: 2000,
              bufferForPlaybackMs: 250,
              bufferForPlaybackAfterRebufferMs: 500
            }}
          />
        )}
      </View>
      
      {loading && !isPlaying && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A9EFF" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}
      
      
      {error && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.urlText}>{rtspUrl}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 200,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  player: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  urlText: {
    color: '#999',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RTSPPlayer;