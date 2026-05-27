import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function CreateView({ onAddToHistory }) {
  const [text, setText] = useState('https://adarshmishra.dev');
  const [mode, setMode] = useState('URL');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const qrRef = useRef(null);

  const handleTextChange = useCallback((val) => {
    setText(val);
    if (val.length % 6 === 0 && val.length > 5) {
      Haptics.selectionAsync();
    }
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setText(newMode === 'URL' ? 'https://' : '');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getQRBase64 = async () => {
    return new Promise((resolve, reject) => {
      if (!qrRef.current) {
        reject(new Error('QR Code reference not ready'));
        return;
      }
      qrRef.current.toDataURL((data) => {
        if (data) resolve(data);
        else reject(new Error('Failed to generate QR code image'));
      });
    });
  };

  const addToHistory = (content, type) => {
    if (onAddToHistory && content.trim()) {
      const newLog = {
        id: Date.now().toString(),
        type: type.toLowerCase(),
        data: content,
        date: 'Just Now',
      };
      onAddToHistory(newLog);
    }
  };

  const handleSaveToGallery = async () => {
    if (!text.trim()) {
      Alert.alert('Empty', 'Please enter content to generate a QR code.');
      return;
    }

    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow access to your Photos.');
        return;
      }

      const base64 = await getQRBase64();
      const fileName = `qr_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        base64.replace('data:image/png;base64,', ''),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      await MediaLibrary.saveToLibraryAsync(fileUri);
      addToHistory(text, mode);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'QR Code saved to your Gallery.');
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Save Failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!text.trim()) {
      Alert.alert('Empty', 'Please enter content first.');
      return;
    }

    setIsSharing(true);
    try {
      const base64 = await getQRBase64();
      const shareUri = `data:image/png;base64,${base64.replace('data:image/png;base64,', '')}`;

      await Share.share({
        url: Platform.OS === 'ios' ? shareUri : undefined,
        message: Platform.OS === 'android' ? `Check out this QR code!\n\n${text}` : undefined,
        title: 'My QR Code - QRScannerPro',
      });
    } catch (error) {
      if (!error.message?.includes('canceled')) {
        Alert.alert('Share Failed', 'Unable to share.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyContent = async () => {
    if (!text.trim()) return;
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Content copied to clipboard.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>
            QR SCANNER <Text style={styles.cyan}>PRO</Text>
          </Text>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>LIVE ENGINE</Text>
          </View>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrWhiteFrame}>
            <QRCode
              value={text.trim() || 'https://example.com'}
              size={280}
              color="#00FFF2"
              backgroundColor="#FFFFFF"
              getRef={qrRef}
              quietZone={20}
              ecl="H"
              enableLinearGradient
              linearGradient={['#00FFF2', '#00A8FF']}
            />
          </View>
          <Text style={styles.previewHint}>REAL-TIME • HIGH QUALITY</Text>
        </View>

        <View style={styles.glassTabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === 'URL' && styles.tabActive]}
            onPress={() => switchMode('URL')}
          >
            <MaterialCommunityIcons name="link-variant" size={22} color={mode === 'URL' ? '#000' : '#888'} />
            <Text style={[styles.tabText, mode === 'URL' && styles.tabTextActive]}>WEBLINK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === 'TEXT' && styles.tabActive]}
            onPress={() => switchMode('TEXT')}
          >
            <MaterialCommunityIcons name="text" size={22} color={mode === 'TEXT' ? '#000' : '#888'} />
            <Text style={[styles.tabText, mode === 'TEXT' && styles.tabTextActive]}>PLAIN TEXT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder={mode === 'URL' ? 'https://your-link.com' : 'Enter any text or message...'}
            placeholderTextColor="#666"
            multiline={mode === 'TEXT'}
            numberOfLines={mode === 'TEXT' ? 6 : 1}
            selectionColor="#00FFF2"
            autoCorrect={false}
            autoCapitalize={mode === 'URL' ? 'none' : 'sentences'}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyContent}>
          <Feather name="copy" size={18} color="#00FFF2" />
          <Text style={styles.copyText}>COPY CONTENT</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {(mode === 'URL'
            ? ['github.com', 'linkedin.com/in', 'youtube.com', 'notion.so']
            : ['Hello, how are you?', 'Contact: +977 98xxxxxxxx', 'Meeting at 3 PM', 'WiFi: MyNetwork']
          ).map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setText(item)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>+ {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToGallery} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Feather name="download" size={24} color="#000" />
                <Text style={styles.saveBtnText}>SAVE TO GALLERY</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={isSharing}>
            <BlurView intensity={30} tint="light" style={styles.shareInner}>
              {isSharing ? (
                <ActivityIndicator color="#00FFF2" />
              ) : (
                <Feather name="share-2" size={26} color="#00FFF2" />
              )}
            </BlurView>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { 
    padding: 24, 
    paddingTop: 70, 
    paddingBottom: 160 
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  header: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  cyan: { color: '#00FFF2' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FFF2', marginRight: 8 },
  statusText: { color: '#555', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },

  qrCard: { alignItems: 'center', marginBottom: 45 },
  qrWhiteFrame: {
    padding: 28,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00FFF2',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  previewHint: { 
    color: '#00FFF2', 
    fontSize: 12.5, 
    fontWeight: '700', 
    marginTop: 20, 
    letterSpacing: 2.5,
    opacity: 0.85,
  },

  glassTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 25,
    padding: 6,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    height: 58,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  tabActive: { backgroundColor: '#00FFF2' },
  tabText: { color: '#777', fontWeight: '800', fontSize: 13, letterSpacing: 1.2 },
  tabTextActive: { color: '#000' },

  inputWrapper: {
    backgroundColor: '#0A0A0A',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: '#1F1F1F',
    marginBottom: 20,
  },
  input: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '500',
    minHeight: 54,
    textAlignVertical: 'top',
  },

  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 11,
    backgroundColor: 'rgba(0,255,242,0.08)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,255,242,0.25)',
    marginBottom: 28,
  },
  copyText: { color: '#00FFF2', fontWeight: '700', marginLeft: 10, fontSize: 14.5 },

  chipScroll: { marginBottom: 40 },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: '#111',
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  chipText: { color: '#00FFF2', fontSize: 13.5, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 16 },
  saveBtn: {
    flex: 1,
    height: 74,
    backgroundColor: '#00FFF2',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FFF2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
  },
  saveBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16.5,
    marginLeft: 14,
    letterSpacing: 1.4,
  },
  shareBtn: {
    width: 74,
    height: 74,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,255,242,0.45)',
  },
  shareInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});