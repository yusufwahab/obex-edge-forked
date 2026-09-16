import { NativeModules, Platform } from 'react-native';

// Thin bridge to the native OnvifDiscoveryModule (Android only — WS-Discovery here
// requires a WifiManager MulticastLock and explicit binding to the Wi-Fi Network,
// which has no equivalent pure-JS UDP library solution).
export async function discoverOnvifDevices() {
  if (Platform.OS !== 'android' || !NativeModules.OnvifDiscovery) {
    throw new Error('ONVIF discovery requires an Android development build (native module not available)');
  }
  return NativeModules.OnvifDiscovery.discover();
}
