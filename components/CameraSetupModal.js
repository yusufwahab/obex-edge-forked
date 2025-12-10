import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraSetupModal = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Add your First Camera',
      description: 'Set up surveillance by adding and configuring your cameras.',
      position: { left: 30, top: 150 },
      tailDirection: 'down'
    },
    {
      title: 'Configure Zones',
      description: 'Define specific monitoring areas and zones for targeted security.',
      position: { left: '50%', top: 500, translateX: -140 },
      tailDirection: 'down'
    },
    {
      title: 'Monitor an Alert',
      description: 'Receive real-time notifications for security events.',
      position: { right: 30, top: 200 },
      tailDirection: 'down'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getModalStyle = () => {
    const step = steps[currentStep];
    const style = {
      position: 'absolute',
      width: 280,
    };

    if (step.position.left !== undefined) {
      style.left = step.position.left;
    }
    if (step.position.right !== undefined) {
      style.right = step.position.right;
    }
    if (step.position.left === '50%') {
      style.left = '50%';
      style.marginLeft = step.position.translateX;
    }
    style.top = step.position.top;

    return style;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, getModalStyle()]}>
          <View style={styles.content}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.description}>{steps[currentStep].description}</Text>
            <Text style={styles.progress}>{currentStep + 1} of {steps.length}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.previousButton,
                currentStep === 0 && styles.buttonDisabled
              ]}
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <Text style={[
                styles.buttonText,
                styles.previousButtonText,
                currentStep === 0 && styles.buttonTextDisabled
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={[styles.buttonText, styles.nextButtonText]}>
                {currentStep === steps.length - 1 ? 'Start' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tail} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 28,
    width: 280,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'left',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 16,
  },
  progress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previousButtonText: {
    color: '#FFFFFF',
  },
  nextButtonText: {
    color: '#000000',
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tail: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderTopColor: 'rgba(40, 40, 40, 0.95)',
  },
});

export default CameraSetupModal;