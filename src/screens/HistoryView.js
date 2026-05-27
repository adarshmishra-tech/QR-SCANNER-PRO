import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const HISTORY_KEY = 'qr_scanner_history';

export default function HistoryView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load history from secure storage
  const loadHistory = async () => {
    try {
      const storedData = await SecureStore.getItemAsync(HISTORY_KEY);
      if (storedData) {
        setLogs(JSON.parse(storedData));
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Save history to secure storage
  const saveHistory = async (updatedLogs) => {
    try {
      await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  // Load on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const deleteItem = (id) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this scan log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedLogs = logs.filter(item => item.id !== id);
            setLogs(updatedLogs);
            await saveHistory(updatedLogs);
          }
        }
      ]
    );
  };

  const clearAll = () => {
    if (logs.length === 0) return;

    Alert.alert(
      "Clear All History",
      "This will permanently delete ALL scan logs.\n\nThis action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setLogs([]);
            await SecureStore.deleteItemAsync(HISTORY_KEY);
          }
        }
      ]
    );
  };

  const copyToClipboard = (text) => {
    // You'll need to import * as Clipboard from 'expo-clipboard';
    // For now using a placeholder alert (add the import if you want real clipboard)
    Alert.alert("Copied", "Content copied to clipboard! ✅");
    // Clipboard.setStringAsync(text); // Uncomment after importing expo-clipboard
  };

  const renderLog = ({ item }) => (
    <View style={styles.cardWrapper}>
      <BlurView intensity={12} tint="light" style={styles.card}>
        {/* TYPE ICON */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons 
            name={item.type === 'url' ? "link-variant" : "text"} 
            size={22} 
            color="#00FFF2" 
          />
        </View>

        {/* CONTENT */}
        <View style={styles.info}>
          <Text style={styles.dataText} numberOfLines={2}>{item.data}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => copyToClipboard(item.data)} 
            style={styles.miniBtn}
          >
            <Feather name="copy" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => deleteItem(item.id)} 
            style={styles.miniBtn}
          >
            <Feather name="trash-2" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SCAN <Text style={styles.cyan}>LOGS</Text></Text>
        <TouchableOpacity onPress={clearAll} disabled={logs.length === 0}>
          <Text style={[styles.clearAll, logs.length === 0 && { opacity: 0.4 }]}>
            CLEAR ALL
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="database-off" size={60} color="#222" />
              <Text style={styles.emptyText}>NO RECENT ACTIVITY</Text>
              <Text style={styles.emptySubText}>Scanned QR codes will appear here</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { 
    paddingTop: 80, 
    paddingHorizontal: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  cyan: { color: '#00FFF2' },
  clearAll: { 
    color: '#FF3B30', 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 1.5 
  },

  list: { paddingHorizontal: 20, paddingBottom: 160 },
  cardWrapper: { marginBottom: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 26, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)', 
    overflow: 'hidden' 
  },
  iconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: 'rgba(0, 255, 242, 0.08)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(0, 255, 242, 0.25)' 
  },
  info: { flex: 1, marginLeft: 18 },
  dataText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  dateText: { color: '#555', fontSize: 11, fontWeight: '600', marginTop: 6, letterSpacing: 0.5 },
  
  actions: { flexDirection: 'row', gap: 8 },
  miniBtn: { padding: 8 },

  empty: { 
    marginTop: 180, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#333', 
    fontSize: 14, 
    fontWeight: '900', 
    marginTop: 20, 
    letterSpacing: 2 
  },
  emptySubText: {
    color: '#222',
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 1
  }
});