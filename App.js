import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import LogoLoadingScreen from './components/LogoLoadingScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setReady] = useState(false);

  // Simulate async init (replace with your real bootstrap)
  useEffect(() => {
    setTimeout(() => setReady(true), 4000);
  }, []);

  if (!isReady) {
    return <LogoLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
