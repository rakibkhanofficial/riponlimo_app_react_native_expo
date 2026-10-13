import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { AdminUser } from '../types';

interface AdminAuthScreenProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({ onLoginSuccess }) => {
  const { colors, mode, toggleTheme } = useTheme();

  const [email, setEmail] = useState('admin@riponlimo.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const targetEmail = overrideEmail || email;
    const targetPass = overridePass || password;

    if (!targetEmail.trim() || !targetPass.trim()) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await AdminApi.login(targetEmail, targetPass);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify admin privileges.');
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Bar with Theme Toggle */}
        <View style={styles.topBar}>
          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.gold} />
            <Text style={[styles.secureText, { color: colors.gold }]}>DISPATCH ACCESS ONLY</Text>
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.brandBox}>
          <Image
            source={require('../../assets/icon.png')}
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              marginBottom: 14,
              borderWidth: 1.5,
              borderColor: colors.gold,
            }}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitle, { color: colors.text }]}>RIPON LIMO</Text>
          <Text style={[styles.brandSubtitle, { color: colors.gold }]}>
            EXECUTIVE COMMAND & FLEET PORTAL
          </Text>
          <Text style={[styles.brandDesc, { color: colors.textSecondary }]}>
            High-priority dispatching, real-time analytics, fleet assignment & chauffeur roster control.
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {errorMsg && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>ADMIN EMAIL IDENTIFIER</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.gold} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@riponlimo.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SECURITY CLEARANCE KEY</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="key-outline" size={18} color={colors.gold} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.buttonText} size="small" />
            ) : (
              <Text style={[styles.loginBtnText, { color: colors.buttonText }]}>
                ACCESS DISPATCH CONSOLE
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Demo Credentials */}
        <View style={styles.demoSection}>
          <Text style={[styles.demoTitle, { color: colors.textMuted }]}>FAST DEMO ADMIN CLEARANCE</Text>
          <View style={styles.demoCardsRow}>
            <TouchableOpacity
              style={[
                styles.demoCard,
                { backgroundColor: colors.surface, borderColor: email.includes('super') ? colors.border : colors.gold },
              ]}
              onPress={() => fillCredentials('admin@riponlimo.com')}
            >
              <Ionicons name="shield-outline" size={16} color={colors.gold} />
              <Text style={[styles.demoRole, { color: colors.text }]}>Operations Admin</Text>
              <Text style={[styles.demoEmail, { color: colors.textMuted }]}>admin@riponlimo.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoCard,
                { backgroundColor: colors.surface, borderColor: email.includes('super') ? colors.gold : colors.border },
              ]}
              onPress={() => fillCredentials('superadmin@riponlimo.com')}
            >
              <Ionicons name="ribbon-outline" size={16} color={colors.gold} />
              <Text style={[styles.demoRole, { color: colors.text }]}>Super Executive</Text>
              <Text style={[styles.demoEmail, { color: colors.textMuted }]}>superadmin@riponlimo.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  secureText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 16,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  brandDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  demoSection: {
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  demoCardsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  demoCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoEmail: {
    fontSize: 10,
  },
});
