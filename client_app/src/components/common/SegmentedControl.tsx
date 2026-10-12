import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
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
    <View style={[styles.outerWrapper, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              activeOpacity={0.8}
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
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: 2,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 3,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 2,
    gap: 7,
  },
  selectedSegment: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
