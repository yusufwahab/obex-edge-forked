import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCameraDiscovery } from '../hooks/useCameraDiscovery';
import { verifyCamera } from '../services/onvif/onvifClient';
import ApiService from '../services/api';
import AuthService from '../services/auth';

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const TOTAL_STEPS = 4;

const ERROR_MESSAGES = {
  unreachable: 'Camera unreachable — check the IP address and that your phone is on the same Wi-Fi network.',
  unauthorized: 'Incorrect ONVIF username or password.',
  unsupported: "This camera's ONVIF profile isn't supported (Profile S / Media1 only).",
};

const AddCameraScreen = ({ navigation }) => {
  const { devices, isScanning, error: scanError, startScan } = useCameraDiscovery();

  const [step, setStep] = useState(1);
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('80');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [edgeDeviceId, setEdgeDeviceId] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    startScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDevice = (device) => {
    setIp(device.ip);
    setPort(String(device.port));
    setStep(3);
  };

  const goManualEntry = () => setStep(2);

  const validateIp = () => IPV4_REGEX.test(ip.trim());

  const validateCredentials = () =>
    name.trim() !== '' && edgeDeviceId.trim() !== '' && username.trim() !== '' && password.trim() !== '';

  const runVerify = async () => {
    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    try {
      const result = await verifyCamera({
        ip: ip.trim(),
        onvifPort: parseInt(port, 10) || 80,
        username: username.trim(),
        password,
      });
      setVerifyResult(result);
    } catch (e) {
      setVerifyError(e.type ? e : { type: 'unreachable', message: e.message });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (step === 4 && !verifyResult && !verifying && !verifyError) {
      runVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AuthService.getToken();
      await ApiService.addCamera(
        {
          name: name.trim(),
          locationId: location.trim(),
          edgeDeviceId: edgeDeviceId.trim(),
          ip: ip.trim(),
          onvifPort: parseInt(port, 10) || 80,
          username: username.trim(),
          password,
          rtspPath: verifyResult.path,
          localPort: verifyResult.rtspPort,
          profileToken: verifyResult.profileToken,
        },
        token
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', e.message || 'Could not save this camera');
    } finally {
      setSaving(false);
    }
  };

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} style={styles.progressStep}>
          <View style={[styles.progressDot, step >= i + 1 && styles.progressDotActive]} />
          {i < TOTAL_STEPS - 1 && (
            <View style={[styles.progressLine, step > i + 1 && styles.progressLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderDiscoverStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Find your camera</Text>
      <Text style={styles.stepSubtitle}>
        Make sure your phone is on the same Wi-Fi network as the camera.
      </Text>

      {isScanning && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A9EFF" />
          <Text style={styles.helperText}>Scanning for ONVIF cameras…</Text>
        </View>
      )}

      {!isScanning && scanError && (
        <Text style={styles.errorText}>{scanError}</Text>
      )}

      {!isScanning && devices.length === 0 && !scanError && (
        <Text style={styles.helperText}>No cameras found on this network.</Text>
      )}

      {!isScanning &&
        devices.map((device) => (
          <TouchableOpacity
            key={`${device.ip}:${device.port}`}
            style={styles.deviceRow}
            onPress={() => selectDevice(device)}
          >
            <Ionicons name="videocam" size={20} color="#4A9EFF" />
            <View style={styles.deviceRowText}>
              <Text style={styles.deviceIp}>{device.ip}</Text>
              <Text style={styles.deviceMeta}>Port {device.port}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8B92A7" />
          </TouchableOpacity>
        ))}

      {!isScanning && (
        <TouchableOpacity style={styles.secondaryButton} onPress={startScan}>
          <Text style={styles.secondaryButtonText}>Rescan</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={goManualEntry}>
        <Text style={styles.secondaryButtonText}>Enter IP Manually</Text>
      </TouchableOpacity>
    </View>
  );

  const renderManualStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Camera Address</Text>
      <Text style={styles.stepSubtitle}>Enter the camera's IP address and ONVIF port.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>IP Address</Text>
        <TextInput
          style={styles.input}
          placeholder="192.168.1.42"
          placeholderTextColor="#8B92A7"
          value={ip}
          onChangeText={setIp}
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ONVIF Port</Text>
        <TextInput
          style={styles.input}
          placeholder="80"
          placeholderTextColor="#8B92A7"
          value={port}
          onChangeText={setPort}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderCredentialsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Camera Details</Text>
      <Text style={styles.stepSubtitle}>Name this camera and enter its ONVIF login.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Camera Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Front Door Camera"
          placeholderTextColor="#8B92A7"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Main Entrance"
          placeholderTextColor="#8B92A7"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Edge Device ID</Text>
        <TextInput
          style={styles.input}
          placeholder="ID of the paired relay device"
          placeholderTextColor="#8B92A7"
          value={edgeDeviceId}
          onChangeText={setEdgeDeviceId}
          autoCapitalize="none"
        />
        {/* TODO(edge-device-pairing): replace with a device picker once GET /devices exists. */}
        <Text style={styles.helpText}>Ask your installer for this ID if you don't have it yet.</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="admin"
          placeholderTextColor="#8B92A7"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8B92A7"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Verify Camera</Text>

      {verifying && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A9EFF" />
          <Text style={styles.helperText}>Connecting to camera…</Text>
        </View>
      )}

      {!verifying && verifyError && (
        <View>
          <Text style={styles.errorText}>
            {ERROR_MESSAGES[verifyError.type] || verifyError.message}
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={runVerify}>
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(3)}>
            <Text style={styles.secondaryButtonText}>Back to Credentials</Text>
          </TouchableOpacity>
        </View>
      )}

      {!verifying && verifyResult && (
        <View>
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Resolved RTSP Stream</Text>
            <Text style={styles.previewUrl}>{verifyResult.rtspUrl}</Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Camera</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const canGoNext = () => {
    if (step === 2) return validateIp();
    if (step === 3) return validateCredentials();
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#000000', '#404040']} locations={[0, 0.5]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Camera</Text>
          <View style={styles.placeholder} />
        </View>

        {renderProgressDots()}

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && renderDiscoverStep()}
          {step === 2 && renderManualStep()}
          {step === 3 && renderCredentialsStep()}
          {step === 4 && renderVerifyStep()}
        </ScrollView>

        {(step === 2 || step === 3) && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !canGoNext() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canGoNext()}
            >
              <Text
                style={[styles.nextButtonText, !canGoNext() && styles.nextButtonTextDisabled]}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: { padding: 8 },
  headerTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
  placeholder: { width: 40 },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  progressStep: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
  },
  progressDotActive: { backgroundColor: '#4A9EFF', borderColor: '#4A9EFF' },
  progressLine: { width: 32, height: 2, backgroundColor: '#333333', marginHorizontal: 6 },
  progressLineActive: { backgroundColor: '#4A9EFF' },
  scrollContent: { flex: 1 },
  stepContent: { paddingHorizontal: 16, paddingBottom: 24 },
  stepTitle: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#8B92A7', marginBottom: 24 },
  centered: { alignItems: 'center', paddingVertical: 40 },
  helperText: { color: '#8B92A7', fontSize: 14, marginTop: 12, textAlign: 'center' },
  errorText: { color: '#FF6B6B', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  deviceRowText: { flex: 1, marginLeft: 12 },
  deviceIp: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  deviceMeta: { color: '#8B92A7', fontSize: 12, marginTop: 2 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  inputContainer: { width: '100%', marginBottom: 20 },
  inputLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  helpText: { fontSize: 12, color: '#8B92A7', marginTop: 4, fontStyle: 'italic' },
  previewContainer: {
    backgroundColor: 'rgba(74,158,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(74,158,255,0.3)',
  },
  previewLabel: { color: '#4A9EFF', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  previewUrl: { color: '#FFFFFF', fontSize: 12, fontFamily: 'monospace', lineHeight: 16 },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#666666',
  },
  backButtonText: { color: '#666666', fontSize: 16, fontWeight: '500' },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4A9EFF',
    marginLeft: 12,
  },
  nextButtonDisabled: { backgroundColor: 'rgba(74,158,255,0.3)' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  nextButtonTextDisabled: { color: '#666666' },
});

export default AddCameraScreen;
