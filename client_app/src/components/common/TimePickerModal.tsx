import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { Button } from './Button'

interface TimePickerModalProps {
  visible: boolean
  selectedTime?: string // 'HH:mm' 24-hour format
  onSelectTime: (timeStr: string) => void
  onClose: () => void
}

const PRESET_TIMES = [
  { label: '08:00 AM', time: '08:00' },
  { label: '11:30 AM', time: '11:30' },
  { label: '02:00 PM', time: '14:00' },
  { label: '06:00 PM', time: '18:00' },
  { label: '09:00 PM', time: '21:00' },
]

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  selectedTime = '12:00',
  onSelectTime,
  onClose,
}) => {
  const { theme } = useTheme()

  const parseInitialTime = () => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return { hour: hour12, minute: Math.round(m / 5) * 5 % 60, period }
      }
    }
    return { hour: 12, minute: 0, period: 'PM' as const }
  }

  const initial = parseInitialTime()
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period)

  const handleIncrementHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setHour(prev => (prev === 12 ? 1 : prev + 1))
  }

  const handleDecrementHour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setHour(prev => (prev === 1 ? 12 : prev - 1))
  }

  const handleIncrementMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMinute(prev => (prev === 55 ? 0 : prev + 5))
  }

  const handleDecrementMinute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMinute(prev => (prev === 0 ? 55 : prev - 5))
  }

  const handleTogglePeriod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPeriod(prev => (prev === 'AM' ? 'PM' : 'AM'))
  }

  const handleApplyPreset = (presetTime: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const [h, m] = presetTime.split(':').map(Number)
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    setHour(h12)
    setMinute(m)
    setPeriod(p)
  }

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    let hour24 = hour % 12
    if (period === 'PM') hour24 += 12
    const timeStr = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onSelectTime(timeStr)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
                <View>
                  <Text style={[styles.overTitle, { color: theme.accentGreen }]}>SELECT PICKUP TIME</Text>
                  <Text style={[styles.title, { color: theme.text }]}>CHAUFFEUR SCHEDULE</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: theme.border }]}>
                  <Feather name="x" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Time Selection Wheels */}
              <View style={styles.timePickerContainer}>
                {/* Hours Column */}
                <View style={styles.pickerColumn}>
                  <TouchableOpacity onPress={handleIncrementHour} style={[styles.arrowBtn, { borderColor: theme.border }]}>
                    <Feather name="chevron-up" size={18} color={theme.text} />
                  </TouchableOpacity>
                  <View style={[styles.digitBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                    <Text style={[styles.digitText, { color: theme.text }]}>
                      {String(hour).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleDecrementHour} style={[styles.arrowBtn, { borderColor: theme.border }]}>
                    <Feather name="chevron-down" size={18} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.colonText, { color: theme.textMuted }]}>:</Text>

                {/* Minutes Column */}
                <View style={styles.pickerColumn}>
                  <TouchableOpacity onPress={handleIncrementMinute} style={[styles.arrowBtn, { borderColor: theme.border }]}>
                    <Feather name="chevron-up" size={18} color={theme.text} />
                  </TouchableOpacity>
                  <View style={[styles.digitBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                    <Text style={[styles.digitText, { color: theme.text }]}>
                      {String(minute).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleDecrementMinute} style={[styles.arrowBtn, { borderColor: theme.border }]}>
                    <Feather name="chevron-down" size={18} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* AM / PM Toggle */}
                <View style={styles.periodColumn}>
                  <TouchableOpacity
                    onPress={() => setPeriod('AM')}
                    style={[
                      styles.periodBtn,
                      { borderColor: theme.border },
                      period === 'AM' && { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        { color: period === 'AM' ? theme.buttonText : theme.textMuted },
                      ]}
                    >
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPeriod('PM')}
                    style={[
                      styles.periodBtn,
                      { borderColor: theme.border },
                      period === 'PM' && { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        { color: period === 'PM' ? theme.buttonText : theme.textMuted },
                      ]}
                    >
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Presets */}
              <View style={styles.presetsSection}>
                <Text style={[styles.presetsTitle, { color: theme.textMuted }]}>POPULAR TIMES</Text>
                <View style={styles.presetsRow}>
                  {PRESET_TIMES.map(p => (
                    <TouchableOpacity
                      key={p.time}
                      onPress={() => handleApplyPreset(p.time)}
                      style={[styles.presetPill, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    >
                      <Text style={[styles.presetPillText, { color: theme.text }]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Confirm Button */}
              <View style={[styles.actionRow, { borderTopColor: theme.borderSubtle }]}>
                <Button
                  title="SET TIME"
                  variant="primary"
                  onPress={handleConfirm}
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 2,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  overTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 12,
  },
  pickerColumn: {
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBox: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 1,
  },
  colonText: {
    fontSize: 28,
    fontWeight: '300',
    paddingBottom: 4,
  },
  periodColumn: {
    gap: 8,
    marginLeft: 6,
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  presetsSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  presetsTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  presetPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionRow: {
    paddingTop: 14,
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 48,
  },
})
