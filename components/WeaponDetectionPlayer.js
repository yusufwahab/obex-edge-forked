import React from 'react';
import { Video } from 'expo-av';

const WeaponDetectionPlayer = ({ style }) => {
  return (
    <Video
      source={require('../WeaponDetectionVideo.mp4')}
      style={style}
      shouldPlay={true}
      isLooping={true}
      isMuted={true}
      resizeMode="cover"
      useNativeControls={false}
    />
  );
};

export default WeaponDetectionPlayer;