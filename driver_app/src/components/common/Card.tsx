import React from 'react'
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { useTheme } from '../../theme/ThemeContext'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  rightAction?: React.ReactNode
  style?: StyleProp<ViewStyle>
  highlighted?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  rightAction,
  style,
  highlighted = false,
}) => {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: highlighted ? theme.primary : theme.cardBorder,
          shadowColor: theme.isDark ? '#000000' : '#64748B',
        },
        style,
      ]}
    >
      {(title || icon || rightAction) && (
        <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <View style={styles.titleRow}>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <View>
              {title && (
                <Text style={[styles.title, { color: theme.primary }]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View>{rightAction}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.2,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
})
