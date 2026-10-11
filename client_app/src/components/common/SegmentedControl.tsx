import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'

export interface SegmentOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[]
  selectedValue: T
  onSelect: (val: T) => void
}

export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme()

  const handleSelect = (val: T) => {
    if (val !== selectedValue) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onSelect(val)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
      {options.map(opt => {
        const isSelected = opt.value === selectedValue
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => handleSelect(opt.value)}
            style={[
              styles.segment,
              isSelected && [
                styles.selectedSegment,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.primary,
                  shadowColor: theme.isDark ? '#000000' : '#CBD5E1',
                },
              ],
            ]}
          >
            {opt.icon && <View style={styles.iconWrapper}>{opt.icon}</View>}
            <Text
              style={[
                styles.segmentText,
                {
                  color: isSelected ? theme.primary : theme.textMuted,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginVertical: 8,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 6,
  },
  selectedSegment: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
})
