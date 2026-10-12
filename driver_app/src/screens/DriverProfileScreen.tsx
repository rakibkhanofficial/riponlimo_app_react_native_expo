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
import { useDriverAuth } from '../context/DriverAuthContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { VehicleAssignmentModal } from '../components/driver/VehicleAssignmentModal'

interface DriverProfileScreenProps {
  onOpenAuth: () => void
}

export const DriverProfileScreen: React.FC<DriverProfileScreenProps> = ({ onOpenAuth }) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme()
  const { driver, logout } = useDriverAuth()
  const { shift } = useDriverRides()

  const [showVehicleModal, setShowVehicleModal] = useState(false)

  const handleCallDispatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Linking.openURL('tel:+16465174942').catch(() => {
      Alert.alert('Dispatch', 'Call +1 (646) 517-4942')
    })
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="CHAUFFEUR PROFILE" subtitle="CREDENTIALS & VEHICLE" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ═══ Profile Identity Card ═══ */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Avatar + Info */}
          <View style={styles.profileIdentity}>
            <View style={[styles.avatarCircle, { backgroundColor: isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.1)', borderColor: isDark ? 'rgba(37,211,102,0.3)' : 'rgba(22,163,74,0.2)' }]}>
              <Text style={[styles.avatarLetter, { color: '#25D366' }]}>
                {driver?.name ? driver.name.charAt(0).toUpperCase() : 'J'}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                {driver?.name || 'John Rivera'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{driver?.email}</Text>
              <Text style={[styles.profilePhone, { color: theme.textSecondary }]}>
                {driver?.phone || '+1 (305) 123-4567'}
              </Text>
            </View>

            <Badge label="CHAUFFEUR" variant="primary" size="sm" />
          </View>

          {/* Stats Row */}
          <View style={styles.statsGrid}>
            {[
              { value: '4.98 ★', label: 'Rating', color: '#F59E0B' },
              { value: '284', label: 'VIP Rides', color: theme.primary },
              { value: 'Active', label: 'TLC License', color: '#25D366' },
            ].map((stat, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: theme.borderSubtle }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══ Vehicle Details Card ═══ */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <MaterialCommunityIcons name="car-limousine" size={18} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Assigned Vehicle</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Daily inspection verified</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowVehicleModal(true)
              }}
              style={[styles.switchCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: theme.borderSubtle }]}
            >
              <Feather name="refresh-cw" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.detailsGrid, { borderTopColor: theme.borderSubtle }]}>
            {[
              { key: 'Vehicle Model', val: shift.vehicleName, icon: 'truck', color: theme.textPrimary },
              { key: 'License Plate', val: shift.vehiclePlate, icon: 'hash', color: theme.primary },
              { key: 'Insurance Status', val: 'Commercial Active', icon: 'shield', color: '#25D366' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.detailRow, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderSubtle }]}>
                <View style={styles.detailLeft}>
                  <View style={[styles.detailIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Feather name={item.icon as any} size={13} color={theme.textMuted} />
                  </View>
                  <Text style={[styles.detailKey, { color: theme.textMuted }]}>{item.key}</Text>
                </View>
                <Text style={[styles.detailVal, { color: item.color }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══ Appearance Mode ═══ */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <Ionicons name="color-palette-outline" size={16} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Display</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>Dark recommended for night runs</Text>
              </View>
            </View>
          </View>

          <View style={[styles.themeRow, { borderTopColor: theme.borderSubtle }]}>
            {[
              { id: 'dark', label: 'Dark', icon: 'moon-outline' },
              { id: 'light', label: 'Light', icon: 'sunny-outline' },
              { id: 'system', label: 'Auto', icon: 'phone-portrait-outline' },
            ].map(item => {
              const isSelected = themeMode === item.id
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
                      backgroundColor: isSelected
                        ? (isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)')
                        : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                      borderColor: isSelected
                        ? (isDark ? 'rgba(37,211,102,0.3)' : 'rgba(22,163,74,0.2)')
                        : theme.borderSubtle,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isSelected ? '#25D366' : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color: isSelected ? (isDark ? '#25D366' : '#16A34A') : theme.textSecondary,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* ═══ Dispatch Hotline ═══ */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)' }]}>
                <Feather name="phone-call" size={14} color="#25D366" />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Operations Hotline</Text>
                <Text style={[styles.sectionSub, { color: theme.textMuted }]}>24/7 dispatch coordinators</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCallDispatch}
            style={[styles.dispatchBtn, { backgroundColor: isDark ? 'rgba(37,211,102,0.08)' : 'rgba(22,163,74,0.06)', borderColor: isDark ? 'rgba(37,211,102,0.2)' : 'rgba(22,163,74,0.15)' }]}
          >
            <View style={[styles.dispatchPhoneCircle, { backgroundColor: isDark ? 'rgba(37,211,102,0.15)' : 'rgba(22,163,74,0.1)' }]}>
              <Feather name="phone" size={15} color="#25D366" />
            </View>
            <Text style={[styles.dispatchBtnText, { color: theme.textPrimary }]}>
              +1 (646) 517-4942
            </Text>
            <Feather name="external-link" size={12} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ═══ Account Actions ═══ */}
        <View style={styles.accountActions}>
          <Button
            title="Switch Chauffeur Account"
            variant="secondary"
            onPress={onOpenAuth}
            icon={<Feather name="refresh-cw" size={16} color={theme.textPrimary} />}
          />
          <Button
            title="Sign Out of Terminal"
            variant="outline"
            onPress={logout}
            icon={<Feather name="log-out" size={16} color={theme.primary} />}
          />
        </View>
      </ScrollView>

      {/* Vehicle Assignment Modal */}
      <VehicleAssignmentModal
        visible={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
      />
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

  /* Profile Card */
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  profileIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 11,
    marginTop: 2,
  },

  /* Stats */
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Shared Section */
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  switchCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Details */
  detailsGrid: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
  },

  /* Theme */
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  themePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 5,
  },
  themePillText: {
    fontSize: 11,
  },

  /* Dispatch */
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dispatchPhoneCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.5,
  },

  /* Actions */
  accountActions: {
    marginTop: 6,
    gap: 10,
  },
})
