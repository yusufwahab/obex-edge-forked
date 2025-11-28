import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CameraSetupModal = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to OBEX!',
      subtitle: 'Let\'s set up your first camera',
      description: 'Follow these simple steps to connect your security camera and start monitoring your space.',
      image: require('../Camera-img.png'),
      icon: 'videocam'
    },
    {
      title: 'Connect to WiFi',
      subtitle: 'Same Network Required',
      description: 'Make sure your phone and camera are connected to the same WiFi network. This is essential for RTSP streaming.',
      image: require('../Configure_Zones.png'),
      icon: 'wifi'
    },
    {
      title: 'Find Camera IP',
      subtitle: 'Check Router Settings',
      description: 'Look in your router\'s admin panel or use a network scanner app to find your camera\'s IP address.',
      image: require('../Dashboard_Icons.png'),
      icon: 'search'
    },
    {
      title: 'Add Camera',
      subtitle: 'Tap the + Button',
      description: 'In the dashboard, tap "Add" to create a new camera connection. Enter your camera\'s RTSP URL.',
      image: require('../Add_Camera.png'),
      icon: 'add-circle'
    },
    {
      title: 'You\'re All Set!',
      subtitle: 'Start Monitoring',
      description: 'Your camera is now connected. You can view live streams, receive alerts, and monitor your space 24/7.',
      image: require('../Monitor_Alerts.png'),
      icon: 'checkmark-circle'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient colors={['#000000', '#404040', '#000000']} locations={[0, 0.5, 1]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name={steps[currentStep].icon} size={48} color="#4A9EFF" />
            </View>

            <View style={styles.imageContainer}>
              <Image source={steps[currentStep].image} style={styles.image} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{steps[currentStep].title}</Text>
              <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
              <Text style={styles.description}>{steps[currentStep].description}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomSection}>
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep ? styles.progressDotActive : styles.progressDotInactive
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1437',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#4A9EFF',
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#4A9EFF',
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#8B92A7',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CameraSetupModal;