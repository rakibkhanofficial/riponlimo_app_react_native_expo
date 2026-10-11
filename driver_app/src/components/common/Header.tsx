import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverAuth } from '../../context/DriverAuthContext'
import { useDriverRides } from '../../context/DriverRidesContext'

interface HeaderProps {
  title?: string
  subtitle?: string
  onProfilePress?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RIPON CHAUFFEUR',
  subtitle = 'EXECUTIVE DRIVER PORTAL',
  onProfilePress,
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { driver } = useDriverAuth()
  const { shift, toggleOnline } = useDriverRides()

  const handleDutyToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleOnline()
  }

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleTheme()
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.borderSubtle }]}>
      <View style={styles.leftRow}>
        <View style={[styles.logoBadge, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.logoLetter, { color: theme.primary }]}>R</Text>
        </View>
        <View>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            RIPON <Text style={{ color: theme.primary }}>CHAUFFEUR</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* On/Off Duty Toggle Pill */}
        <TouchableOpacity
          onPress={handleDutyToggle}
          style={[
            styles.dutyPill,
            {
              backgroundColor: shift.isOnline ? theme.driverActiveBg : theme.surfaceSubtle,
              borderColor: shift.isOnline ? theme.driverActive : theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.dutyDot,
              { backgroundColor: shift.isOnline ? theme.driverActive : theme.textMuted },
            ]}
          />
          <Text
            style={[
              styles.dutyText,
              { color: shift.isOnline ? theme.driverActive : theme.textMuted },
            ]}
          >
            {shift.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={handleThemeToggle}
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>

        {/* Chauffeur Avatar */}
        <TouchableOpacity
          onPress={onProfilePress}
          style={[styles.profileButton, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
        >
          <Text style={[styles.userInitial, { color: theme.primary }]}>
            {driver?.name ? driver.name.charAt(0).toUpperCase() : 'C'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dutyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dutyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 14,
    fontWeight: '800',
  },
})
