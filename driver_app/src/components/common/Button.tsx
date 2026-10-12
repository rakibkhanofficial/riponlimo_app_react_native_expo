import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme()

  const handlePress = () => {
    if (disabled || loading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  const isPrimary = variant === 'primary'

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.surfaceSubtle,
          borderColor: theme.border,
          borderWidth: 1,
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.primary,
          borderWidth: 1.5,
        }
      case 'danger':
        return {
          backgroundColor: theme.error,
        }
      case 'success':
        return {
          backgroundColor: theme.success,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        }
      default:
        return {}
    }
  }

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.buttonText
      case 'secondary':
        return theme.textPrimary
      case 'outline':
        return theme.primary
      case 'danger':
      case 'success':
        return '#FFFFFF'
      case 'ghost':
        return theme.textPrimary
    }
  }

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14 }
      default:
        return { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 }
    }
  }

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 12
      case 'lg':
        return 15
      default:
        return 13.5
    }
  }

  const content = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </View>
  )

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.base, getSizeStyle(), { opacity: disabled ? 0.5 : 1 }, style]}
      >
        <LinearGradient
          colors={theme.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, getSizeStyle()]}
        />
        {content}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        getSizeStyle(),
        getContainerStyle(),
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
})
