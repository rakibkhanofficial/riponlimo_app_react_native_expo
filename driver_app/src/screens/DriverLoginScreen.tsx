import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverAuth } from '../context/DriverAuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

interface DriverLoginScreenProps {
  onLoginSuccess?: () => void
}

export const DriverLoginScreen: React.FC<DriverLoginScreenProps> = ({ onLoginSuccess }) => {
  const { theme, isDark } = useTheme()
  const { login } = useDriverAuth()

  const [email, setEmail] = useState('driver1@riponlimo.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both chauffeur email and security password.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await login(email.trim(), password)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      if (onLoginSuccess) onLoginSuccess()
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid chauffeur credentials. Please verify or use Quick Demo.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await login('driver1@riponlimo.com', 'password123')
      if (onLoginSuccess) onLoginSuccess()
    } catch (e: any) {
      setErrorMessage(e.message || 'Demo sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Header */}
          <View style={styles.brandContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="steering" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>RIPON CHAUFFEUR</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>EXECUTIVE FLEET TERMINAL</Text>
            <View style={styles.badgeRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.badgeText}>DISPATCH SYSTEM ONLINE</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.formTitle, { color: theme.textPrimary }]}>Terminal Authentication</Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
              Enter authorized chauffeur credentials to access your daily manifest, assign vehicles, and manage assigned runs.
            </Text>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={{ gap: 14, marginTop: 10 }}>
              <Input
                label="Chauffeur ID / Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t)
                  setErrorMessage(null)
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={<Feather name="mail" size={15} color={theme.textPrimary} />}
                placeholder="driver1@riponlimo.com"
              />

              <Input
                label="Security Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t)
                  setErrorMessage(null)
                }}
                isPassword
                leftIcon={<Feather name="lock" size={15} color={theme.textPrimary} />}
                placeholder="••••••••••••"
              />

              <View style={{ marginTop: 8 }}>
                <Button
                  title={loading ? 'Authenticating...' : 'Sign In to Chauffeur Portal'}
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  variant="primary"
                />
              </View>

              <TouchableOpacity
                onPress={handleQuickDemo}
                style={styles.demoButton}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={15} color="#25D366" />
                <Text style={styles.demoButtonText}>
                  Instant Demo Chauffeur Sign In (John Rivera)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Security Badges */}
          <View style={styles.footerContainer}>
            <View style={styles.footerItem}>
              <Feather name="shield" size={12} color={theme.textMuted} />
              <Text style={[styles.footerText, { color: theme.textMuted }]}>TLC License Verified</Text>
            </View>
            <View style={[styles.footerDivider, { backgroundColor: theme.border }]} />
            <View style={styles.footerItem}>
              <Feather name="navigation" size={12} color={theme.textMuted} />
              <Text style={[styles.footerText, { color: theme.textMuted }]}>Mapbox Live Route HUD</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#161616',
    borderWidth: 1.5,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#888888',
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#25D366',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    marginTop: 6,
  },
  demoButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#25D366',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#333333',
  },
  footerText: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
})
