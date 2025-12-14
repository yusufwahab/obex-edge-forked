import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import CameraTunnelService from '../services/CameraTunnelService';

const CameraManagementScreen = ({ navigation }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [localIP, setLocalIP] = useState('192.168.1.10');
  const [localPort, setLocalPort] = useState('554');
  const [remotePort, setRemotePort] = useState('557');

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const cameraList = await CameraTunnelService.getCameras();
      setCameras(cameraList);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCamera = (camera) => {
    setEditingCamera(camera);
    setName(camera.name);
    setLocalIP(camera.localIP);
    setLocalPort(camera.localPort.toString());
    setRemotePort(camera.remotePort.toString());
    setShowAddModal(true);
  };

  const handleSaveCamera = async () => {
    const cameraData = {
      name: name.trim(),
      localIP: localIP.trim(),
      localPort: parseInt(localPort),
      remotePort: parseInt(remotePort)
    };

    const validation = CameraTunnelService.validateCameraConfig(cameraData);
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    try {
      if (editingCamera) {
        await CameraTunnelService.updateCamera(editingCamera.id, cameraData);
      } else {
        await CameraTunnelService.addCamera(
          cameraData.name,
          cameraData.localIP,
          cameraData.localPort,
          cameraData.remotePort
        );
      }

      setShowAddModal(false);
      resetForm();
      loadCameras();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteCamera = (camera) => {
    Alert.alert(
      'Delete Camera',
      `Are you sure you want to delete "${camera.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CameraTunnelService.removeCamera(camera.id);
              loadCameras();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete camera');
            }
          }
        }
      ]
    );
  };

  const handleToggleCamera = async (camera) => {
    try {
      await CameraTunnelService.updateCamera(camera.id, {
        enabled: !camera.enabled
      });
      loadCameras();
    } catch (error) {
      Alert.alert('Error', 'Failed to update camera');
    }
  };

  const handleScanNetwork = async () => {
    setScanning(true);
    try {
      const discovered = await CameraTunnelService.discoverCameras();
      setDiscoveredCameras(discovered);
      
      if (discovered.length === 0) {
        Alert.alert('No Cameras Found', 'No RTSP cameras were discovered on the network');
      }
    } catch (error) {
      Alert.alert('Scan Error', 'Failed to scan network for cameras');
    } finally {
      setScanning(false);
    }
  };

  const handleAddDiscoveredCamera = (discoveredCamera) => {
    setName(discoveredCamera.name);
    setLocalIP(discoveredCamera.ip);
    setLocalPort(discoveredCamera.port.toString());
    const nextPort = CameraTunnelService.getNextAvailablePort(cameras);
    setRemotePort(nextPort.toString());
    setDiscoveredCameras([]);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingCamera(null);
    setName('');
    setLocalIP('192.168.1.10');
    setLocalPort('554');
    setRemotePort('557');
  };

  const renderCameraItem = ({ item }) => (
    <View style={styles.cameraItem}>
      <View style={styles.cameraInfo}>
        <Text style={styles.cameraName}>{item.name}</Text>
        <Text style={styles.cameraDetails}>
          Local: {item.localIP}:{item.localPort}
        </Text>
        <Text style={styles.cameraDetails}>
          Remote Port: {item.remotePort}
        </Text>
        <Text style={[styles.cameraStatus, { color: item.enabled ? '#4CAF50' : '#F44336' }]}>
          {item.enabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
      
      <View style={styles.cameraActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleCamera(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.enabled ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCamera(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCamera(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDiscoveredCamera = ({ item }) => (
    <TouchableOpacity
      style={styles.discoveredItem}
      onPress={() => handleAddDiscoveredCamera(item)}
    >
      <Text style={styles.discoveredName}>{item.name}</Text>
      <Text style={styles.discoveredDetails}>{item.ip}:{item.port}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Camera Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.scanButton]}
            onPress={handleScanNetwork}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.headerButtonText}>Scan Network</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.addButton]}
            onPress={handleAddCamera}
          >
            <Text style={styles.headerButtonText}>Add Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={cameras}
          renderItem={renderCameraItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cameras configured</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Camera" or "Scan Network" to get started
              </Text>
            </View>
          }
        />
      )}

      {/* Discovered Cameras Modal */}
      <Modal
        visible={discoveredCameras.length > 0}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.discoveredModal}>
            <Text style={styles.modalTitle}>Discovered Cameras</Text>
            <FlatList
              data={discoveredCameras}
              renderItem={renderDiscoveredCamera}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDiscoveredCameras([])}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Camera Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingCamera ? 'Edit Camera' : 'Add Camera'}
            </Text>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Camera Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Living Room Camera"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Local IP Address</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={localIP}
                  editable={false}
                  placeholder="192.168.1.100"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Local Port</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={localPort}
                  editable={false}
                  placeholder="554"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Remote Port (500-65535)</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={remotePort}
                  editable={false}
                  placeholder="500"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCamera}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#FF9800',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  headerButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  cameraItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraInfo: {
    flex: 1,
  },
  cameraName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cameraDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cameraStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  cameraActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleButton: {
    backgroundColor: '#2196F3',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  discoveredModal: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalContent: {
    maxHeight: 300,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  discoveredItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  discoveredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discoveredDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  readOnlyInput: {
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
});

export default CameraManagementScreen;