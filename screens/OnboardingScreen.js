import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const screens = [
    {
      title: 'Welcome to',
      subtitle: 'OBEX',
      featureTitle: 'Real-time Alerts',
      description: "OBEX ensures you don\'t just watch events unfold, you act on them the moment they happen.",
      image: require('../Obex_Shield.png')
    }
  ];

  const handleNext = () => {
    console.log('Get Started pressed');
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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{screens[currentStep].title}</Text>
          <Text style={styles.subtitle}>{screens[currentStep].subtitle}</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image source={screens[currentStep].image} style={styles.image} />
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.featureTitle}>{screens[currentStep].featureTitle}</Text>
          <Text style={styles.description}>{screens[currentStep].description}</Text>
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

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.loginButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
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
    minHeight: '100vh',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#2F80ED',
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
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
  nextButton: {
    width: 243,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    alignSelf: 'center',
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    cursor: 'pointer',
  },
  loginButtonText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OnboardingScreen;