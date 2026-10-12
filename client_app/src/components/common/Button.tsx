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
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // ignore
    }
    onPress()
  }

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.primary,
        }
      case 'secondary':
        return {
          backgroundColor: theme.surfaceSubtle,
          borderColor: theme.border,
          borderWidth: 1,
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.border,
          borderWidth: 1,
        }
      case 'danger':
        return {
          backgroundColor: theme.error,
          borderColor: theme.error,
          borderWidth: 1,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        }
      default:
        return {}
    }
  }

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.textInverse // Rich black in dark theme, pure white in light theme
      case 'secondary':
        return theme.textPrimary
      case 'outline':
        return theme.textPrimary
      case 'danger':
        return '#FFFFFF'
      case 'ghost':
        return theme.textPrimary
      default:
        return theme.textPrimary
    }
  }

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16 }
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 28 }
      default:
        return { paddingVertical: 14, paddingHorizontal: 22 }
    }
  }

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 11, letterSpacing: 1.5 }
      case 'lg':
        return { fontSize: 13, letterSpacing: 2 }
      default:
        return { fontSize: 12, letterSpacing: 1.8 }
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.baseButton,
        { borderRadius: theme.buttonRadius },
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              getTextSizeStyle(),
              { color: getTextColor() },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.4,
  },
})
