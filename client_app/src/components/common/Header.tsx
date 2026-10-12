import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  title?: string
  subtitle?: string
  showThemeToggle?: boolean
  showBack?: boolean
  onBack?: () => void
  onProfilePress?: () => void
  transparent?: boolean
  isScrolled?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RIPON LIMO',
  subtitle,
  showThemeToggle = true,
  showBack = false,
  onBack,
  onProfilePress,
  transparent = false,
  isScrolled = false,
}) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const insets = useSafeAreaInsets()

  const isTransparentActive = transparent && !isScrolled

  const handleThemeToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // ignore
    }
    toggleTheme()
  }

  const handleProfile = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // ignore
    }
    if (onProfilePress) onProfilePress()
  }

  // Dynamic styling colors based on whether header is floating transparent over dark hero
  const brandTitleColor = isTransparentActive ? '#FFFFFF' : theme.textPrimary
  const brandFadedColor = isTransparentActive ? 'rgba(255,255,255,0.55)' : undefined
  const subtitleColor = isTransparentActive ? 'rgba(255,255,255,0.75)' : theme.textMuted
  const buttonBg = isTransparentActive ? 'rgba(0,0,0,0.45)' : theme.surface
  const buttonBorder = isTransparentActive ? 'rgba(255,255,255,0.3)' : theme.border
  const iconColor = isTransparentActive ? '#FFFFFF' : theme.textPrimary

  return (
    <View
      style={[
        styles.container,
        transparent ? styles.transparentContainer : styles.solidContainer,
        {
          paddingTop: transparent
            ? insets.top + (Platform.OS === 'ios' ? 4 : 8)
            : Platform.OS === 'ios' ? 8 : 12,
          backgroundColor: isTransparentActive ? 'transparent' : theme.background,
          borderBottomColor: isTransparentActive ? 'transparent' : theme.border,
          borderBottomWidth: isTransparentActive ? 0 : 1,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconButton, { borderColor: buttonBorder, backgroundColor: buttonBg }]}
          >
            <Feather name="arrow-left" size={18} color={iconColor} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.brandBox}>
          <Text style={[styles.brandTitle, { color: brandTitleColor }]}>
            RIPON <Text style={[styles.brandTitleFaded, brandFadedColor ? { color: brandFadedColor, opacity: 1 } : null]}>LIMO</Text>
          </Text>
          {subtitle && (
            <Text style={[styles.brandSubtitle, { color: subtitleColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        {showThemeToggle && (
          <TouchableOpacity
            onPress={handleThemeToggle}
            style={[styles.iconButton, { borderColor: buttonBorder, backgroundColor: buttonBg }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={16}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {onProfilePress && (
          <TouchableOpacity
            onPress={handleProfile}
            style={[
              styles.profileButton,
              { borderColor: buttonBorder, backgroundColor: buttonBg },
            ]}
            activeOpacity={0.7}
          >
            <Feather name="user" size={16} color={iconColor} />
            {isAuthenticated && user && (
              <View style={[styles.onlineDot, { backgroundColor: theme.accent }]} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  solidContainer: {
    position: 'relative',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandBox: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  brandTitleFaded: {
    opacity: 0.45,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
