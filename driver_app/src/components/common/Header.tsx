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
        <TouchableOpacity
          onPress={handleDutyToggle}
          activeOpacity={0.8}
          style={styles.logoBadgeContainer}
        >
          <View style={[styles.logoBadge, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.logoLetter, { color: theme.textPrimary }]}>R</Text>
          </View>
          {/* Active status indicator dot on bottom corner of the logo */}
          <View
            style={[
              styles.dutyDotBadge,
              {
                backgroundColor: shift.isOnline ? theme.driverActive : theme.textMuted,
                borderColor: theme.background,
              },
            ]}
          />
        </TouchableOpacity>
        <View>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            RIPON <Text style={{ color: theme.primary }}>CHAUFFEUR</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
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
          style={[styles.profileButton, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
        >
          <Text style={[styles.userInitial, { color: theme.textPrimary }]}>
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
  logoBadgeContainer: {
    position: 'relative',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyDotBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
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
