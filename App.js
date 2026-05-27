// 1. MUST BE AT THE VERY TOP: Polyfill for Buffer
// This fixes the "Buffer is undefined" error on Android/iOS
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import HomeUIScreen from './src/screens/HomeUIScreen'; 

export default function App() {
  const [screen, setScreen] = useState('splash');

  // Handle the transition from Splash to the main App
  const handleSplashFinish = () => {
    setScreen('main');
  };

  return (
    <View style={styles.container}>
      {/* Set Status Bar to light for the dark Pro theme */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {screen === 'splash' ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <HomeUIScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Matches your Neon/Cyberpunk theme
  },
});