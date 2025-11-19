import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import LogoLoadingScreen from './components/LogoLoadingScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import DeviceHealthScreen from './screens/DeviceHealthScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';

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
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="DeviceHealth" component={DeviceHealthScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
