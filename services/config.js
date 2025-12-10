// API Configuration
export const API_CONFIG = {
  // Base URL - Replace with your actual backend URL
  BASE_URL: 'https://your-backend-url.com/api',
  
  // Alternative URLs for different environments
  DEVELOPMENT_URL: 'http://localhost:3000/api',
  STAGING_URL: 'https://staging-api.obex.com/api',
  PRODUCTION_URL: 'https://api.obex.com/api',
  
  // Request timeout (milliseconds)
  TIMEOUT: 10000,
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    
    // User
    USER_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    
    // Cameras
    CAMERAS: '/cameras',
    ADD_CAMERA: '/cameras',
    DELETE_CAMERA: '/cameras',
    
    // Alerts
    ALERTS: '/alerts',
    MARK_ALERT_READ: '/alerts',
    
    // Analytics
    ANALYTICS: '/analytics',
    
    // Device Health
    DEVICE_HEALTH: '/devices/health',
    
    // RTSP Streaming
    RTSP_STREAM: '/stream/rtsp',
    RTSP_TEST: '/stream/test',
  }
};

// Get current environment URL
export const getCurrentApiUrl = () => {
  // You can implement environment detection logic here
  // For now, return development URL
  return API_CONFIG.DEVELOPMENT_URL;
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};