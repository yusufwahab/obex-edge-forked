import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CameraSetupModal from './CameraSetupModal';
import AuthService from '../services/auth';

export default function SignUp({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !phoneNumber || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.register({
        fullName,
        phoneNumber,
        email,
        password,
      });

      Alert.alert('Success', 'Account created successfully!');
      setShowCameraSetup(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraSetupClose = () => {
    setShowCameraSetup(false);
    navigation.navigate('Dashboard');
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
          Create <Text style={styles.titleAccent}>Account</Text>
        </Text>
        <Text style={styles.subtitle}>Join OBEX for full security</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Input Name"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number (digits only)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call" size={20} color="#6B7280" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Input Phone Number"
              placeholderTextColor="#6B7280"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

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

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            console.log('Login button pressed');
            navigation.navigate('SignIn');
          }}
          style={styles.loginLinkButton}
        >
          <Text style={styles.bottomLinkText}>
            Already have an account? <Text style={styles.bottomLinkHighlight}>Login here</Text>
          </Text>
        </TouchableOpacity>
        </View>
        </View>
        </LinearGradient>
        
        <CameraSetupModal 
          visible={showCameraSetup}
          onClose={handleCameraSetupClose}
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
    height: 677,
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
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
    height: 47,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
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
    fontSize: 14,
    textAlign: 'center',
  },
  bottomLinkHighlight: {
    color: '#4A9EFF',
    fontWeight: '500',
  },
  loginLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  }
});
