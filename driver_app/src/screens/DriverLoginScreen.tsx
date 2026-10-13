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
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverAuth } from '../context/DriverAuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

interface DriverLoginScreenProps {
  onLoginSuccess?: () => void
}

export const DriverLoginScreen: React.FC<DriverLoginScreenProps> = ({ onLoginSuccess }) => {
  const { theme, isDark } = useTheme()
  const { login, loginDemo } = useDriverAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your chauffeur email or ID.')
      return
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your security password.')
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
      setErrorMessage(err.message || 'Invalid chauffeur credentials. Please try again or tap Instant Demo.')
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
      await loginDemo()
      if (onLoginSuccess) onLoginSuccess()
    } catch (e: any) {
      setErrorMessage(e.message || 'Demo sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleFillDemoCredentials = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEmail('driver1@riponlimo.com')
    setPassword('password123')
    setErrorMessage(null)
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
          {/* ─── Top Brand Header ─── */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.3)',
              }}
              resizeMode="contain"
            />

            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>RIPON CHAUFFEUR</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              EXECUTIVE FLEET TERMINAL
            </Text>

            <View
              style={[
                styles.badgeRow,
                {
                  backgroundColor: isDark ? 'rgba(37, 211, 102, 0.1)' : 'rgba(22, 163, 74, 0.08)',
                  borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : 'rgba(22, 163, 74, 0.2)',
                },
              ]}
            >
              <View style={styles.onlineDot} />
              <Text style={[styles.badgeText, { color: isDark ? '#25D366' : '#16A34A' }]}>
                DISPATCH NETWORK ACTIVE
              </Text>
            </View>
          </View>

          {/* ─── Login Card ─── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                shadowColor: isDark ? '#000000' : '#64748B',
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardHeaderIcon,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
                ]}
              >
                <Feather name="shield" size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
                  Chauffeur Authentication
                </Text>
                <Text style={[styles.formSubtitle, { color: theme.textMuted }]}>
                  Sign in to access assigned runs & manifest
                </Text>
              </View>
            </View>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.inputsGroup}>
              <Input
                label="Chauffeur ID / Email"
                value={email}
                onChangeText={t => {
                  setEmail(t)
                  setErrorMessage(null)
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={<Feather name="mail" size={15} color={theme.primary} />}
                placeholder="driver1@riponlimo.com"
              />

              <Input
                label="Security Password"
                value={password}
                onChangeText={t => {
                  setPassword(t)
                  setErrorMessage(null)
                }}
                isPassword
                leftIcon={<Feather name="lock" size={15} color={theme.primary} />}
                placeholder="Enter chauffeur password"
              />

              <View style={{ marginTop: 6 }}>
                <Button
                  title={loading ? 'Authenticating...' : 'Sign In to Chauffeur Portal'}
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  variant="primary"
                />
              </View>

              {/* ─── Fast Demo Sign In Section ─── */}
              <View style={[styles.demoSection, { borderTopColor: theme.borderSubtle }]}>
                <Text style={[styles.demoSectionLabel, { color: theme.textMuted }]}>
                  TEST & DEMO ACCESS
                </Text>

                <TouchableOpacity
                  onPress={handleQuickDemo}
                  style={[
                    styles.demoCard,
                    {
                      backgroundColor: isDark ? 'rgba(37, 211, 102, 0.08)' : 'rgba(22, 163, 74, 0.06)',
                      borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : 'rgba(22, 163, 74, 0.2)',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.demoIconCircle,
                      { backgroundColor: isDark ? 'rgba(37, 211, 102, 0.18)' : 'rgba(22, 163, 74, 0.12)' },
                    ]}
                  >
                    <Ionicons name="flash" size={16} color="#25D366" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.demoTitle, { color: theme.textPrimary }]}>
                      Instant Demo Chauffeur
                    </Text>
                    <Text style={[styles.demoSub, { color: isDark ? '#25D366' : '#16A34A' }]}>
                      John Rivera • Senior Chauffeur
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={16} color="#25D366" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFillDemoCredentials}
                  style={[styles.fillDemoBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: theme.borderSubtle }]}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-3" size={12} color={theme.textSecondary} />
                  <Text style={[styles.fillDemoText, { color: theme.textSecondary }]}>
                    Auto-fill demo credentials into form
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ─── Footer Security Badges ─── */}
          <View style={styles.footerContainer}>
            <View style={styles.footerItem}>
              <Feather name="shield" size={12} color={theme.textMuted} />
              <Text style={[styles.footerText, { color: theme.textMuted }]}>TLC License Verified</Text>
            </View>
            <View style={[styles.footerDivider, { backgroundColor: theme.borderSubtle }]} />
            <View style={styles.footerItem}>
              <Feather name="navigation" size={12} color={theme.textMuted} />
              <Text style={[styles.footerText, { color: theme.textMuted }]}>Mapbox Live HUD</Text>
            </View>
            <View style={[styles.footerDivider, { backgroundColor: theme.borderSubtle }]} />
            <View style={styles.footerItem}>
              <Feather name="lock" size={12} color={theme.textMuted} />
              <Text style={[styles.footerText, { color: theme.textMuted }]}>256-Bit Encrypted</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  /* Brand Header */
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGlowRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* Card */
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  formSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputsGroup: {
    gap: 14,
  },

  /* Demo Section */
  demoSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
    gap: 8,
  },
  demoSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  demoSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  fillDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  fillDemoText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Footer */
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 26,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDivider: {
    width: 1,
    height: 12,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
