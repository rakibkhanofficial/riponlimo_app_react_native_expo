import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/common/Header'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

interface ProfileScreenProps {
  onOpenAuth: () => void
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenAuth }) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const handleCallConcierge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Linking.openURL('tel:+16465174942').catch(() => {
      Alert.alert('Concierge', 'Call +1 (646) 517-4942')
    })
  }

  const handleSMSConcierge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Linking.openURL('sms:+16465174942').catch(() => {
      Alert.alert('Concierge', 'SMS +1 (646) 517-4942')
    })
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="CLIENT ACCOUNT" subtitle="PREFERENCES & SECURITY" showThemeToggle={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        {isAuthenticated && user ? (
          <Card style={styles.userCard} highlighted>
            <View style={styles.userRow}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.primary }]}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name || 'Valued Client'}</Text>
                <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user.email}</Text>
                {user.phone ? (
                  <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user.phone}</Text>
                ) : null}
              </View>
              <Badge label={user.role} variant="primary" size="sm" />
            </View>

            {user.referralCode && (
              <View style={[styles.referralBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                <Feather name="gift" size={15} color={theme.primary} />
                <Text style={[styles.referralText, { color: theme.textSecondary }]}>
                  VIP Referral Code:{' '}
                  <Text style={{ color: theme.primary, fontWeight: '800' }}>{user.referralCode}</Text>
                </Text>
              </View>
            )}
          </Card>
        ) : (
          <Card style={styles.guestCard}>
            <View style={styles.guestContent}>
              <View style={[styles.guestIcon, { backgroundColor: theme.primaryLight }]}>
                <Feather name="user" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>Guest Client Mode</Text>
              <Text style={[styles.guestSubtitle, { color: theme.textMuted }]}>
                Sign in to manage your rides, save payment preferences, and access priority concierge privileges.
              </Text>
              <View style={{ marginTop: 14, width: '100%' }}>
                <Button title="Sign In or Register" onPress={onOpenAuth} size="md" />
              </View>
            </View>
          </Card>
        )}

        {/* Theme Preferences */}
        <Card
          title="Display Appearance"
          subtitle="Customize dark or light mode palette"
          icon={<Ionicons name="color-palette-outline" size={16} color={theme.primary} />}
        >
          <View style={styles.themeRow}>
            {[
              { id: 'dark', label: 'Dark Mode', icon: 'moon-outline' },
              { id: 'light', label: 'Light Mode', icon: 'sunny-outline' },
              { id: 'system', label: 'System Match', icon: 'phone-portrait-outline' },
            ].map(item => {
              const isSelected = themeMode === item.id
              const activeTextColor = isDark ? '#000000' : '#FFFFFF'
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setThemeMode(item.id as any)
                  }}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isSelected ? activeTextColor : theme.textPrimary}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color: isSelected ? activeTextColor : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Card>

        {/* 24/7 VIP Chauffeur Dispatch Contact */}
        <Card
          title="24/7 Concierge & Dispatch"
          subtitle="Direct executive liaison for immediate requests"
          icon={<Feather name="phone-call" size={16} color={theme.primary} />}
        >
          <Text style={[styles.dispatchText, { color: theme.textSecondary }]}>
            Call or message our central operations desk for last-minute modifications, multi-car motorcades, or security detail chauffeur requests.
          </Text>

          <View style={styles.dispatchButtonsRow}>
            <TouchableOpacity
              onPress={handleCallConcierge}
              style={[styles.dispatchBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
            >
              <Feather name="phone" size={15} color={theme.primary} style={styles.dispatchBtnIcon} />
              <Text
                style={[styles.dispatchBtnText, { color: theme.primary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                (646) 517-4942
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSMSConcierge}
              style={[styles.dispatchBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Feather name="message-square" size={15} color={theme.textPrimary} style={styles.dispatchBtnIcon} />
              <Text
                style={[styles.dispatchBtnText, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                Send SMS
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Sign Out Action */}
        {isAuthenticated && (
          <View style={{ marginTop: 10 }}>
            <Button
              title="Sign Out of Account"
              variant="outline"
              onPress={logout}
              icon={<Feather name="log-out" size={16} color={theme.primary} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  referralBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 14,
  },
  referralText: {
    fontSize: 12,
  },
  guestCard: {
    marginBottom: 8,
  },
  guestContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestIcon: {
    width: 50,
    height: 50,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  guestSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themePill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  themePillText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dispatchText: {
    fontSize: 12,
    lineHeight: 18,
  },
  dispatchButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dispatchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 2,
    borderWidth: 1,
  },
  dispatchBtnIcon: {
    marginRight: 2,
  },
  dispatchBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
