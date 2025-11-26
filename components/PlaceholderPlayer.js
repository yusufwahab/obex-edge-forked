import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlaceholderPlayer = ({ rtspUrl, style }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => setIsConnecting(false), 2000);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Ionicons name="videocam" size={48} color="#4A9EFF" />
        <Text style={styles.title}>RTSP Stream Ready</Text>
        <Text style={styles.url}>{rtspUrl}</Text>
        
        <TouchableOpacity 
          style={[styles.button, isConnecting && styles.buttonConnecting]} 
          onPress={handleConnect}
          disabled={isConnecting}
        >
          <Ionicons 
            name={isConnecting ? "sync" : "play"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.buttonText}>
            {isConnecting ? "Connecting..." : "Connect Stream"}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          Requires native build for live streaming
        </Text>
      </View>
      
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>READY</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  url: {
    color: '#4A9EFF',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4A9EFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    marginBottom: 12,
  },
  buttonConnecting: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    color: '#666666',
    fontSize: 10,
    textAlign: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,158,255,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
});

export default PlaceholderPlayer;