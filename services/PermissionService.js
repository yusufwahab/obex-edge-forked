import { PermissionsAndroid, Platform, Alert } from 'react-native';

class PermissionService {
  
  async requestAllPermissions() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        console.log('✅ All permissions granted');
        return true;
      } else {
        console.log('❌ Some permissions denied');
        this.showPermissionAlert();
        return false;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }

  showPermissionAlert() {
    Alert.alert(
      'Permissions Required',
      'Camera and microphone permissions are required for RTSP streaming functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => this.openAppSettings() }
      ]
    );
  }

  async openAppSettings() {
    try {
      const { Linking } = require('react-native');
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }

  async requestBatteryOptimization() {
    // This would require native implementation
    console.log('💡 Battery optimization should be disabled for best performance');
    return true;
  }
}

export default new PermissionService();