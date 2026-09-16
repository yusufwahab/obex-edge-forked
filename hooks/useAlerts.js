import { useState, useEffect, useCallback } from 'react';
import AlertService from '../services/AlertService';

export const useAlerts = () => {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // Handle new alert - show ThreatCard first instead of SecurityAlertModal
  const handleNewAlert = useCallback((alert) => {
    console.log('New alert received:', alert);
    setCurrentAlert(alert);
    setIsAlertVisible(false); // Don't show SecurityAlertModal immediately
    setAlertHistory(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
  }, []);

  // Close alert modal
  const closeAlert = useCallback(() => {
    setIsAlertVisible(false);
    setCurrentAlert(null);
  }, []);

  // Show full alert modal
  const showFullAlert = useCallback(() => {
    setIsAlertVisible(true);
  }, []);

  // Simulate alert for testing
  const simulateAlert = useCallback((type = 'weapon') => {
    return AlertService.simulateAlert(type);
  }, []);

  // Start alert monitoring
  const startAlertMonitoring = useCallback(() => {
    AlertService.connectToAlerts(); // Connect to WebSocket
  }, []);

  // Stop alert monitoring
  const stopAlertMonitoring = useCallback(() => {
    AlertService.disconnect(); // Disconnect WebSocket
  }, []);

  useEffect(() => {
    // Add alert listener
    AlertService.addAlertListener(handleNewAlert);

    // Cleanup
    return () => {
      AlertService.removeAlertListener(handleNewAlert);
      AlertService.disconnect();
    };
  }, [handleNewAlert]);

  return {
    currentAlert,
    alertHistory,
    isAlertVisible,
    closeAlert,
    showFullAlert,
    simulateAlert,
    startAlertMonitoring,
    stopAlertMonitoring
  };
};