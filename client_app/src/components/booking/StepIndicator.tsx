import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'

interface StepIndicatorProps {
  currentStep: number
  onStepPress?: (step: number) => void
}

const STEPS = [
  { id: 1, title: 'Ride Details', short: 'Route' },
  { id: 2, title: 'Vehicle', short: 'Fleet' },
  { id: 3, title: 'Checkout', short: 'Book' },
]

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepPress,
}) => {
  const { theme } = useTheme()

  const handlePress = (stepId: number) => {
    if (stepId < currentStep && onStepPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onStepPress(stepId)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.borderSubtle }]}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          const isClickable = step.id < currentStep

          return (
            <React.Fragment key={step.id}>
              <TouchableOpacity
                onPress={() => handlePress(step.id)}
                disabled={!isClickable}
                activeOpacity={0.7}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: isCompleted
                        ? theme.primary
                        : isActive
                        ? theme.primaryLight
                        : theme.surfaceSubtle,
                      borderColor: isCompleted || isActive ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Feather name="check" size={14} color="#0A0D14" />
                  ) : (
                    <Text
                      style={[
                        styles.circleText,
                        {
                          color: isActive ? theme.primary : theme.textMuted,
                          fontWeight: isActive ? '700' : '600',
                        },
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: isActive ? theme.primary : isCompleted ? theme.textPrimary : theme.textMuted,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>

              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: currentStep > step.id ? theme.primary : theme.borderSubtle,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 12,
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    borderRadius: 1,
  },
})
