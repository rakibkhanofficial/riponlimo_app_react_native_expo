import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'

interface CounterProps {
  label: string
  subtitle?: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  icon?: React.ReactNode
}

export const Counter: React.FC<CounterProps> = ({
  label,
  subtitle,
  value,
  onChange,
  min = 0,
  max = 14,
  icon,
}) => {
  const { theme } = useTheme()

  const handleDecrement = () => {
    if (value > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onChange(value + 1)
    }
  }

  const canDecrement = value > min
  const canIncrement = value < max

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
      <View style={styles.leftCol}>
        <View style={styles.labelRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
        </View>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>

      <View style={styles.stepperRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={!canDecrement}
          style={[
            styles.stepButton,
            {
              backgroundColor: canDecrement ? theme.surfaceSubtle : theme.background,
              borderColor: canDecrement ? theme.border : theme.borderSubtle,
              opacity: canDecrement ? 1 : 0.4,
            },
          ]}
        >
          <Feather name="minus" size={16} color={canDecrement ? theme.textPrimary : theme.textMuted} />
        </TouchableOpacity>

        <View style={styles.valueWrapper}>
          <Text style={[styles.valueText, { color: theme.primary }]}>{value}</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={!canIncrement}
          style={[
            styles.stepButton,
            {
              backgroundColor: canIncrement ? theme.primaryLight : theme.background,
              borderColor: canIncrement ? theme.primary : theme.borderSubtle,
              opacity: canIncrement ? 1 : 0.4,
            },
          ]}
        >
          <Feather name="plus" size={16} color={canIncrement ? theme.primary : theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  leftCol: {
    flex: 1,
    marginRight: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrapper: {
    minWidth: 26,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
