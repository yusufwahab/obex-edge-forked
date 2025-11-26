import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const SimpleRTSPPlayer = ({ rtspUrl, style, autoplay = true, showControls = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleReconnect = () => {
    setIsLoading(true);
    setHasError(false);
  };

  if (hasError) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Stream Unavailable</Text>
        <TouchableOpacity style={styles.reconnectButton} onPress={handleReconnect}>
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        style={styles.player}
        source={{ uri: rtspUrl }}
        shouldPlay={autoplay}
        isLooping={false}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
        useNativeControls={showControls}
      />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A9EFF" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  player: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    marginTop: 12,
    marginBottom: 16,
  },
  reconnectButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reconnectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleRTSPPlayer;