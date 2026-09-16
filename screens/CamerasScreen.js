import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../services/api';
import AuthService from '../services/auth';

const CamerasScreen = ({ navigation }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AuthService.getToken();
      // GET /api/v1/cameras/ returns { message, data: [CameraData], total }
      const result = await ApiService.getCameras(token);
      setCameras(Array.isArray(result?.data) ? result.data : []);
    } catch (e) {
      setError(e.message || 'Failed to load cameras');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCameras();
    }, [loadCameras])
  );

  const handleDelete = (camera) => {
    Alert.alert('Delete Camera', `Remove "${camera.cameraName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AuthService.getToken();
            await ApiService.deleteCamera(camera.id, token);
            loadCameras();
          } catch (e) {
            Alert.alert('Delete failed', e.message || 'Could not delete this camera');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('CameraPlayer', { camera: item })}
    >
      <Ionicons name="videocam" size={24} color="#4A9EFF" />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.cameraName}</Text>
        <Text style={styles.rowMeta}>{item.locationId || item.ipAddress}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
        <Ionicons name="trash" size={18} color="#FF4444" />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={18} color="#8B92A7" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cameras</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddCamera')}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A9EFF" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCameras}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && cameras.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="videocam-outline" size={64} color="#666666" />
          <Text style={styles.emptyTitle}>No Cameras Added</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('AddCamera')}>
            <Text style={styles.retryButtonText}>Add First Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && cameras.length > 0 && (
        <FlatList
          data={cameras}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#212121' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: { fontSize: 22, color: '#FFFFFF', fontWeight: 'bold' },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A9EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(64,64,64,0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#555555',
  },
  rowText: { flex: 1, marginLeft: 12 },
  rowName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  rowMeta: { color: '#8B92A7', fontSize: 12, marginTop: 2 },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 6,
    marginRight: 8,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  errorText: { color: '#FF6B6B', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 16 },
  retryButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default CamerasScreen;
