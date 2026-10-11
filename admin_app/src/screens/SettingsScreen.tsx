import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminUser } from '../types';
import { getBaseUrl, setBaseUrl } from '../services/api';

interface SettingsScreenProps {
  admin: AdminUser | null;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ admin, onLogout }) => {
  const { colors, mode, toggleTheme } = useTheme();

  const [apiUrl, setApiUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    getBaseUrl().then(url => {
      setApiUrl(url);
      setInputUrl(url);
    });
  }, []);

  const handleSaveApi = async () => {
    if (!inputUrl.trim()) return;
    await setBaseUrl(inputUrl);
    setApiUrl(inputUrl);
    setModalVisible(false);
    Alert.alert('Configuration Saved', `Target backend updated to:\n${inputUrl}`);
  };

  const confirmLogout = () => {
    Alert.alert('Admin Sign Out', 'Confirm logging out of the Ripon Limo Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Admin Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
          <Ionicons name="shield-checkmark" size={28} color={colors.gold} />
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.name, { color: colors.text }]}>{admin?.name || 'Administrator'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{admin?.email || 'admin@riponlimo.com'}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
            <Text style={[styles.roleText, { color: colors.gold }]}>{admin?.role || 'ADMIN'}</Text>
          </View>
        </View>
      </View>

      {/* System & Dispatch Settings */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>DISPATCH & SYSTEM CONFIGURATION</Text>

      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Backend API URL */}
        <TouchableOpacity style={styles.settingItem} onPress={() => setModalVisible(true)}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="server-outline" size={18} color={colors.info} />
            </View>
            <View>
              <Text style={[styles.settingName, { color: colors.text }]}>Next.js Backend API</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Theme Mode */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.goldBg }]}>
              <Ionicons
                name={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={colors.gold}
              />
            </View>
            <View>
              <Text style={[styles.settingName, { color: colors.text }]}>Luxury Dark Theme</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                {mode === 'dark' ? 'Deep Obsidian Gold Enabled' : 'Light Executive Mode'}
              </Text>
            </View>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            thumbColor={mode === 'dark' ? colors.gold : '#FFFFFF'}
            trackColor={{ false: '#CBD5E1', true: colors.goldDark }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* SMS Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
              <Ionicons name="chatbubbles-outline" size={18} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.settingName, { color: colors.text }]}>Twilio SMS Dispatch Alerts</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Auto-notify clients on confirmation & dispatch
              </Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </View>
      </View>

      {/* Security & Access Policies */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SECURITY & ROLES</Text>

      <View style={[styles.settingGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.policyRow}>
          <Ionicons name="key-outline" size={16} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.policyTitle, { color: colors.text }]}>Role-Based Access Control</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
              Superadmin can delete/promote users. Operations Admin manages bookings, cars & dispatch.
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.policyRow}>
          <Ionicons name="shield-outline" size={16} color={colors.info} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.policyTitle, { color: colors.text }]}>End-to-End Encryption</Text>
            <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
              All passenger contact details and flight telemetry encrypted in transit.
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
        onPress={confirmLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out of Admin Console</Text>
      </TouchableOpacity>

      {/* Version Tag */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          Ripon Limo Admin Suite v1.0.0 (Production)
        </Text>
        <Text style={[styles.versionText, { color: colors.gold }]}>
          Expo SDK 57 • Next.js Fullstack Sync
        </Text>
      </View>

      {/* Endpoint Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Backend URL</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Specify your host machine IP running `npm run dev` on port 3010.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.1.XX:3010"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.gold }]}
                onPress={handleSaveApi}
              >
                <Text style={{ color: '#0B0E14', fontWeight: '700' }}>Save Target</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  email: {
    fontSize: 12,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 2,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  settingGroup: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingName: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  policyRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  policyDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
