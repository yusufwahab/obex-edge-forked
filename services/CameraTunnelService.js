import { NativeModules, NativeEventEmitter, DeviceEventEmitter } from 'react-native';
import StorageService from './StorageService';

const { FRPCModule } = NativeModules;

class CameraTunnelService {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(FRPCModule);
    this.logCallbacks = [];
    this.statusCallbacks = [];
    
    // Listen to FRPC events
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    DeviceEventEmitter.addListener('FRPCLog', (data) => {
      this.logCallbacks.forEach(callback => callback(data.log));
    });
    
    DeviceEventEmitter.addListener('FRPCExit', (data) => {
      this.statusCallbacks.forEach(callback => callback({
        status: 'stopped',
        exitCode: data.exitCode
      }));
    });
  }
  
  // FRPS Server Configuration
  async saveFRPSConfig(serverAddr, serverPort, token) {
    const config = {
      serverAddr: serverAddr.trim(),
      serverPort: parseInt(serverPort),
      token: token.trim()
    };
    
    return await StorageService.saveFRPSConfig(config);
  }
  
  async loadFRPSConfig() {
    return await StorageService.loadFRPSConfig();
  }
  
  // Camera Management
  async addCamera(name, localIP, localPort, remotePort) {
    const cameras = await StorageService.loadCameras();
    
    // Validate port conflicts
    const portValidation = this.validatePort(remotePort, cameras);
    if (!portValidation.valid) {
      throw new Error(portValidation.isDuplicate ? 
        'Port already in use' : 'Port outside valid range (500-65535)');
    }
    
    const camera = {
      name: name.trim(),
      localIP: localIP.trim(),
      localPort: parseInt(localPort) || 554,
      remotePort: parseInt(remotePort),
      enabled: true
    };
    
    return await StorageService.addCamera(camera);
  }
  
  async removeCamera(cameraId) {
    return await StorageService.removeCamera(cameraId);
  }
  
  async getCameras() {
    return await StorageService.loadCameras();
  }
  
  async updateCamera(cameraId, updates) {
    if (updates.remotePort) {
      const cameras = await StorageService.loadCameras();
      const otherCameras = cameras.filter(cam => cam.id !== cameraId);
      const portValidation = this.validatePort(updates.remotePort, otherCameras);
      
      if (!portValidation.valid) {
        throw new Error(portValidation.isDuplicate ? 
          'Port already in use' : 'Port outside valid range (500-65535)');
      }
    }
    
    return await StorageService.updateCamera(cameraId, updates);
  }
  
  // Configuration Generation
  async generateConfigFromStorage() {
    const frpsConfig = await this.loadFRPSConfig();
    const cameras = await this.getCameras();
    
    if (!frpsConfig) {
      throw new Error('FRPS server configuration not found');
    }
    
    const enabledCameras = cameras.filter(cam => cam.enabled);
    if (enabledCameras.length === 0) {
      throw new Error('No enabled cameras found');
    }
    
    return await FRPCModule.generateConfig(
      enabledCameras,
      frpsConfig.serverAddr,
      frpsConfig.serverPort,
      frpsConfig.token
    );
  }
  
  // Tunnel Control
  async setupAndStart() {
    try {
      if (!FRPCModule) {
        throw new Error('FRPC native module not available - rebuild required');
      }
      
      // Generate config from storage
      const frpsConfig = await this.loadFRPSConfig();
      const cameras = await this.getCameras();
      
      if (!frpsConfig) {
        throw new Error('FRPS server configuration not found');
      }
      
      const enabledCameras = cameras.filter(cam => cam.enabled);
      if (enabledCameras.length === 0) {
        throw new Error('No enabled cameras found');
      }
      
      // Use FRPC module with config
      const config = {
        serverAddr: frpsConfig.serverAddr,
        serverPort: frpsConfig.serverPort,
        token: frpsConfig.token,
        localIp: enabledCameras[0].localIP,
        localPort: enabledCameras[0].localPort,
        remotePort: enabledCameras[0].remotePort
      };
      
      const result = await FRPCModule.startFRPC(config);
      
      if (result.success) {
        await StorageService.saveTunnelStatus({
          isActive: true,
          startedAt: new Date().toISOString()
        });
        
        return { success: true, message: `Tunnel started via ${result.method}` };
      } else {
        return { success: false, message: result.message };
      }
      
    } catch (error) {
      console.error('Failed to start tunnel:', error);
      return { success: false, message: error.message };
    }
  }
  
  async stopTunnel() {
    try {
      if (!FRPCModule) {
        throw new Error('FRPC native module not available');
      }
      
      await FRPCModule.stopFRPC();
      
      await StorageService.saveTunnelStatus({
        isActive: false,
        stoppedAt: new Date().toISOString()
      });
      
      return { success: true, message: 'Tunnel stopped successfully' };
      
    } catch (error) {
      console.error('Failed to stop tunnel:', error);
      return { success: false, message: error.message };
    }
  }
  
  async getTunnelStatus() {
    try {
      const isRunning = await FRPCModule.isFRPCRunning();
      const storedStatus = await StorageService.loadTunnelStatus();
      
      return {
        isActive: isRunning,
        ...storedStatus
      };
    } catch (error) {
      console.error('Failed to get tunnel status:', error);
      return { isActive: false };
    }
  }
  
  // Stream URL Generation
  getCameraStreamURL(camera) {
    return new Promise(async (resolve, reject) => {
      try {
        const frpsConfig = await this.loadFRPSConfig();
        if (!frpsConfig) {
          reject(new Error('FRPS configuration not found'));
          return;
        }
        
        const streamUrl = `rtsp://${frpsConfig.serverAddr}:${camera.remotePort}`;
        resolve(streamUrl);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Network Discovery
  async discoverCameras() {
    try {
      const discoveredCameras = await FRPCModule.scanNetwork();
      return discoveredCameras.map(cam => ({
        ip: cam.ip,
        port: cam.port,
        name: `Camera ${cam.ip}`,
        discovered: true
      }));
    } catch (error) {
      console.error('Network scan failed:', error);
      return [];
    }
  }
  
  // Event Listeners
  onFRPCLog(callback) {
    this.logCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.logCallbacks.indexOf(callback);
      if (index > -1) {
        this.logCallbacks.splice(index, 1);
      }
    };
  }
  
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }
  
  // Utility Methods
  getNextAvailablePort(existingCameras) {
    const usedPorts = existingCameras.map(c => c.remotePort);
    let port = 500;
    while (usedPorts.includes(port)) {
      port++;
    }
    return port;
  }
  
  validatePort(port, existingCameras) {
    const portNum = parseInt(port);
    const isDuplicate = existingCameras.some(c => c.remotePort === portNum);
    const isValidRange = portNum >= 500 && portNum <= 65535;
    
    return {
      valid: !isDuplicate && isValidRange,
      isDuplicate,
      isValidRange
    };
  }
  
  validateFRPSConfig(config) {
    const errors = [];
    
    if (!config.serverAddr || config.serverAddr.trim() === '') {
      errors.push('Server address is required');
    }
    
    if (!config.serverPort || config.serverPort < 1 || config.serverPort > 65535) {
      errors.push('Valid server port (1-65535) is required');
    }
    
    if (!config.token || config.token.trim() === '') {
      errors.push('Token is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  validateCameraConfig(camera) {
    const errors = [];
    
    if (!camera.name || camera.name.trim() === '') {
      errors.push('Camera name is required');
    }
    
    if (!camera.localIP || !this.isValidIP(camera.localIP)) {
      errors.push('Valid local IP address is required');
    }
    
    if (!camera.localPort || camera.localPort < 1 || camera.localPort > 65535) {
      errors.push('Valid local port (1-65535) is required');
    }
    
    if (!camera.remotePort || camera.remotePort < 500 || camera.remotePort > 65535) {
      errors.push('Remote port must be between 500-65535');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }
}

export default new CameraTunnelService();