import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const VideoPlayer = ({ style, showFullscreenButton = true, source, shouldPlay = true, isLooping = false, isMuted = false, weaponDetection = false }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const videos = [
    require('../Video 1.mp4'),
    require('../Video2.mp4'),
    require('../video3.mp4'),
    require('../Video5.mp4')
  ];
  
  const videoSource = weaponDetection ? videos[3] : (source || videos[currentVideoIndex]);

  const playNextVideo = () => {
    if (weaponDetection) return;
    setTimeout(() => {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(nextIndex);
    }, 50);
  };

  // videoSource is now defined above
  
  // Force autoplay and loop for specific source or weapon detection
  const videoShouldPlay = (source || weaponDetection) ? true : shouldPlay;
  const videoIsLooping = (source || weaponDetection) ? true : isLooping;
  const videoIsMuted = (source || weaponDetection) ? true : isMuted;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const VideoComponent = ({ containerStyle }) => (
    <View style={containerStyle}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        shouldPlay={videoShouldPlay}
        isLooping={videoIsLooping}
        isMuted={videoIsMuted}
        resizeMode="cover"
        useNativeControls={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish && !source) {
            playNextVideo();
          }
        }}
        onError={(error) => console.log('Video error:', error)}
        onLoad={() => console.log('Video loaded successfully')}
      />
      {showFullscreenButton && (
        <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
          <Ionicons name="expand" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <VideoComponent containerStyle={[styles.container, style]} />
      
      <Modal
        visible={isFullscreen}
        animationType="fade"
        supportedOrientations={['landscape']}
      >
        <View style={styles.fullscreenContainer}>
          <VideoComponent containerStyle={styles.fullscreenVideo} />
          <TouchableOpacity style={styles.closeButton} onPress={toggleFullscreen}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: Dimensions.get('window').height,
    height: Dimensions.get('window').width,
    transform: [{ rotate: '90deg' }],
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});

export default VideoPlayer;