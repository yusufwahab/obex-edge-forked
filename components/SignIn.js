import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CameraSetupModal from './CameraSetupModal';
import AuthService from '../services/auth';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCameraSetup, setShowCameraSetup] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      Alert.alert('Success', 'Login successful!');
      setShowCameraSetup(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#999999', 'transparent', '#999999']}
          locations={[0, 0.5, 1]}
          style={styles.borderGradient}
        >
        <View style={styles.cardContainer}>
        <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../obex-logo-joined.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>
          Welcome <Text style={styles.titleAccent}>Back</Text>
        </Text>
        <Text style={styles.subtitle}>Sign in to your OBEX account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Input Email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Input Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSignIn} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            console.log('Signup button pressed');
            navigation.navigate('SignUp');
          }}
          style={styles.signupLinkButton}
        >
          <Text style={styles.bottomLinkText}>
            Don't have an account? <Text style={styles.bottomLinkHighlight}>Sign up here</Text>
          </Text>
        </TouchableOpacity>
        </View>
        </View>
        </LinearGradient>
        
        <CameraSetupModal 
          visible={showCameraSetup}
          onClose={() => {
            setShowCameraSetup(false);
            navigation.navigate('Dashboard');
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  borderGradient: {
    borderRadius: 30,
    padding: 1,
  },
  cardContainer: {
    backgroundColor: '#262626',
    borderRadius: 30,
    padding: 24,
    width: 321,
    height: 540,
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  titleAccent: {
    color: '#2F80ED',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B92A7',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 0,
    height: 48,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    width: 211,
    height: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
    padding: 10,
    shadowColor: '#F9FAFB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinkText: {
    color: '#8B92A7',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 12,
  },
  bottomLinkHighlight: {
    color: '#4A9EFF',
    fontWeight: '400',
  },
  signupLinkButton: {
    width: 212,
    height: 36,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
  }
});
