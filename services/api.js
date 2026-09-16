// API Configuration
const API_BASE_URL = 'https://obex-edge-backend.onrender.com';

// API Service Class
class ApiService {
  // Base request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API Request:', url);
      console.log('API Config:', config);
      
      const response = await fetch(url, config);
      console.log('API Response Status:', response.status);
      
      const data = await response.json();
      console.log('API Response Data:', data);
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || 'API request failed';
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('API Error Details:', {
        message: error.message,
        url,
        endpoint,
      });
      throw error;
    }
  }

  // Authentication APIs
  async signup(userData) {
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async generateOTP(email) {
    return this.request('/api/v1/auth/otp/generate', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email, otp) {
    return this.request('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async getUserById(userId, token) {
    return this.request(`/api/v1/auth/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Camera APIs — matches the live OpenAPI schema at /openapi.json (CameraCreate/
  // CameraUpdate/CameraData). Note: the real backend has no locationId, edgeDeviceId,
  // onvifPort, profileToken, or local/remote URL split — see AddCameraScreen.js for
  // what's actually sent, and the integration gap report for what's missing.
  async getCameras(token, userOnly = false, limit = 50, offset = 0) {
    return this.request(`/api/v1/cameras/?user_only=${userOnly}&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getCameraById(cameraId, token) {
    return this.request(`/api/v1/cameras/${cameraId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // cameraData: { cameraName, ipAddress, username, password, port, path }
  async addCamera(cameraData, token) {
    return this.request('/api/v1/cameras/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cameraData),
    });
  }

  async updateCamera(cameraId, cameraData, token) {
    return this.request(`/api/v1/cameras/${cameraId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cameraData),
    });
  }

  async deleteCamera(cameraId, token) {
    return this.request(`/api/v1/cameras/${cameraId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Device APIs — these are VEHICLE devices (deviceId, vehicleMake, vehicleModel) per
  // the live schema, not edge/relay devices. Not currently wired to any screen — see
  // the integration gap report.
  async registerDevice(deviceData, token) {
    return this.request('/api/v1/devices/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
    });
  }

  async getDevices(token, userOnly = false, limit = 50, offset = 0) {
    return this.request(`/api/v1/devices/?user_only=${userOnly}&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Alerts APIs
  async getRecentAlerts(token, userOnly = false, limit = 50, offset = 0) {
    return this.request(`/api/v1/alerts/recent?user_only=${userOnly}&limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAlertStats(token) {
    return this.request('/api/v1/alerts/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAlertById(alertId, token) {
    return this.request(`/api/v1/alerts/${alertId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAlertsByType(alertType, token, limit = 100, offset = 0) {
    return this.request(`/api/v1/alerts/type/${alertType}?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async deleteAlert(alertId, token) {
    return this.request(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Alert supported types (used to drive UI without hardcoding alert type strings)
  async getSupportedAlertTypes() {
    return this.request('/api/v1/alerts/supported-types');
  }
}

// Export singleton instance
export default new ApiService();