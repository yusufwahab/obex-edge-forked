# Complete RTSP Streaming Guide for Expo with react-native-vlc-media-player

## Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli eas-cli`
- Android Studio (for Android testing)
- Xcode (for iOS testing, macOS only)

## Step 1: Project Setup

```bash
# Navigate to your project
cd obex-edge

# Initialize EAS
eas init

# Install required packages
npm install react-native-vlc-media-player expo-dev-client
```

## Step 2: Configure app.json

Your `app.json` should include:

```json
{
  "expo": {
    "name": "ObexEdge",
    "slug": "obexedge",
    "version": "1.0.0",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.avzdax.obexedge",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        },
        "NSCameraUsageDescription": "This app needs access to camera for video streaming",
        "NSMicrophoneUsageDescription": "This app needs access to microphone for audio streaming"
      }
    },
    "android": {
      "backgroundColor": "#ffffff",
      "package": "com.anonymous.obexedge",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    },
    "plugins": [
      "expo-asset",
      "expo-av"
    ]
  }
}
```

## Step 3: Create EAS Build Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## Step 4: Prebuild for Native Modules

```bash
# Generate native code
npx expo prebuild --clean
```

## Step 5: RTSP Player Component

The `RTSPPlayer.js` component includes:
- VLC player integration
- Error handling
- Loading states
- RTSP optimization settings
- Low latency configuration

Key optimization options:
```javascript
options={{
  '--network-caching': 150,    // Reduce network caching
  '--rtsp-caching': 150,       // Reduce RTSP caching
  '--no-audio': muted ? 1 : 0, // Disable audio if muted
  '--rtsp-tcp': 1,             // Use TCP for RTSP (more reliable)
  '--live-caching': 150        // Reduce live stream caching
}}
```

## Step 6: Build the App

### For Android:
```bash
# Development build (includes dev tools)
eas build --platform android --profile development

# Preview build (production-like without dev tools)
eas build --platform android --profile preview
```

### For iOS:
```bash
# Development build
eas build --platform ios --profile development

# Preview build
eas build --platform ios --profile preview
```

## Step 7: Install and Test

### Android:
1. Download the APK from EAS Build dashboard
2. Install on your Android device: `adb install app.apk`
3. Or scan QR code from EAS Build page

### iOS:
1. Add device UDID to Apple Developer account
2. Download and install via TestFlight or direct installation
3. Trust the developer certificate in Settings > General > Device Management

## Step 8: Testing RTSP Stream

1. Ensure your RTSP camera is accessible on the network
2. Update the RTSP URL in `DashboardScreen.js`:
   ```javascript
   source={{ uri: 'rtsp://username:password@ip:port/stream1' }}
   ```
3. Test network connectivity to the camera
4. Check camera supports the codec (H.264 recommended)

## Latency Optimization Tips

### 1. VLC Player Options:
```javascript
options={{
  '--network-caching': 50,     // Very low caching (50ms)
  '--rtsp-caching': 50,        // Very low RTSP caching
  '--live-caching': 50,        // Very low live caching
  '--rtsp-tcp': 1,             // Use TCP (more reliable than UDP)
  '--no-audio': 1,             // Disable audio processing
  '--intf': 'dummy',           // No interface
  '--extraintf': '',           // No extra interfaces
}}
```

### 2. Camera Settings:
- Use H.264 codec
- Lower resolution (720p instead of 1080p)
- Higher compression
- Disable audio if not needed
- Use TCP transport

### 3. Network Optimization:
- Use wired connection when possible
- Ensure good WiFi signal strength
- Use 5GHz WiFi band
- Minimize network hops

## Troubleshooting

### Common Issues:

1. **Stream not loading:**
   - Check RTSP URL format
   - Verify network connectivity
   - Test with VLC desktop player first

2. **High latency:**
   - Reduce caching values
   - Use TCP transport
   - Lower camera resolution

3. **Build errors:**
   - Run `npx expo prebuild --clean`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check EAS Build logs

4. **Permission errors:**
   - Verify app.json permissions
   - Check device settings
   - Ensure network access allowed

### Testing Commands:

```bash
# Test RTSP stream with ffmpeg
ffmpeg -i rtsp://admin:@192.168.1.10:554/stream1 -t 10 test.mp4

# Test with VLC command line
vlc rtsp://admin:@192.168.1.10:554/stream1

# Check network connectivity
ping 192.168.1.10
telnet 192.168.1.10 554
```

## Production Deployment

### For Play Store:
```bash
eas build --platform android --profile production
eas submit --platform android
```

### For App Store:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Security Considerations

1. **RTSP Credentials:**
   - Store in secure environment variables
   - Use encrypted connections when possible
   - Implement proper authentication

2. **Network Security:**
   - Use VPN for remote access
   - Implement certificate pinning
   - Validate SSL certificates

3. **App Security:**
   - Obfuscate sensitive code
   - Implement proper error handling
   - Log security events

This guide provides a complete setup for RTSP streaming in Expo with minimal latency and optimal performance.