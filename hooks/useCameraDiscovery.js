import { useCallback, useState } from 'react';
import { discoverOnvifDevices } from '../services/onvif/discoveryNative';

// Modeled on hooks/useAlerts.js: flat returned state + explicit action functions, no reducer.
export function useCameraDiscovery() {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    setDevices([]);
    try {
      const found = await discoverOnvifDevices();
      setDevices(found || []);
    } catch (e) {
      setError(e.message || 'Discovery failed');
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { devices, isScanning, error, startScan };
}
