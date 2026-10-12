import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverAuth } from '../context/DriverAuthContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Badge } from '../components/common/Badge'
import { VehicleAssignmentModal } from '../components/driver/VehicleAssignmentModal'
import { driverApi, DEFAULT_BASE_URL } from '../config/api'

interface DriverProfileScreenProps {
  onOpenAuth: () => void
}

export const DriverProfileScreen: React.FC<DriverProfileScreenProps> = ({ onOpenAuth }) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme()
  const { driver, logout } = useDriverAuth()
  const { shift } = useDriverRides()

  const [apiUrl, setApiUrl] = useState(driverApi.getBaseUrl())
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)

  const handleSaveApiUrl = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await driverApi.setBaseUrl(apiUrl)
      Alert.alert('API Updated', `Backend API URL saved: ${apiUrl}`)
      setShowApiConfig(false)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    }
  }

  const handleResetApiUrl = async () => {
    setApiUrl(DEFAULT_BASE_URL)
    await driverApi.setBaseUrl(DEFAULT_BASE_URL)
    Alert.alert('API Reset', `Reset to default: ${DEFAULT_BASE_URL}`)
    setShowApiConfig(false)
  }

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
        {/* Driver Profile Card */}
        <Card highlighted style={styles.cardMargin}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {driver?.name ? driver.name.charAt(0).toUpperCase() : 'J'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                {driver?.name || 'John Rivera'}
              </Text>
              <Text style={[styles.driverEmail, { color: theme.textMuted }]}>{driver?.email}</Text>
              <Text style={[styles.driverPhone, { color: theme.textSecondary }]}>
                {driver?.phone || '+1 (305) 123-4567'}
              </Text>
            </View>
            <Badge label="CHAUFFEUR" variant="primary" size="sm" />
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.primary }]}>4.98 ★</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Rating</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.textPrimary }]}>284</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>VIP Rides</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: theme.success }]}>Active</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>TLC License</Text>
            </View>
          </View>
        </Card>

        {/* Assigned Vehicle Card */}
        <Card
          title="Assigned Vehicle Details"
          subtitle="Daily livery inspection verified"
          icon={<MaterialCommunityIcons name="car-limousine" size={18} color={theme.primary} />}
          rightAction={
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowVehicleModal(true)
              }}
              style={[styles.switchVehiclePill, { borderColor: theme.border }]}
            >
              <Feather name="refresh-cw" size={12} color={theme.primary} />
              <Text style={[styles.switchVehicleText, { color: theme.primary }]}>SWITCH</Text>
            </TouchableOpacity>
          }
        >
          <View style={styles.vehicleDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Vehicle Model</Text>
              <Text style={[styles.detailVal, { color: theme.textPrimary }]}>{shift.vehicleName}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>License Plate</Text>
              <Text style={[styles.detailVal, { color: theme.primary }]}>{shift.vehiclePlate}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Livery Insurance</Text>
              <Text style={[styles.detailVal, { color: theme.success }]}>Commercial Active</Text>
            </View>
          </View>
        </Card>

        {/* Appearance Mode */}
        <Card
          title="Display Appearance"
          subtitle="Dark mode recommended for night airport runs"
          icon={<Ionicons name="color-palette-outline" size={16} color={theme.primary} />}
        >
          <View style={styles.themeRow}>
            {[
              { id: 'dark', label: 'Dark Mode', icon: 'moon-outline' },
              { id: 'light', label: 'Light Mode', icon: 'sunny-outline' },
              { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
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
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isSelected ? '#0A0D14' : theme.textPrimary}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color: isSelected ? '#0A0D14' : theme.textPrimary,
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

        {/* 24/7 Central Dispatch Liaison */}
        <Card
          title="Central Operations Hotline"
          subtitle="Direct line to dispatch coordinators"
          icon={<Feather name="phone-call" size={16} color={theme.primary} />}
        >
          <TouchableOpacity
            onPress={handleCallDispatch}
            style={[styles.dispatchBtn, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
          >
            <Feather name="phone" size={16} color={theme.primary} />
            <Text style={[styles.dispatchBtnText, { color: theme.primary }]}>
              Call Dispatch: +1 (646) 517-4942
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Backend Endpoint Config */}
        <Card
          title="Next.js Backend Server"
          subtitle="Configure live API connection endpoint"
          icon={<Feather name="server" size={16} color={theme.primary} />}
          rightAction={
            <TouchableOpacity onPress={() => setShowApiConfig(!showApiConfig)}>
              <Feather
                name={showApiConfig ? 'chevron-up' : 'settings'}
                size={16}
                color={theme.primary}
              />
            </TouchableOpacity>
          }
        >
          <View style={styles.apiStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.apiUrlText, { color: theme.textSecondary }]} numberOfLines={1}>
              {driverApi.getBaseUrl()}
            </Text>
          </View>

          {showApiConfig && (
            <View style={{ marginTop: 12 }}>
              <Input
                label="Backend URL (Port 3010)"
                value={apiUrl}
                onChangeText={setApiUrl}
                placeholder="http://localhost:3010 or http://192.168.x.x:3010"
              />
              <View style={styles.apiActionRow}>
                <TouchableOpacity
                  onPress={handleResetApiUrl}
                  style={[styles.apiResetBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.apiResetText, { color: theme.textMuted }]}>Reset Default</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveApiUrl}
                  style={[styles.apiSaveBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.apiSaveText}>Save Endpoint</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* Switch Chauffeur Account */}
        <View style={{ marginTop: 10, gap: 10 }}>
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
  switchVehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  switchVehicleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  cardMargin: {
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
  },
  driverEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  driverPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  vehicleDetails: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 12,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themePill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  themePillText: {
    fontSize: 11,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dispatchBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  apiStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  apiUrlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  apiActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  apiResetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  apiResetText: {
    fontSize: 11,
  },
  apiSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  apiSaveText: {
    color: '#0A0D14',
    fontSize: 11,
    fontWeight: '700',
  },
})
