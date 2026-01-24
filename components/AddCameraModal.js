import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddCameraModal = ({ visible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    localIP: 'staging.ai.avzdax.com',
    localPort: '557',
    username: 'admin',
    password: 'Admin1234',
    streamPath: '1/1',
    remotePort: '557'
  });
  const [showPassword, setShowPassword] = useState(false);

  const totalSteps = 3;
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.localIP.trim() !== '' && formData.localPort.trim() !== '';
      case 3:
        return formData.username.trim() !== '' && formData.password.trim() !== '' && formData.streamPath.trim() !== '';
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const CameraTunnelService = require('../services/CameraTunnelService').default;
      await CameraTunnelService.addCamera(
        formData.name,
        formData.localIP,
        parseInt(formData.localPort),
        parseInt(formData.remotePort),
        formData.username,
        formData.password,
        formData.streamPath
      );
      
      onComplete && onComplete(formData);
      handleClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add camera');
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      localIP: 'staging.ai.avzdax.com',
      localPort: '557',
      username: 'admin',
      password: 'Admin1234',
      streamPath: '1/1',
      remotePort: '557'
    });
    setShowPassword(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Camera Details</Text>
            <Text style={styles.stepSubtitle}>Enter basic camera information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Camera Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Front Door Camera"
                placeholderTextColor="#8B92A7"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                autoFocus={true}
              />
            </View>
          </>
        );
      
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Network Settings</Text>
            <Text style={styles.stepSubtitle}>Configure camera network details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Local IP Address</Text>
              <TextInput
                style={styles.input}
                placeholder="staging.ai.avzdax.com"
                placeholderTextColor="#8B92A7"
                value={formData.localIP}
                onChangeText={(text) => setFormData(prev => ({ ...prev, localIP: text }))}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Local Port</Text>
              <TextInput
                style={styles.input}
                placeholder="557"
                placeholderTextColor="#8B92A7"
                value={formData.localPort}
                onChangeText={(text) => setFormData(prev => ({ ...prev, localPort: text }))}
                keyboardType="numeric"
              />
            </View>
          </>
        );
      
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Authentication</Text>
            <Text style={styles.stepSubtitle}>Enter camera login credentials</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="admin"
                placeholderTextColor="#8B92A7"
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Admin1234"
                  placeholderTextColor="#8B92A7"
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Stream Path</Text>
              <TextInput
                style={styles.input}
                placeholder="1/1"
                placeholderTextColor="#8B92A7"
                value={formData.streamPath}
                onChangeText={(text) => setFormData(prev => ({ ...prev, streamPath: text }))}
                autoCapitalize="none"
              />
            </View>
          </>
        );
      
      default:
        return null;
    }
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

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={styles.progressStep}>
                <View style={[
                  styles.progressDot,
                  currentStep >= step && styles.progressDotActive
                ]} />
                {step < totalSteps && (
                  <View style={[
                    styles.progressLine,
                    currentStep > step && styles.progressLineActive
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <Ionicons name="videocam" size={32} color="#4A9EFF" />
                </View>
              </View>

              {renderStepContent()}
              
              {/* RTSP Preview */}
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>RTSP URL Preview:</Text>
                <Text style={styles.previewUrl}>
                  {`rtsp://${formData.username}:${formData.password}@${formData.localIP}:${formData.localPort}/${formData.streamPath}`}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.nextButton,
                !validateCurrentStep() && styles.nextButtonDisabled,
                currentStep === 1 && styles.nextButtonFull
              ]}
              onPress={handleNext}
              disabled={!validateCurrentStep()}
            >
              <Text style={[
                styles.nextButtonText,
                !validateCurrentStep() && styles.nextButtonTextDisabled
              ]}>
                {currentStep === totalSteps ? 'Add Camera' : 'Next'}
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
  },
  progressDotActive: {
    backgroundColor: '#4A9EFF',
    borderColor: '#4A9EFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#4A9EFF',
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 16,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 18,
  },
  readOnlyInput: {
    backgroundColor: 'rgba(64,64,64,0.3)',
    color: '#8B92A7',
  },
  helpText: {
    fontSize: 12,
    color: '#8B92A7',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666666',
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4A9EFF',
    marginLeft: 12,
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(74,158,255,0.3)',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
  previewContainer: {
    width: '100%',
    backgroundColor: 'rgba(74,158,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(74,158,255,0.3)',
  },
  previewLabel: {
    color: '#4A9EFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewUrl: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default AddCameraModal;