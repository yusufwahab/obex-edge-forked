import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthService from '../services/auth';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.generateOTP(email);
      if (response.success) {
        setShowOtpInput(true);
        Alert.alert('Success', response.message || 'OTP sent to your email');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.verifyOTP(email, otp);
      if (response.success) {
        Alert.alert('Success', response.message || 'OTP verified successfully', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
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
                Forgot <Text style={styles.titleAccent}>Password</Text>
              </Text>
              <Text style={styles.subtitle}>
                {showOtpInput ? 'Enter the OTP sent to your email' : 'Enter your email to receive OTP'}
              </Text>

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
                    editable={!showOtpInput}
                  />
                </View>
              </View>

              {showOtpInput && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>OTP Code</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="key" size={20} color="#6B7280" style={styles.leftIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#6B7280"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                onPress={showOtpInput ? handleVerifyOTP : handleGenerateOTP} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>

              {showOtpInput && (
                <TouchableOpacity 
                  onPress={handleGenerateOTP}
                  style={styles.resendButton}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => navigation.navigate('SignIn')}
                style={styles.backButton}
              >
                <Text style={styles.bottomLinkText}>
                  Remember your password? <Text style={styles.bottomLinkHighlight}>Sign in here</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
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
    minHeight: 500,
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
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '500',
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
  backButton: {
    width: 212,
    height: 36,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
  }
});