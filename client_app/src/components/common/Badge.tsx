import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../theme/ThemeContext'

interface BadgeProps {
  label: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
}) => {
  const { theme } = useTheme()

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.successBackground, text: theme.success, border: theme.success }
      case 'warning':
        return { bg: theme.warningBackground, text: theme.warning, border: theme.warning }
      case 'error':
        return { bg: theme.errorBackground, text: theme.error, border: theme.error }
      case 'neutral':
        return { bg: theme.surfaceSubtle, text: theme.textMuted, border: theme.border }
      default:
        return { bg: theme.badgeBackground, text: theme.primary, border: theme.primary }
    }
  }

  const { bg, text, border } = getColors()

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: text },
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 2,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 9,
  },
  textMd: {
    fontSize: 11,
  },
})
