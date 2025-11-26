import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddCameraModal = ({ visible, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: ''
  });

  const handleComplete = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a camera name');
      return;
    }
    if (!formData.rtspUrl.trim()) {
      Alert.alert('Error', 'Please enter an RTSP URL');
      return;
    }
    if (!formData.rtspUrl.startsWith('rtsp://')) {
      Alert.alert('Error', 'RTSP URL must start with rtsp://');
      return;
    }
    
    onComplete(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      rtspUrl: ''
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#000000', '#404040']}
          locations={[0, 0.5]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Camera</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <Ionicons name="videocam" size={32} color="#4A9EFF" />
                </View>
              </View>

              <Text style={styles.stepTitle}>Add New Camera</Text>
              <Text style={styles.stepSubtitle}>Enter camera details to start streaming</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Camera Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Front Door Camera"
                  placeholderTextColor="#8B92A7"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    name: text
                  }))}
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>RTSP URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="rtsp://admin:password@192.168.1.10:554/stream1"
                  placeholderTextColor="#8B92A7"
                  value={formData.rtspUrl}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    rtspUrl: text
                  }))}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.description}>Enter the complete RTSP URL including credentials and stream path</Text>
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addButton, (!formData.name.trim() || !formData.rtspUrl.trim()) && styles.addButtonDisabled]}
              onPress={handleComplete}
              disabled={!formData.name.trim() || !formData.rtspUrl.trim()}
            >
              <Text style={[styles.addButtonText, (!formData.name.trim() || !formData.rtspUrl.trim()) && styles.addButtonTextDisabled]}>
                Add Camera
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74,158,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8B92A7',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  description: {
    fontSize: 14,
    color: '#8B92A7',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666666',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4A9EFF',
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(74,158,255,0.3)',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#666666',
  },
});

export default AddCameraModal;