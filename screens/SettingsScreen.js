import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [motionDetection, setMotionDetection] = useState(true);
  const [nightMode, setNightMode] = useState(true);

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#4A9EFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color="#8B92A7" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.divider}>
          <LinearGradient
            colors={['#666666', '#FFFFFF', '#666666']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientLine}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Profile"
              subtitle="Manage your account details"
            />
            <SettingItem
              icon="shield-outline"
              title="Privacy & Security"
              subtitle="Password, two-factor authentication"
            />
            <SettingItem
              icon="card-outline"
              title="Subscription"
              subtitle="Manage your plan and billing"
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive alerts on your device"
              rightComponent={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#2A2A2A', true: '#4A9EFF' }}
                  thumbColor={pushNotifications ? '#FFFFFF' : '#8B92A7'}
                />
              }
            />
            <SettingItem
              icon="mail-outline"
              title="Email Alerts"
              subtitle="Get notifications via email"
              rightComponent={
                <Switch
                  value={emailAlerts}
                  onValueChange={setEmailAlerts}
                  trackColor={{ false: '#2A2A2A', true: '#4A9EFF' }}
                  thumbColor={emailAlerts ? '#FFFFFF' : '#8B92A7'}
                />
              }
            />
          </View>
        </View>

        {/* Camera Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera Settings</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="eye-outline"
              title="Motion Detection"
              subtitle="Enable automatic motion alerts"
              rightComponent={
                <Switch
                  value={motionDetection}
                  onValueChange={setMotionDetection}
                  trackColor={{ false: '#2A2A2A', true: '#4A9EFF' }}
                  thumbColor={motionDetection ? '#FFFFFF' : '#8B92A7'}
                />
              }
            />
            <SettingItem
              icon="moon-outline"
              title="Night Vision"
              subtitle="Automatic night mode detection"
              rightComponent={
                <Switch
                  value={nightMode}
                  onValueChange={setNightMode}
                  trackColor={{ false: '#2A2A2A', true: '#4A9EFF' }}
                  thumbColor={nightMode ? '#FFFFFF' : '#8B92A7'}
                />
              }
            />
            <SettingItem
              icon="videocam-outline"
              title="Recording Quality"
              subtitle="HD • 1080p"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="FAQs and troubleshooting"
            />
            <SettingItem
              icon="chatbubble-outline"
              title="Contact Support"
              subtitle="Get help from our team"
            />
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="Version 1.0.0"
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="apps" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Ionicons name="bar-chart" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add" size={24} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={20} color="#8B92A7" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Ionicons name="settings" size={20} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  divider: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  gradientLine: {
    height: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'rgba(64,64,64,0.3)',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#999999',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74,158,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8B92A7',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navItem: {
    padding: 8,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
});

export default SettingsScreen;