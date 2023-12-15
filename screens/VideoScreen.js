// VideoScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { Video } from 'expo-av';

const VideoScreen = ({ route }) => {
  const { downloadURL } = route.params;

  console.log(downloadURL);

  return (
    <View>
      <Text>Video Screen</Text>
      <Video
        source={{ uri: downloadURL }} // Use the actual video URL here
        style={{ width: 300, height: 200 }}
        useNativeControls // Enable built-in controls
        resizeMode="contain" // Adjust the video's aspect ratio
        isLooping // Loop the video
      />
    </View>
  );
};

export default VideoScreen;
