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

  // User APIs
  async getUserProfile(token) {
    return this.request('/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateProfile(userData, token) {
    return this.request('/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  }

  // Camera APIs
  async getCameras(token) {
    return this.request('/cameras', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async addCamera(cameraData, token) {
    return this.request('/cameras', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cameraData),
    });
  }

  async deleteCamera(cameraId, token) {
    return this.request(`/cameras/${cameraId}`, {
      method: 'DELETE',
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

  // Analytics APIs
  async getAnalytics(token, timeRange = '7d') {
    return this.request(`/analytics?range=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Device Health APIs
  async getDeviceHealth(token) {
    return this.request('/devices/health', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

// Export singleton instance
export default new ApiService();