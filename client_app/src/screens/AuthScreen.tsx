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
  Image,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

interface AuthScreenProps {
  visible: boolean
  onClose: () => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const { theme } = useTheme()
  const { login, register, loginWithGoogle } = useAuth()

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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const clientId =
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''

      if (!clientId) {
        Alert.alert(
          'Google Sign-In Configuration',
          'Google Client ID is not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your .env file.'
        )
        return
      }

      // Generate OAuth redirect URI for Expo Go / standalone app
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'riponlimo',
      })

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token%20id_token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&nonce=${Date.now()}` +
        `&prompt=select_account`

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

      if (result.type === 'success' && result.url) {
        // Extract parameters from fragment (#access_token=... or ?access_token=...)
        const urlParams = new URLSearchParams(
          result.url.includes('#') ? result.url.split('#')[1] : result.url.split('?')[1] || ''
        )
        const accessToken = urlParams.get('access_token')
        const idToken = urlParams.get('id_token')

        if (accessToken || idToken) {
          // Fetch the authentic user profile directly from Google
          let profile: any = {}
          if (accessToken) {
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
              if (userInfoRes.ok) {
                profile = await userInfoRes.json()
              }
            } catch (fetchErr) {
              console.warn('Failed to fetch Google userinfo directly:', fetchErr)
            }
          }

          const userEmail = profile.email || 'client@gmail.com'
          const userName = profile.name || profile.given_name || 'VIP Client'
          const userPicture = profile.picture
          const googleSub = profile.sub || idToken

          await loginWithGoogle({
            accessToken: accessToken || undefined,
            idToken: idToken || undefined,
            email: userEmail,
            name: userName,
            image: userPicture,
            googleId: googleSub,
          })

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          Alert.alert('Sign In Successful', `Signed in as ${userEmail}`)
          onClose()
          return
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User voluntarily dismissed the Google login sheet
        return
      }

      // If user cancelled or OAuth could not complete browser callback
      Alert.alert('Google Sign-In', 'Google sign-in was canceled or could not be completed.')
    } catch (err: any) {
      console.warn('Google sign in error:', err)
      Alert.alert('Google Sign-In Error', err.message || 'Unable to sign in with Google.')
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 38, height: 38, borderRadius: 10 }}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.brandTitle, { color: theme.primary }]}>RIPON LIMO</Text>
                <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
                  {mode === 'LOGIN' ? 'CLIENT PORTAL SIGN IN' : 'CREATE CLIENT ACCOUNT'}
                </Text>
              </View>
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

                {/* Google Sign In */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
                  <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR CONTINUE WITH</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  style={styles.googleBtn}
                  activeOpacity={0.85}
                >
                  <Image
                    source={require('../assets/google-logo.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

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

                {/* Google Sign In */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
                  <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR CONTINUE WITH</Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  style={styles.googleBtn}
                  activeOpacity={0.85}
                >
                  <Image
                    source={require('../assets/google-logo.png')}
                    style={styles.googleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '92%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 2,
    borderWidth: 1,
    padding: 2,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 2,
    alignItems: 'center',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  formSection: {
    gap: 4,
    paddingBottom: 24,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 14,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    gap: 12,
    marginTop: 4,
    marginBottom: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    color: '#3C4043',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
