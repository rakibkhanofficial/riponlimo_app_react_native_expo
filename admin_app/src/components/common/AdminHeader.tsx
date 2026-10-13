import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getBaseUrl, setBaseUrl } from '../../services/api';
import { AdminUser } from '../../types';

interface AdminHeaderProps {
  admin: AdminUser | null;
  onLogout: () => void;
  onOpenSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  onLogout,
  onOpenSidebar,
  title = 'RIPON LIMO',
  subtitle = 'EXECUTIVE ADMIN CONSOLE',
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const [ipModalVisible, setIpModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    getBaseUrl().then(url => {
      setCurrentUrl(url);
      setInputUrl(url);
    });
  }, []);

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) return;
    await setBaseUrl(inputUrl);
    setCurrentUrl(inputUrl);
    setIpModalVisible(false);
    Alert.alert('Server Endpoint Updated', `Backend API points to:\n${inputUrl}`);
  };

  const confirmLogout = () => {
    Alert.alert('Admin Sign Out', 'Are you sure you want to log out of the dispatch console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          {onOpenSidebar && (
            <TouchableOpacity
              style={[styles.menuBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={onOpenSidebar}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={[styles.logoBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, overflow: 'hidden' }]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {/* Server Config Indicator */}
          {/* <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            onPress={() => setIpModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="server-outline" size={16} color={colors.gold} />
          </TouchableOpacity> */}

          {/* Theme Switcher */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.danger, backgroundColor: colors.dangerBg }]}
            onPress={confirmLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin User Sub-bar */}
      {admin && (
        <View style={[styles.adminBar, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.adminInfo}>
            <View style={[styles.roleBadge, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
              <Text style={[styles.roleText, { color: colors.gold }]}>{admin.role}</Text>
            </View>
            <Text style={[styles.adminName, { color: colors.text }]} numberOfLines={1}>
              {admin.name}
            </Text>
            <Text style={[styles.adminEmail, { color: colors.textMuted }]} numberOfLines={1}>
              ({admin.email})
            </Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Live Dispatch</Text>
          </View>
        </View>
      )}

      {/* Server IP Modal */}
      <Modal visible={ipModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="settings-outline" size={18} color={colors.gold} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Next.js Backend Server</Text>
              </View>
              <TouchableOpacity onPress={() => setIpModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Connect the Admin Console to your live Next.js API server running on port 3010.
            </Text>

            <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>API Endpoint URL</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://192.168.1.XX:3010"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={[styles.presetBtn, { borderColor: colors.border }]}
                onPress={() => setInputUrl('http://localhost:3010')}
              >
                <Text style={[styles.presetText, { color: colors.textSecondary }]}>iOS (localhost:3010)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetBtn, { borderColor: colors.border }]}
                onPress={() => setInputUrl('http://10.0.2.2:3010')}
              >
                <Text style={[styles.presetText, { color: colors.textSecondary }]}>Android (10.0.2.2:3010)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                onPress={handleSaveUrl}
              >
                <Text style={styles.saveBtnText}>Save Endpoint</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 12,
    fontWeight: '600',
  },
  adminEmail: {
    fontSize: 11,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  textInput: {
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalActions: {
    alignItems: 'stretch',
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
