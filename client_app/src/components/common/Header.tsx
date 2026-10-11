import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  title?: string
  subtitle?: string
  showThemeToggle?: boolean
  showBack?: boolean
  onBack?: () => void
  onProfilePress?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RIPON LIMO',
  subtitle = 'EXECUTIVE CHAUFFEUR SERVICE',
  showThemeToggle = true,
  showBack = false,
  onBack,
  onProfilePress,
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleTheme()
  }

  const handleProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onProfilePress) onProfilePress()
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.borderSubtle }]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.logoBadge, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.logoLetter, { color: theme.primary }]}>R</Text>
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            {title.includes('RIPON') ? (
              <>
                RIPON <Text style={{ color: theme.primary }}>LIMO</Text>
              </>
            ) : (
              title
            )}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightRow}>
        {showThemeToggle && (
          <TouchableOpacity
            onPress={handleThemeToggle}
            accessibilityLabel="Toggle Theme"
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={theme.primary}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleProfile}
          accessibilityLabel="User Profile"
          style={[
            styles.profileButton,
            {
              backgroundColor: isAuthenticated ? theme.primaryLight : theme.surface,
              borderColor: isAuthenticated ? theme.primary : theme.border,
            },
          ]}
        >
          {isAuthenticated && user?.name ? (
            <Text style={[styles.userInitial, { color: theme.primary }]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Feather name="user" size={17} color={isAuthenticated ? theme.primary : theme.textMuted} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
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
    gap: 12,
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
  titleContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
})
