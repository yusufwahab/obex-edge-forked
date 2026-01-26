import ApiService from './api';
import AuthService from './auth';

class AlertService {
  constructor() {
    this.alertListeners = [];
    this.pollingInterval = null;
    this.lastAlertCheck = new Date();
  }

  // Add listener for new alerts
  addAlertListener(callback) {
    this.alertListeners.push(callback);
  }

  // Remove listener
  removeAlertListener(callback) {
    this.alertListeners = this.alertListeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of new alert
  notifyListeners(alert) {
    this.alertListeners.forEach(callback => callback(alert));
  }

  // Start polling for new alerts
  async startAlertPolling(intervalMs = 5000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewAlerts();
      } catch (error) {
        console.error('Alert polling error:', error);
      }
    }, intervalMs);
  }

  // Stop polling
  stopAlertPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for new alerts since last check
  async checkForNewAlerts() {
    try {
      const token = await AuthService.getToken();
      if (!token) return;

      const response = await ApiService.getRecentAlerts(token, false, 10, 0);
      
      if (response.data && response.data.length > 0) {
        // Filter alerts newer than last check
        const newAlerts = response.data.filter(alert => {
          const alertTime = new Date(alert.created_at || alert.timestamp);
          return alertTime > this.lastAlertCheck;
        });

        // Notify listeners of new alerts
        newAlerts.forEach(alert => {
          this.notifyListeners(this.formatAlert(alert));
        });

        if (newAlerts.length > 0) {
          this.lastAlertCheck = new Date();
        }
      }
    } catch (error) {
      console.error('Error checking for new alerts:', error);
    }
  }

  // Format alert data for the modal
  formatAlert(alertData) {
    const alertType = this.getAlertType(alertData.alert_type);
    
    return {
      id: alertData.id || alertData.alert_id,
      type: alertType,
      title: this.getAlertTitle(alertType),
      description: alertData.alert_data?.description || this.getAlertDescription(alertType),
      confidence: alertData.alert_data?.confidence || 0.95,
      timestamp: alertData.created_at || alertData.timestamp,
      deviceId: alertData.device_id,
      location: alertData.alert_data?.location || 'Unknown location',
      videoUrl: alertData.alert_data?.video_url,
      rawData: alertData
    };
  }

  // Map API alert types to modal types
  getAlertType(apiAlertType) {
    const typeMap = {
      'face_detection_alert': 'aggression',
      'weapon_detection_alert': 'weapon',
      'fatigue_detection_alert': 'fatigue',
      'aggression_detection_alert': 'aggression'
    };
    return typeMap[apiAlertType] || 'aggression';
  }

  // Get alert title based on type
  getAlertTitle(type) {
    const titles = {
      'weapon': 'Weapon Detection',
      'fatigue': 'Fatigue Detection',
      'aggression': 'Aggression Detected'
    };
    return titles[type] || 'Security Alert';
  }

  // Get alert description based on type
  getAlertDescription(type) {
    const descriptions = {
      'weapon': 'Suspicious weapon-like object identified in monitored area.',
      'fatigue': 'Signs of drowsiness or fatigue detected in subject behavior.',
      'aggression': 'Aggressive behavior patterns identified in monitored subject.'
    };
    return descriptions[type] || 'Security threat detected in monitored area.';
  }

  // Get recent alerts
  async getRecentAlerts(limit = 50, offset = 0) {
    try {
      const token = await AuthService.getToken();
      if (!token) throw new Error('No authentication token');

      return await ApiService.getRecentAlerts(token, false, limit, offset);
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      throw error;
    }
  }

  // Get alert statistics
  async getAlertStats() {
    try {
      const token = await AuthService.getToken();
      if (!token) throw new Error('No authentication token');

      return await ApiService.getAlertStats(token);
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      throw error;
    }
  }

  // Delete alert
  async deleteAlert(alertId) {
    try {
      const token = await AuthService.getToken();
      if (!token) throw new Error('No authentication token');

      return await ApiService.deleteAlert(alertId, token);
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  // Simulate alert for testing
  simulateAlert(type = 'weapon') {
    const mockAlert = {
      id: `mock_${Date.now()}`,
      type,
      title: this.getAlertTitle(type),
      description: this.getAlertDescription(type),
      confidence: 0.96,
      timestamp: new Date().toISOString(),
      deviceId: 'camera-001',
      location: 'Security checkpoint',
      videoUrl: null,
      rawData: {
        alert_type: `${type}_detection_alert`,
        device_id: 'camera-001',
        alert_data: {
          confidence: 0.96,
          inference_type: `${type}_detection`
        }
      }
    };

    this.notifyListeners(mockAlert);
    return mockAlert;
  }
}

export default new AlertService();