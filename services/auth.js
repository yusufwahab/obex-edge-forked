import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

class AuthService {
  // Storage keys
  TOKEN_KEY = 'auth_token';
  USER_KEY = 'user_data';
  ORG_KEY = 'organization_id';

  // Register user
  async register(userData) {
    try {
      const signupPayload = {
        username: userData.username || userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
        role: userData.role || "user",
        isAdmin: userData.isAdmin || false,
        ...(userData.organizationName && { organizationName: userData.organizationName }),
        ...(userData.organizationId && { organizationId: userData.organizationId }),
        ...(userData.companyRole && { companyRole: userData.companyRole })
      };
      
      console.log('AuthService sending:', signupPayload);
      const response = await ApiService.signup(signupPayload);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await ApiService.login(credentials);
      
      if (response.access_token) {
        await this.saveToken(response.access_token);
        await this.saveUserId(response.user_id);
        await this.saveOrganizationId(response.organization_id);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generate OTP
  async generateOTP(email) {
    try {
      return await ApiService.generateOTP(email);
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      return await ApiService.verifyOTP(email, otp);
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await this.clearStorage();
    } catch (error) {
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

  // Save user ID
  async saveUserId(userId) {
    await AsyncStorage.setItem('user_id', userId);
  }

  // Save organization ID
  async saveOrganizationId(orgId) {
    await AsyncStorage.setItem(this.ORG_KEY, orgId);
  }

  // Get user profile with full details
  async getUserProfile() {
    try {
      const token = await this.getToken();
      const userId = await this.getUserId();
      
      if (!token || !userId) {
        throw new Error('No authentication data found');
      }
      
      const userProfile = await ApiService.getUserById(userId, token);
      await this.saveUser(userProfile);
      return userProfile;
    } catch (error) {
      throw error;
    }
  }

  // Get user data from storage
  async getUser() {
    const userData = await AsyncStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Get user ID
  async getUserId() {
    return await AsyncStorage.getItem('user_id');
  }

  // Get organization ID
  async getOrganizationId() {
    return await AsyncStorage.getItem(this.ORG_KEY);
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  // Clear all storage
  async clearStorage() {
    await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY, this.ORG_KEY, 'user_id']);
  }

  // Get authenticated headers
  async getAuthHeaders() {
    const token = await this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();