import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Animated, StatusBar, 
  Easing, Dimensions, Platform 
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // Animation controllers
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scanLineAnim = useRef(new Animated.Value(-100)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const wordFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Core Entrance Sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Infinite Background Rotation
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();

    // 2. Staggered Haptics & Word Reveal
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(wordFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 800);

    // 3. The "Cyber Laser" Loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 180,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: -100,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => onFinish(), 4000);
    return () => clearTimeout(timer);
  }, []);

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* MAGIC BACKGROUND: Rotating Tech Grid (No Image) */}
      <Animated.View style={[styles.bgGrid, { transform: [{ rotate: spin }] }]}>
        {[...Array(12)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { transform: [{ rotate: `${i * 30}deg` }] }]} />
        ))}
      </Animated.View>

      <Animated.View style={[
        styles.mainContent, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        
        {/* THE FEATURE SATELLITES */}
        <Animated.View style={[styles.satelliteContainer, { opacity: wordFade }]}>
           <Text style={[styles.tag, { top: -60, left: -70 }]}>• SCAN</Text>
           <Text style={[styles.tag, { top: -60, right: -70 }]}>• CREATE</Text>
           <Text style={[styles.tag, { bottom: -20, left: -80 }]}>• SHARE</Text>
           <Text style={[styles.tag, { bottom: -20, right: -80 }]}>• SECURE</Text>
        </Animated.View>

        {/* LOGO FRAME: Dynamic UI elements */}
        <View style={styles.logoHexagon}>
          <View style={styles.logoInner}>
            {/* Corner Accents (The Magic Details) */}
            <View style={[styles.corner, { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 }]} />
            
            <Text style={styles.logoText}>QR</Text>
            
            {/* THE LASER */}
            <Animated.View 
              style={[
                styles.laserLine, 
                { transform: [{ translateY: scanLineAnim }] }
              ]} 
            >
              <View style={styles.laserGlow} />
            </Animated.View>
          </View>
        </View>

        {/* BRAND TYPOGRAPHY */}
        <View style={styles.textStack}>
          <Text style={styles.brandTitle}>
            QR<Text style={styles.brandWeight}>Scanner</Text><Text style={styles.brandPro}>Pro</Text>
          </Text>
          <View style={styles.loadingTrack}>
            <Animated.View style={styles.loadingFill} />
          </View>
          <Text style={styles.allInOne}>ALL-IN-1 NEURAL ENGINE</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerDev}>DESIGNED BY ADARSH MISHRA</Text>
        <Text style={styles.footerVersion}>SYSTEM REL 1.0.0_BETA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  
  // Rotating Magic Background Grid
  bgGrid: { position: 'absolute', width: width * 1.5, height: width * 1.5, justifyContent: 'center', alignItems: 'center', opacity: 0.15 },
  gridLine: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#00FFF2' },

  mainContent: { alignItems: 'center', zIndex: 10 },
  satelliteContainer: { ...StyleSheet.absoluteFillObject },
  tag: { position: 'absolute', color: '#00FFF2', fontSize: 9, fontWeight: '900', letterSpacing: 3, opacity: 0.5 },

  // Logo Stylized Box
  logoHexagon: {
    width: 140,
    height: 140,
    backgroundColor: '#050505',
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 242, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: '#00FFF2',
    shadowOpacity: 0.2,
    shadowRadius: 30,
  },
  logoInner: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 15, height: 15, borderColor: '#00FFF2' },
  logoText: { fontSize: 48, fontWeight: '900', color: '#FFF', letterSpacing: -2 },
  
  // Laser
  laserLine: { position: 'absolute', width: '120%', height: 3, backgroundColor: '#00FFF2', top: 0, zIndex: 5 },
  laserGlow: { width: '100%', height: 30, backgroundColor: 'rgba(0, 255, 242, 0.08)', marginTop: -15 },

  // Text Components
  textStack: { alignItems: 'center' },
  brandTitle: { fontSize: 30, color: '#FFF', fontWeight: '200', letterSpacing: 2 },
  brandWeight: { fontWeight: '800', color: '#E0E0E0' },
  brandPro: { color: '#00FFF2', fontWeight: '900', fontStyle: 'italic' },
  
  loadingTrack: { width: 100, height: 2, backgroundColor: '#111', marginTop: 15, borderRadius: 1, overflow: 'hidden' },
  loadingFill: { width: '60%', height: '100%', backgroundColor: '#00FFF2' },
  allInOne: { color: '#222', fontSize: 8, fontWeight: '900', letterSpacing: 6, marginTop: 10 },

  footer: { position: 'absolute', bottom: 60, alignItems: 'center' },
  footerDev: { color: '#333', fontSize: 9, letterSpacing: 3, fontWeight: 'bold' },
  footerVersion: { color: '#00FFF2', fontSize: 7, opacity: 0.2, marginTop: 5, fontWeight: 'bold' }
});