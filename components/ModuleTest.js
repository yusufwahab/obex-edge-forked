import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeModules } from 'react-native';

const ModuleTest = () => {
  const [moduleStatus, setModuleStatus] = useState('Checking...');

  useEffect(() => {
    const checkModules = () => {
      const allModules = Object.keys(NativeModules);
      const hasFRPC = !!NativeModules.FRPCModule;
      
      console.log('All available modules:', allModules);
      console.log('FRPC Module exists:', hasFRPC);
      
      if (hasFRPC) {
        const frpcMethods = Object.keys(NativeModules.FRPCModule);
        setModuleStatus(`✅ FRPC Module Available (${frpcMethods.length} methods)`);
        console.log('FRPC Methods:', frpcMethods);
        
        // Check for required methods
        const requiredMethods = [
          'installFRPCBinary',
          'generateConfig', 
          'startFRPC',
          'stopFRPC',
          'isFRPCRunning',
          'checkBinaryPermissions',
          'runComprehensiveDiagnostics',
          'testFRPCExecution'
        ];
        
        const missingMethods = requiredMethods.filter(method => !frpcMethods.includes(method));
        if (missingMethods.length > 0) {
          console.warn('Missing FRPC methods:', missingMethods);
        } else {
          console.log('✅ All required FRPC methods available');
        }
      } else {
        setModuleStatus('❌ FRPC Module Missing');
        console.log('Available modules:', allModules.slice(0, 10));
      }
    };

    checkModules();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Native Module Status</Text>
      <Text style={styles.status}>{moduleStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: '#333',
  },
});

export default ModuleTest;