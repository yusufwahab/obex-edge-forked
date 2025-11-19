import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddCameraModal = ({ visible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cameraName: '',
    location: '',
    ipAddress: '',
    password: ''
  });

  const steps = [
    {
      title: 'Camera Name',
      subtitle: 'Give your camera a recognizable name',
      field: 'cameraName',
      placeholder: 'e.g., Front Door Camera',
      icon: 'videocam',
      description: 'Choose a name that helps you identify this camera easily'
    },
    {
      title: 'Location',
      subtitle: 'Where is this camera located?',
      field: 'location',
      placeholder: 'e.g., Living Room, Garden',
      icon: 'location',
      description: 'This helps organize your cameras by area'
    },
    {
      title: 'IP Address',
      subtitle: 'Enter the camera\'s network address',
      field: 'ipAddress',
      placeholder: 'e.g., 192.168.1.100',
      icon: 'globe',
      description: 'Find this in your camera settings or router admin panel'
    },
    {
      title: 'Password',
      subtitle: 'Enter the camera access password',
      field: 'password',
      placeholder: 'Camera password',
      icon: 'lock-closed',
      description: 'This is usually found on the camera label or manual',
      secure: true
    }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      cameraName: '',
      location: '',
      ipAddress: '',
      password: ''
    });
    onClose();
  };

  const isCurrentStepValid = () => {
    return formData[currentStepData.field]?.trim().length > 0;
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
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / steps.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of {steps.length}</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <Ionicons name={currentStepData.icon} size={32} color="#4A9EFF" />
                </View>
              </View>

              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={currentStepData.placeholder}
                  placeholderTextColor="#8B92A7"
                  value={formData[currentStepData.field]}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    [currentStepData.field]: text
                  }))}
                  secureTextEntry={currentStepData.secure}
                  autoFocus={true}
                />
              </View>

              <Text style={styles.description}>{currentStepData.description}</Text>
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.nextButton, !isCurrentStepValid() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!isCurrentStepValid()}
            >
              <Text style={[styles.nextButtonText, !isCurrentStepValid() && styles.nextButtonTextDisabled]}>
                {currentStep === steps.length ? 'Add Camera' : 'Next'}
              </Text>
              {currentStep < steps.length && (
                <Ionicons name="chevron-forward" size={20} color={isCurrentStepValid() ? "#000000" : "#666666"} />
              )}
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
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A9EFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#8B92A7',
    fontSize: 14,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#999999',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
});

export default AddCameraModal;