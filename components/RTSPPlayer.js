import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RTSPPlayer = ({ rtspUrl, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="videocam" size={48} color="#4A9EFF" />
      <Text style={styles.placeholderText}>RTSP Player</Text>
      <Text style={styles.urlText}>{rtspUrl}</Text>
      <Text style={styles.noteText}>Requires development build for VLC player</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  urlText: {
    color: '#8B92A7',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  noteText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default RTSPPlayer;