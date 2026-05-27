import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import your views
import ScannerView from './ScannerView';
import CreateView from './CreateView';
import HistoryView from './HistoryView';
import SettingsView from './SettingsView';

const { width } = Dimensions.get('window');

export default function HomeUIScreen() {
  const [activeTab, setActiveTab] = useState('scan');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = useCallback((tab) => {
    if (activeTab === tab) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab, fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Main Content with Smooth Fade Transition */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'scan' && <ScannerView />}
        {activeTab === 'create' && <CreateView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <SettingsView />}
      </Animated.View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navWrapper}>
        <BlurView intensity={95} tint="dark" style={styles.navBar}>
          <NavButton
            icon="qrcode-scan"
            label="Scan"
            active={activeTab === 'scan'}
            onPress={() => switchTab('scan')}
          />
          <NavButton
            icon="plus-box"
            label="Create"
            active={activeTab === 'create'}
            onPress={() => switchTab('create')}
          />
          <NavButton
            icon="history"
            label="History"
            active={activeTab === 'history'}
            onPress={() => switchTab('history')}
          />
          <NavButton
            icon="cog"
            label="Settings"
            active={activeTab === 'settings'}
            onPress={() => switchTab('settings')}
          />
        </BlurView>
      </View>
    </View>
  );
}

const NavButton = ({ icon, active, onPress, label }) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={styles.tab} 
    activeOpacity={0.75}
  >
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons 
        name={icon} 
        size={active ? 27 : 23} 
        color={active ? "#00FFF2" : "rgba(255,255,255,0.45)"} 
      />
      {active && <View style={styles.activeDot} />}
    </View>
    
    {active && <Text style={styles.activeLabel}>{label}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  content: { 
    flex: 1 
  },

  // Bottom Navigation
  navWrapper: { 
    position: 'absolute', 
    bottom: 24, 
    left: 18, 
    right: 18 
  },
  navBar: { 
    height: 78, 
    borderRadius: 28, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    overflow: 'hidden', 
    borderWidth: 1.5, 
    borderColor: 'rgba(0,255,242,0.25)',
    backgroundColor: 'rgba(10,10,10,0.95)',
  },
  tab: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    paddingVertical: 8 
  },
  iconWrapper: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 38 
  },
  activeDot: { 
    width: 5, 
    height: 5, 
    borderRadius: 3, 
    backgroundColor: '#00FFF2', 
    position: 'absolute', 
    bottom: -3 
  },
  activeLabel: { 
    color: '#00FFF2', 
    fontSize: 10, 
    fontWeight: '900', 
    marginTop: 5, 
    letterSpacing: 0.8,
    textTransform: 'uppercase' 
  },
});