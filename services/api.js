// API Configuration
const API_BASE_URL = 'https://obex-edge-backend.onrender.com/api';

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
        throw new Error(data.message || data.detail || 'API request failed');
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
  async register(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        confirmPassword: userData.password,
      }),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
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
  async getAlerts(token) {
    return this.request('/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async markAlertAsRead(alertId, token) {
    return this.request(`/alerts/${alertId}/read`, {
      method: 'PUT',
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