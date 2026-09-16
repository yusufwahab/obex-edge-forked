import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkInfo } from 'react-native-network-info';
import RTSPPlayer from '../components/RTSPPlayer';

const REMOTE_CACHING_MS = 500;
const LOCAL_CACHING_MS = 150;
const WATCHDOG_TIMEOUT_MS = 6000;

function firstThreeOctets(ip) {
  return ip ? ip.split('.').slice(0, 3).join('.') : null;
}

// Per pipeline.md: the backend is meant to return both `streamUrl` (direct, LAN) and
// `remoteStreamUrl` (relayed via the camera's edge device) per camera, and the client
// picks whichever is usable based on whether it's currently on the same /24 as the
// camera. The live backend does NOT implement this yet — CameraData only has a flat
// `rtspUrl` (see the integration gap report) — so this falls back to that single URL
// for both cases until the backend adds the split. No other code changes will be
// needed here once it does.
const CameraPlayerScreen = ({ route, navigation }) => {
  const { camera } = route.params || {};
  const [sameNetwork, setSameNetwork] = useState(null); // null = still checking
  const [playerError, setPlayerError] = useState(null);

  const computeSameNetwork = useCallback(async () => {
    try {
      const myIp = await NetworkInfo.getIPV4Address();
      setSameNetwork(
        !!myIp && !!camera?.localIp && firstThreeOctets(myIp) === firstThreeOctets(camera.localIp)
      );
    } catch (e) {
      setSameNetwork(false);
    }
  }, [camera?.localIp]);

  useEffect(() => {
    computeSameNetwork();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        computeSameNetwork();
      }
    });

    return () => subscription?.remove();
  }, [computeSameNetwork]);

  const effectiveUrl = camera?.streamUrl || camera?.remoteStreamUrl
    ? (sameNetwork ? camera?.streamUrl : camera?.remoteStreamUrl)
    : camera?.rtspUrl; // fallback: today's live API only returns this flat field

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{camera?.cameraName || camera?.name || 'Camera'}</Text>
          <Text style={styles.subtitle}>{camera?.locationId || camera?.ipAddress || ''}</Text>
        </View>
      </View>

      <View style={styles.playerContainer}>
        {sameNetwork === null ? (
          <View style={styles.centered}>
            <Text style={styles.statusText}>Checking network…</Text>
          </View>
        ) : !effectiveUrl ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={48} color="#666" />
            <Text style={styles.statusText}>
              {sameNetwork
                ? 'No local stream URL available for this camera.'
                : "This camera's edge device is currently offline — remote viewing unavailable."}
            </Text>
          </View>
        ) : (
          <RTSPPlayer
            rtspUrl={effectiveUrl}
            style={styles.player}
            cachingMs={sameNetwork ? LOCAL_CACHING_MS : REMOTE_CACHING_MS}
            enableWatchdog
            watchdogTimeoutMs={WATCHDOG_TIMEOUT_MS}
            onError={setPlayerError}
            onStopped={() => {}}
          />
        )}
      </View>

      {playerError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Connection issue — attempting to reconnect…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerText: { marginLeft: 8 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  subtitle: { color: '#8B92A7', fontSize: 12, marginTop: 2 },
  playerContainer: { flex: 1 },
  player: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  statusText: { color: '#8B92A7', fontSize: 14, textAlign: 'center', marginTop: 12 },
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,107,107,0.9)',
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: { color: '#FFFFFF', fontSize: 13, textAlign: 'center' },
});

export default CameraPlayerScreen;
