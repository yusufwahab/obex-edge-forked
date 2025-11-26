import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RTSPTester = ({ rtspUrl }) => {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState('untested');

  const testConnection = async () => {
    setTesting(true);
    setStatus('testing');

    try {
      // Extract IP from RTSP URL
      const ipMatch = rtspUrl.match(/rtsp:\/\/.*@([^:]+):/);
      const ip = ipMatch ? ipMatch[1] : null;

      if (!ip) {
        setStatus('error');
        Alert.alert('Error', 'Invalid RTSP URL format');
        setTesting(false);
        return;
      }

      // Simple network test (ping simulation)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        // This won't actually test RTSP but tests if host is reachable
        const response = await fetch(`http://${ip}`, {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        setStatus('reachable');
        Alert.alert('Network Test', `Host ${ip} is reachable. RTSP may work.`);
      } catch (error) {
        clearTimeout(timeoutId);
        setStatus('unreachable');
        Alert.alert('Network Test', `Host ${ip} is not reachable. Check network connection.`);
      }
    } catch (error) {
      setStatus('error');
      Alert.alert('Error', 'Test failed: ' + error.message);
    }

    setTesting(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'reachable': return '#00FF00';
      case 'unreachable': return '#FF6B6B';
      case 'testing': return '#4A9EFF';
      case 'error': return '#FF6B6B';
      default: return '#8B92A7';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'reachable': return 'Host Reachable';
      case 'unreachable': return 'Host Unreachable';
      case 'testing': return 'Testing...';
      case 'error': return 'Test Error';
      default: return 'Not Tested';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={20} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.testButton, testing && styles.testButtonDisabled]}
        onPress={testConnection}
        disabled={testing}
      >
        <Ionicons 
          name={testing ? "refresh" : "play"} 
          size={16} 
          color="#FFFFFF" 
        />
        <Text style={styles.testButtonText}>
          {testing ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.urlText}>{rtspUrl}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  testButtonDisabled: {
    backgroundColor: '#666666',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  urlText: {
    color: '#8B92A7',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default RTSPTester;