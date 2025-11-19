import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    if (!fullName || !phoneNumber || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    navigation.navigate('Dashboard');
  };

  return (
    <LinearGradient colors={['#000000', '#404040', '#000000']} locations={[0, 0.5, 1]} style={styles.container}>
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
          <Text style={styles.submitButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.bottomLinkText}>
            Already have an account? <Text style={styles.bottomLinkHighlight}>Login here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1437',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    width: '100%',
    maxWidth: 400,
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
    color: '#4A9EFF',
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
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    height: 50,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#1A2342',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinkText: {
    color: '#8B92A7',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomLinkHighlight: {
    color: '#4A9EFF',
    fontWeight: '500',
  },

});
