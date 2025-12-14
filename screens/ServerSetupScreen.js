import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraTunnelService from '../services/CameraTunnelService';

const ServerSetupScreen = ({ navigation }) => {
  const [serverAddr, setServerAddr] = useState('staging.ai.avzdax.com');
  const [serverPort, setServerPort] = useState('7000');
  const [token, setToken] = useState('30PWz5yr0zf7lUALdMauzcxsHs5_3y1BfJdrVJVV8aVAzteNf');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    setLoading(true);
    try {
      const config = await CameraTunnelService.loadFRPSConfig();
      if (config) {
        setServerAddr(config.serverAddr);
        setServerPort(config.serverPort.toString());
        setToken(config.token);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const config = {
      serverAddr: serverAddr.trim(),
      serverPort: parseInt(serverPort),
      token: token.trim()
    };

    const validation = CameraTunnelService.validateFRPSConfig(config);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      const success = await CameraTunnelService.saveFRPSConfig(
        config.serverAddr,
        config.serverPort,
        config.token
      );

      if (success) {
        Alert.alert(
          'Success',
          'FRPS server configuration saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save configuration');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    // Simple validation test
    const config = {
      serverAddr: serverAddr.trim(),
      serverPort: parseInt(serverPort),
      token: token.trim()
    };

    const validation = CameraTunnelService.validateFRPSConfig(config);
    if (validation.valid) {
      Alert.alert('Validation', 'Configuration looks valid!');
    } else {
      Alert.alert('Validation Error', validation.errors.join('\n'));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FRPS Server Setup</Text>
        <Text style={styles.subtitle}>
          Configure your FRPS server details to enable remote camera access
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={serverAddr}
            editable={false}
            placeholder="my-server.com or 192.168.1.100"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Your FRPS server domain or IP address
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Server Port</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={serverPort}
            editable={false}
            placeholder="7000"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            FRPS server port (default: 7000)
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Authentication Token</Text>
          <View style={styles.tokenInputContainer}>
            <TextInput
              style={[styles.tokenInput, styles.readOnlyInput]}
              value={token}
              editable={false}
              placeholder="your_secure_token_123"
              placeholderTextColor="#666"
              secureTextEntry={!showToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowToken(!showToken)}
            >
              <Ionicons
                name={showToken ? 'eye-off' : 'eye'}
                size={20}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Secure token for FRPS authentication
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTest}
        >
          <Text style={styles.testButtonText}>Test Configuration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Setup Instructions:</Text>
        <Text style={styles.infoText}>
          1. Deploy FRPS server on your VPS/cloud server{'\n'}
          2. Configure FRPS with the same token{'\n'}
          3. Ensure server port is open in firewall{'\n'}
          4. Enter server details above and save
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 10,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  tokenInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tokenInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOnlyInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonContainer: {
    margin: 15,
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    margin: 15,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});

export default ServerSetupScreen;