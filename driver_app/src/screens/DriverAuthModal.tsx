import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverAuth } from '../context/DriverAuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

interface DriverAuthModalProps {
  visible: boolean
  onClose: () => void
}

export const DriverAuthModal: React.FC<DriverAuthModalProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme()
  const { login } = useDriverAuth()

  const [email, setEmail] = useState('driver1@riponlimo.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter chauffeur email and security password.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await login(email.trim(), password)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid chauffeur credentials.')
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
      onClose()
    } catch (e: any) {
      setErrorMessage(e.message || 'Demo sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              shadowColor: isDark ? '#000000' : '#64748B',
            },
          ]}
        >
          {/* Sheet Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' },
              ]}
            />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconCircle,
                  {
                    backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : 'rgba(22, 163, 74, 0.08)',
                  },
                ]}
              >
                <MaterialCommunityIcons name="steering" size={20} color="#25D366" />
              </View>
              <View>
                <Text style={[styles.brand, { color: theme.textPrimary }]}>SWITCH CHAUFFEUR</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  EXECUTIVE FLEET ACCESS
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Feather name="x" size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                placeholder="••••••••••••"
              />

              <View style={{ marginTop: 6 }}>
                <Button
                  title={loading ? 'Authenticating...' : 'Sign In Chauffeur'}
                  onPress={handleLogin}
                  loading={loading}
                  size="lg"
                  variant="primary"
                />
              </View>

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
                    John Rivera • TLC #884920
                  </Text>
                </View>
                <Feather name="arrow-right" size={16} color="#25D366" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
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
    marginBottom: 20,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
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
})
