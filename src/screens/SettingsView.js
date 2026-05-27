import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Linking, 
  ActivityIndicator, 
  Alert, 
  Share 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsView() {
  const [isVibrate, setIsVibrate] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved haptic preference
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const savedVibe = await AsyncStorage.getItem('user_haptic_pref');
        if (savedVibe !== null) {
          setIsVibrate(JSON.parse(savedVibe));
        }
      } catch (error) {
        console.error('Failed to load haptic preference:', error);
      }
    };
    loadPrefs();
  }, []);

  // Save haptic preference
  const toggleVibrate = async (value) => {
    setIsVibrate(value);
    try {
      await AsyncStorage.setItem('user_haptic_pref', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save haptic preference:', error);
    }
  };

  const fetchPrivacy = async () => {
    setLoading(true);
    setShowPrivacy(true);
    try {
      const response = await fetch('https://adarshmishra-tech.github.io/qr-scanner-privacy/');
      const text = await response.text();
      
      // Clean HTML content
      const cleanText = text
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "")
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      setPrivacyContent(cleanText || "Content currently unavailable.");
    } catch (error) {
      setPrivacyContent("Unable to load Privacy Policy. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const onShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out QR Scanner Pro - Fast & Clean QR Code Scanner & Generator!',
        url: 'https://play.google.com/store/apps/details?id=com.universal.qrscannerpro', // Update if you have a real link
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  // Privacy Screen
  if (showPrivacy) {
    return (
      <View style={styles.container}>
        <BlurView intensity={15} tint="dark" style={styles.headerNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowPrivacy(false)}>
            <Feather name="chevron-left" size={28} color="#00FFF2" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>PRIVACY POLICY</Text>
        </BlurView>

        <ScrollView 
          contentContainerStyle={styles.privacyScroll} 
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#00FFF2" />
              <Text style={styles.loaderText}>RETRIEVING FROM SECURE SERVER...</Text>
            </View>
          ) : (
            <Text style={styles.privacyBody}>{privacyContent}</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  // Main Settings Screen
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={styles.title}>
          QR SCANNER <Text style={styles.cyan}>PRO</Text>
        </Text>
        <Text style={styles.versionTag}>ENCRYPTED • REL-1.0.0</Text>
      </View>

      {/* PREFERENCES SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="vibrate" size={22} color="#00FFF2" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowLabel}>Haptic Feedback</Text>
            <Text style={styles.rowSub}>Vibrate on scan & actions</Text>
          </View>
          <Switch 
            value={isVibrate} 
            onValueChange={toggleVibrate} 
            trackColor={{ false: '#1A1A1A', true: '#00FFF233' }}
            thumbColor={isVibrate ? '#00FFF2' : '#555'}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={onShareApp}>
          <View style={styles.iconContainer}>
            <Feather name="share-2" size={20} color="#00FFF2" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowLabel}>Share App</Text>
            <Text style={styles.rowSub}>Recommend to friends</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#444" />
        </TouchableOpacity>
      </View>

      {/* LEGAL & SUPPORT SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LEGAL & SUPPORT</Text>
        
        <TouchableOpacity style={styles.row} onPress={fetchPrivacy}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#00FFF2" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Text style={styles.rowSub}>How your data is protected</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => Linking.openURL('mailto:adarshmishra121@gmail.com')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#00FFF2" />
          </View>
          <View style={styles.rowTextCol}>
            <Text style={styles.rowLabel}>Support</Text>
            <Text style={styles.rowSub}>Contact the developer</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#444" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <Text style={styles.footerText}>QR SCANNER PRO • Version 1.0.0</Text>
        <Text style={styles.footerText}>© 2026 Adarsh Mishra Tech</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 25, paddingTop: 70, paddingBottom: 120 },

  headerSection: { marginBottom: 40 },
  title: { 
    color: '#FFF', 
    fontSize: 28, 
    fontWeight: '900', 
    letterSpacing: 2.5 
  },
  cyan: { color: '#00FFF2' },
  versionTag: { 
    color: '#00FFF2', 
    fontSize: 10, 
    letterSpacing: 3, 
    marginTop: 8, 
    opacity: 0.7 
  },

  // Sections
  section: { marginBottom: 45 },
  sectionLabel: { 
    color: '#444', 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 3.5, 
    marginBottom: 16, 
    marginLeft: 6 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    backgroundColor: '#0A0A0A', 
    borderRadius: 20, 
    paddingHorizontal: 18, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111'
  },
  iconContainer: { 
    width: 42, 
    height: 42, 
    borderRadius: 12, 
    backgroundColor: '#111', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  rowTextCol: { flex: 1, marginLeft: 16 },
  rowLabel: { color: '#EEE', fontSize: 16, fontWeight: '600' },
  rowSub: { color: '#555', fontSize: 12, marginTop: 3 },

  // Footer
  footer: { marginTop: 30, alignItems: 'center' },
  divider: { width: 50, height: 2, backgroundColor: '#111', marginBottom: 20 },
  footerText: { 
    color: '#333', 
    fontSize: 10, 
    letterSpacing: 2, 
    marginBottom: 4 
  },

  // Privacy Screen Styles
  headerNav: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: 110, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingBottom: 18, 
    paddingHorizontal: 20, 
    zIndex: 10 
  },
  backBtn: { 
    width: 50, 
    height: 50, 
    justifyContent: 'center' 
  },
  navTitle: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: '900', 
    letterSpacing: 3, 
    flex: 1, 
    textAlign: 'center', 
    marginRight: 50 
  },
  privacyScroll: { 
    padding: 25, 
    paddingTop: 140, 
    paddingBottom: 100 
  },
  privacyBody: { 
    color: '#AAA', 
    fontSize: 14.5, 
    lineHeight: 26, 
    letterSpacing: 0.4 
  },
  loaderContainer: { 
    marginTop: 180, 
    alignItems: 'center' 
  },
  loaderText: { 
    color: '#00FFF2', 
    fontSize: 11, 
    letterSpacing: 4, 
    marginTop: 25, 
    fontWeight: 'bold' 
  },
});