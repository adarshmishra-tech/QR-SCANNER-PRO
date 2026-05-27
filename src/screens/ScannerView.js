import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ScannerView() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [scanResult, setScanResult] = useState(null); // { data: string, isUrl: boolean }

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 180, duration: 1400, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [permission?.granted]);

  const showResultModal = (data) => {
    if (!data) return;
    const isUrl = /^https?:\/\//i.test(data.trim());

    setScanResult({ data: data.trim(), isUrl });

    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 0.8, useNativeDriver: true }),
    ]).start(() => {
      setScanResult(null);
      setScanned(false);
    });
  };

  const handleCopy = async () => {
    if (!scanResult?.data) return;
    await Clipboard.setStringAsync(scanResult.data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Content copied to clipboard.");
    closeModal();
  };

  const handleOpenLink = async () => {
    if (!scanResult?.isUrl) return;
    try {
      await Linking.openURL(scanResult.data);
    } catch {
      Alert.alert("Cannot Open", "This link could not be opened.");
    }
    closeModal();
  };

  const processScan = (data) => {
    if (scanned || !data) return;
    setScanned(true);
    showResultModal(data);
  };

  const pickAndCropImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      const localFileUri = `${FileSystem.cacheDirectory}qr_scan_target.jpg`;
      await FileSystem.copyAsync({ from: manipulated.uri, to: localFileUri });

      const scanResults = await Camera.scanFromURLAsync(localFileUri, ['qr']);

      await FileSystem.deleteAsync(localFileUri, { idempotent: true });
      await FileSystem.deleteAsync(manipulated.uri, { idempotent: true });

      if (scanResults?.length > 0) {
        processScan(scanResults[0].data);
      } else {
        Alert.alert("No QR Code Found", "No QR code was detected in the image.");
      }
    } catch (err) {
      console.error("Gallery Scan Error:", err);
      Alert.alert("Scan Failed", "Could not process the image.\nTry cropping closer around the QR code.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.darkFill}>
        <Text style={{ color: '#888' }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.darkFill}>
        <MaterialCommunityIcons name="camera-off" size={60} color="#00FFF2" />
        <Text style={styles.permissionText}>Camera access is required to scan QR codes</Text>
        <TouchableOpacity style={styles.primeBtn} onPress={requestPermission}>
          <Text style={styles.primeBtnText}>GRANT CAMERA ACCESS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cameraSection}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          enableTorch={torch}
          zoom={zoom}
          onBarcodeScanned={scanned ? undefined : ({ data }) => processScan(data)}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanBox}>
              <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
              <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
              <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
              <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />
              <Animated.View style={[styles.laser, { transform: [{ translateY: scanLineAnim }] }]} />
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.controlSection}>
        <View style={styles.hubHeader}>
          <Text style={styles.hubTitle}>QR<Text style={styles.cyan}>SCANNER</Text> PRO</Text>
          <Text style={styles.hubVersion}>STABLE ENGINE v2.3</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.gridItem, torch && styles.activeItem]} onPress={() => setTorch(!torch)}>
            <MaterialCommunityIcons name={torch ? "flashlight" : "flashlight-off"} size={28} color={torch ? "#00FFF2" : "#888"} />
            <Text style={styles.itemLabel}>TORCH</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridItem, zoom > 0 && styles.activeItem]} onPress={() => setZoom(zoom === 0 ? 0.5 : 0)}>
            <MaterialCommunityIcons name="magnify" size={28} color={zoom > 0 ? "#00FFF2" : "#888"} />
            <Text style={styles.itemLabel}>ZOOM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={pickAndCropImage}>
            <Ionicons name="images" size={28} color="#888" />
            <Text style={styles.itemLabel}>GALLERY</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hubFooter}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>LIVE • REAL-TIME DETECTION</Text>
        </View>
      </View>

      {/* Custom Result Modal */}
      {scanResult && (
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            <BlurView intensity={95} tint="dark" style={styles.modalBlur}>
              <Text style={styles.modalTitle}>QR CODE DETECTED</Text>

              <View style={styles.resultBox}>
                <Text style={styles.resultText} numberOfLines={8}>
                  {scanResult.data}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                  <MaterialCommunityIcons name="content-copy" size={22} color="#00FFF2" />
                  <Text style={styles.actionBtnText}>COPY</Text>
                </TouchableOpacity>

                {scanResult.isUrl && (
                  <TouchableOpacity style={[styles.actionBtn, styles.openBtn]} onPress={handleOpenLink}>
                    <MaterialCommunityIcons name="open-in-new" size={22} color="#000" />
                    <Text style={styles.openBtnText}>OPEN LINK</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionBtn} onPress={closeModal}>
                  <MaterialCommunityIcons name="close" size={22} color="#888" />
                  <Text style={styles.closeBtnText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  darkFill: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionText: { color: '#888', textAlign: 'center', marginVertical: 20, fontSize: 15 },

  cameraSection: { flex: 5.5, overflow: 'hidden' },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 220, height: 220, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#00FFF2' },
  laser: { width: '100%', height: 3, backgroundColor: '#00FFF2', shadowColor: '#00FFF2', shadowOpacity: 0.9, shadowRadius: 10 },

  controlSection: { flex: 4.5, backgroundColor: '#000', padding: 25, justifyContent: 'space-between' },
  hubHeader: { alignItems: 'center' },
  hubTitle: { color: '#FFF', fontSize: 23, fontWeight: '900', letterSpacing: 2 },
  cyan: { color: '#00FFF2' },
  hubVersion: { color: '#555', fontSize: 10, fontWeight: 'bold', marginTop: 6 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  gridItem: {
    width: (width - 80) / 3,
    height: 102,
    backgroundColor: '#111',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  activeItem: { borderColor: '#00FFF2', backgroundColor: 'rgba(0,255,242,0.08)' },
  itemLabel: { color: '#666', fontSize: 10, fontWeight: '700', marginTop: 10 },

  hubFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00FFF2', marginRight: 8 },
  statusText: { color: '#444', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  primeBtn: { backgroundColor: '#00FFF2', paddingHorizontal: 45, paddingVertical: 18, borderRadius: 30, marginTop: 30 },
  primeBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContainer: { width: width * 0.88, borderRadius: 28, overflow: 'hidden' },
  modalBlur: { padding: 24, alignItems: 'center' },
  modalTitle: { color: '#00FFF2', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 18 },
  resultBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,255,242,0.15)' },
  resultText: { color: '#FFF', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#111', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  openBtn: { backgroundColor: '#00FFF2', borderColor: '#00FFF2' },
  actionBtnText: { color: '#00FFF2', fontWeight: '700', marginTop: 6, fontSize: 13 },
  openBtnText: { color: '#000', fontWeight: '900', marginTop: 6, fontSize: 13 },
  closeBtnText: { color: '#888', fontWeight: '600', marginTop: 6, fontSize: 13 },
});