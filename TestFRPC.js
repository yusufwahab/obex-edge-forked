import { NativeModules } from 'react-native';

console.log('=== FRPC Module Debug ===');
console.log('All NativeModules keys:', Object.keys(NativeModules));
console.log('FRPCModule exists:', !!NativeModules.FRPCModule);

if (NativeModules.FRPCModule) {
  console.log('FRPCModule methods:', Object.keys(NativeModules.FRPCModule));
} else {
  console.log('FRPCModule not found in:', Object.keys(NativeModules).slice(0, 10));
}

export default function TestFRPC() {
  return null;
}