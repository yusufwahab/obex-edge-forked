import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const screens = [
    {
      title: 'Welcome to',
      subtitle: 'OBEX Mobile App',
      description: '',
      image: require('../Obex_Shield.png')
    },
    {
      title: 'Real-time',
      subtitle: 'Alerts',
      description: 'OBEX ensures you don\'t just watch events unfold, you act on them the moment they happen.',
      image: require('../Phone_Alerts 1.png')
    },
    {
      title: 'Activity',
      subtitle: 'Timeline',
      description: 'See what happened, when it happened, and how OBEX responded all in a clean, visual interface.',
      image: require('../Activity_Timeline 1.png')
    },
    {
      title: 'Smart Video',
      subtitle: 'Playback',
      description: 'OBEX highlights key events and activities so you can quickly review what matters most.',
      image: require('../Camera-img.png')
    },
    {
      title: 'Predictive',
      subtitle: 'Intelligence',
      description: 'OBEX\'s AI learns patterns in your space, predicts potential risks, and warns you before incidents escalate.',
      image: require('../Dashboard_Icons.png')
    }
  ];

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.navigate('SignUp');
    }
  };

  const handleSkip = () => {
    navigation.navigate('SignUp');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient colors={['#000000', '#404040', '#000000']} locations={[0, 0.5, 1]} style={styles.container}>
      {currentStep > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={screens[currentStep].image} style={styles.image} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{screens[currentStep].title}</Text>
          <Text style={styles.subtitle}>{screens[currentStep].subtitle}</Text>
          {screens[currentStep].description ? (
            <Text style={styles.description}>{screens[currentStep].description}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.progressContainer}>
          {screens.map((_, index) => (
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
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === screens.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1437',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    color: '#4A9EFF',
    fontWeight: '600',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 0,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  progressDotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  nextButtonText: {
    color: '#0A1128',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 0,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingScreen;