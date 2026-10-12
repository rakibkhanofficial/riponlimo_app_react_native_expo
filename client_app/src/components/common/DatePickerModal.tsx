import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { Button } from './Button'

interface DatePickerModalProps {
  visible: boolean
  selectedDate?: string // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void
  onClose: () => void
  minDate?: Date
}

const DAYS_OF_WEEK = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
]

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  minDate = new Date(),
}) => {
  const { theme } = useTheme()

  const parseInitialDate = () => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number)
      if (parts.length === 3 && !isNaN(parts[0])) {
        return new Date(parts[0], parts[1] - 1, parts[2])
      }
    }
    return new Date()
  }

  const [viewDate, setViewDate] = useState<Date>(parseInitialDate())
  const [pickedDate, setPickedDate] = useState<string>(
    selectedDate || new Date().toISOString().split('T')[0]
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setViewDate(new Date(year, month + 1, 1))
  }

  // Calculate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const minDateStr = minDate.toISOString().split('T')[0]

  const formatDateStr = (dayNum: number) => {
    const mStr = String(month + 1).padStart(2, '0')
    const dStr = String(dayNum).padStart(2, '0')
    return `${year}-${mStr}-${dStr}`
  }

  const handleDaySelect = (dayNum: number) => {
    const dateStr = formatDateStr(dayNum)
    if (dateStr < minDateStr) return // disabled past date
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPickedDate(dateStr)
  }

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onSelectDate(pickedDate)
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
                  <Text style={[styles.overTitle, { color: theme.accentGreen }]}>SELECT RESERVATION DATE</Text>
                  <Text style={[styles.title, { color: theme.text }]}>CALENDAR</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: theme.border }]}>
                  <Feather name="x" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity onPress={handlePrevMonth} style={[styles.navArrow, { borderColor: theme.border }]}>
                  <Feather name="chevron-left" size={18} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.monthTitle, { color: theme.text }]}>
                  {MONTH_NAMES[month]} {year}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={[styles.navArrow, { borderColor: theme.border }]}>
                  <Feather name="chevron-right" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Days of Week Row */}
              <View style={styles.weekDaysRow}>
                {DAYS_OF_WEEK.map(d => (
                  <Text key={d} style={[styles.weekDayText, { color: theme.textMuted }]}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={styles.daysGrid}>
                {days.map((d, index) => {
                  if (d === null) {
                    return <View key={`empty-${index}`} style={styles.dayCell} />
                  }

                  const dateStr = formatDateStr(d)
                  const isSelected = dateStr === pickedDate
                  const isPast = dateStr < minDateStr
                  const isToday = dateStr === todayStr

                  return (
                    <TouchableOpacity
                      key={`day-${d}`}
                      disabled={isPast}
                      onPress={() => handleDaySelect(d)}
                      style={[
                        styles.dayCell,
                        isSelected && [styles.selectedDayCell, { backgroundColor: theme.primary }],
                        isToday && !isSelected && [styles.todayCell, { borderColor: theme.accentGreen }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected
                              ? theme.buttonText
                              : isPast
                              ? theme.textMuted
                              : theme.text,
                            opacity: isPast ? 0.3 : 1,
                            fontWeight: isSelected || isToday ? '700' : '400',
                          },
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Action Buttons */}
              <View style={[styles.actionRow, { borderTopColor: theme.borderSubtle }]}>
                <Button
                  title="SET DATE"
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
    maxWidth: 380,
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
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  navArrow: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  selectedDayCell: {
    borderRadius: 2,
  },
  todayCell: {
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
  },
  actionRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 48,
  },
})
