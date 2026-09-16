import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

export default function OTPVerification({ navigation, route }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyOTP(email, otpCode);
      Alert.alert('Success', 'Email verified successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await ApiService.generateOTP(email);
      setTimer(60);
      Alert.alert('Success', 'OTP sent to your email');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {email}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, loading && styles.buttonDisabled]} 
              onPress={handleVerifyOTP} 
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={timer > 0 || resendLoading}
                style={styles.resendButton}
              >
                <Text style={[styles.resendButtonText, (timer > 0 || resendLoading) && styles.disabledText]}>
                  {resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
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
  subtitle: {
    fontSize: 14,
    color: '#8B92A7',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#555555',
  },
  verifyButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#8B92A7',
    fontSize: 14,
    marginBottom: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#666666',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#8B92A7',
    fontSize: 14,
  },
});