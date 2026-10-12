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
import { useDriverAuth } from '../context/DriverAuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

interface DriverAuthModalProps {
  visible: boolean
  onClose: () => void
}

export const DriverAuthModal: React.FC<DriverAuthModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme()
  const { login } = useDriverAuth()

  const [email, setEmail] = useState('driver1@riponlimo.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your driver email and password.')
      return
    }

    setLoading(true)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      await login(email.trim(), password)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      onClose()
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid chauffeur credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await login('driver1@riponlimo.com', 'password123')
      onClose()
    } catch (e: any) {
      Alert.alert('Demo Error', e.message)
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
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.brand, { color: theme.primary }]}>RIPON CHAUFFEUR</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>DRIVER CREDENTIAL ACCESS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Input
              label="Chauffeur ID / Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Feather name="mail" size={15} color={theme.primary} />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Feather name="lock" size={15} color={theme.primary} />}
            />

            <View style={{ marginTop: 14 }}>
              <Button
                title="Sign In to Chauffeur Portal"
                onPress={handleLogin}
                loading={loading}
                size="lg"
              />
            </View>

            <TouchableOpacity
              onPress={handleQuickDemo}
              style={styles.demoBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={15} color="#25D366" />
              <Text style={styles.demoBtnText}>
                Instant Demo Chauffeur Sign In (John Rivera)
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    marginTop: 14,
    marginBottom: 20,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#25D366',
  },
})
