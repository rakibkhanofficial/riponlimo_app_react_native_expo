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
  Alert,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

interface AuthScreenProps {
  visible: boolean
  onClose: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const { theme } = useTheme()
  const { login, register } = useAuth()

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [loading, setLoading] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await login(email.trim(), password)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onClose()
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Full name, email, and password are required.')
      return
    }

    setLoading(true)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await register(name.trim(), email.trim(), password, phone.trim())
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onClose()
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not complete registration.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setLoading(true)
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await login('demo@riponlimo.com', 'password123')
      onClose()
    } catch (err: any) {
      Alert.alert('Demo Error', err.message)
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
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.brandTitle, { color: theme.primary }]}>RIPON LIMO</Text>
              <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
                {mode === 'LOGIN' ? 'CLIENT PORTAL SIGN IN' : 'CREATE CLIENT ACCOUNT'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Tabs */}
            <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setMode('LOGIN')}
                style={[
                  styles.tabBtn,
                  mode === 'LOGIN' && [styles.activeTab, { backgroundColor: theme.surface, borderColor: theme.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: mode === 'LOGIN' ? theme.primary : theme.textMuted,
                      fontWeight: mode === 'LOGIN' ? '700' : '500',
                    },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('REGISTER')}
                style={[
                  styles.tabBtn,
                  mode === 'REGISTER' && [styles.activeTab, { backgroundColor: theme.surface, borderColor: theme.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: mode === 'REGISTER' ? theme.primary : theme.textMuted,
                      fontWeight: mode === 'REGISTER' ? '700' : '500',
                    },
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'LOGIN' ? (
              <View style={styles.formSection}>
                <Input
                  label="Email Address"
                  placeholder="client@luxury.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Feather name="mail" size={15} color={theme.primary} />}
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  leftIcon={<Feather name="lock" size={15} color={theme.primary} />}
                />

                <View style={{ marginTop: 14 }}>
                  <Button
                    title="Sign In to Portal"
                    onPress={handleLogin}
                    loading={loading}
                    size="lg"
                  />
                </View>

                {/* Quick Demo One-Tap Button */}
                <TouchableOpacity
                  onPress={handleDemoSignIn}
                  style={[styles.demoBtn, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
                >
                  <Ionicons name="flash-outline" size={15} color={theme.primary} />
                  <Text style={[styles.demoBtnText, { color: theme.primary }]}>
                    Instant Demo Client Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formSection}>
                <Input
                  label="Full Name"
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<Feather name="user" size={15} color={theme.primary} />}
                />

                <Input
                  label="Email Address"
                  placeholder="client@luxury.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Feather name="mail" size={15} color={theme.primary} />}
                />

                <Input
                  label="Mobile Phone"
                  placeholder="+1 (555) 019-2834"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  leftIcon={<Feather name="phone" size={15} color={theme.primary} />}
                />

                <Input
                  label="Password"
                  placeholder="Create a secure password"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  leftIcon={<Feather name="lock" size={15} color={theme.primary} />}
                />

                <View style={{ marginTop: 14 }}>
                  <Button
                    title="Create VIP Account"
                    onPress={handleRegister}
                    loading={loading}
                    size="lg"
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
  },
  formSection: {
    gap: 4,
    paddingBottom: 20,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
