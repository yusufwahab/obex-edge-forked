import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

class AuthService {
  // Storage keys
  TOKEN_KEY = 'auth_token';
  USER_KEY = 'user_data';

  // Register user
  async register(userData) {
    try {
      const response = await ApiService.register(userData);
      
      if (response.token) {
        await this.saveToken(response.token);
        await this.saveUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await ApiService.login(credentials);
      
      if (response.token) {
        await this.saveToken(response.token);
        await this.saveUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await ApiService.logout();
      await this.clearStorage();
    } catch (error) {
      // Clear local storage even if API call fails
      await this.clearStorage();
      throw error;
    }
  }

  // Save token to storage
  async saveToken(token) {
    await AsyncStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token from storage
  async getToken() {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  // Save user data to storage
  async saveUser(userData) {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // Get user data from storage
  async getUser() {
    const userData = await AsyncStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // Clear all storage
  async clearStorage() {
    await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
  }

  // Get authenticated headers
  async getAuthHeaders() {
    const token = await this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();