import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverRides } from '../../context/DriverRidesContext'
import { FleetVehicle } from '../../types'

interface VehicleAssignmentModalProps {
  visible: boolean
  onClose: () => void
}

export const VehicleAssignmentModal: React.FC<VehicleAssignmentModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme()
  const { shift, fleetCars, assignVehicle } = useDriverRides()

  const handleSelectCar = async (car: FleetVehicle) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await assignVehicle(car)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              shadowColor: isDark ? '#000000' : '#64748B',
            },
          ]}
        >
          {/* Sheet Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' },
              ]}
            />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIconCircle,
                  {
                    backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : 'rgba(22, 163, 74, 0.08)',
                  },
                ]}
              >
                <MaterialCommunityIcons name="car-limousine" size={22} color="#25D366" />
              </View>
              <View>
                <Text style={[styles.brand, { color: theme.textPrimary }]}>FLEET ASSIGNMENT</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  SELECT ACTIVE SHIFT VEHICLE
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <Feather name="x" size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Info Hint */}
            <View
              style={[
                styles.hintBanner,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Feather name="info" size={14} color={theme.primary} />
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                Select the luxury vehicle for your shift. Plate and specs sync automatically to passenger dispatch.
              </Text>
            </View>

            <View style={styles.carsList}>
              {fleetCars.map(car => {
                const isSelected =
                  shift.vehicleId === car.id ||
                  shift.vehiclePlate === car.plateNumber ||
                  shift.vehicleName.includes(car.model)

                return (
                  <TouchableOpacity
                    key={car.id}
                    onPress={() => handleSelectCar(car)}
                    activeOpacity={0.85}
                    style={[
                      styles.carCard,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(37, 211, 102, 0.08)' : 'rgba(22, 163, 74, 0.06)')
                          : theme.surfaceSubtle,
                        borderColor: isSelected
                          ? '#25D366'
                          : theme.borderSubtle,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    {/* Top row */}
                    <View style={styles.carTopRow}>
                      <View style={styles.carIdentity}>
                        <View
                          style={[
                            styles.carIconBox,
                            {
                              backgroundColor: isSelected
                                ? (isDark ? 'rgba(37, 211, 102, 0.18)' : 'rgba(22, 163, 74, 0.12)')
                                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="car-limousine"
                            size={20}
                            color={isSelected ? '#25D366' : theme.textPrimary}
                          />
                        </View>
                        <View>
                          <Text style={[styles.carName, { color: theme.textPrimary }]}>
                            {car.brand} {car.model}
                          </Text>
                          <View style={styles.plateRow}>
                            <Text style={[styles.platePrefix, { color: theme.textMuted }]}>PLATE</Text>
                            <Text style={[styles.plateText, { color: isSelected ? '#25D366' : theme.primary }]}>
                              {car.plateNumber}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {isSelected ? (
                        <View
                          style={[
                            styles.assignedBadge,
                            {
                              backgroundColor: isDark ? 'rgba(37, 211, 102, 0.18)' : 'rgba(22, 163, 74, 0.12)',
                              borderColor: '#25D366',
                            },
                          ]}
                        >
                          <Feather name="check" size={12} color="#25D366" />
                          <Text style={[styles.assignedBadgeText, { color: isDark ? '#25D366' : '#16A34A' }]}>
                            ASSIGNED
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.selectBadge,
                            {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              borderColor: theme.borderSubtle,
                            },
                          ]}
                        >
                          <Text style={[styles.selectBadgeText, { color: theme.textMuted }]}>
                            SELECT
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Specs chips row */}
                    <View style={[styles.specsRow, { borderTopColor: theme.borderSubtle }]}>
                      <View
                        style={[
                          styles.specChip,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                            borderColor: theme.borderSubtle,
                          },
                        ]}
                      >
                        <Feather name="users" size={11} color={theme.textMuted} />
                        <Text style={[styles.specText, { color: theme.textSecondary }]}>
                          Max {car.capacity || 4} Guests
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.specChip,
                          {
                            backgroundColor: isDark ? 'rgba(37,211,102,0.1)' : 'rgba(22,163,74,0.08)',
                            borderColor: isDark ? 'rgba(37,211,102,0.2)' : 'rgba(22,163,74,0.15)',
                          },
                        ]}
                      >
                        <Feather name="shield" size={11} color="#25D366" />
                        <Text style={[styles.specText, { color: isDark ? '#25D366' : '#16A34A' }]}>
                          TLC Insured
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.specChip,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                            borderColor: theme.borderSubtle,
                          },
                        ]}
                      >
                        <Feather name="award" size={11} color={theme.textMuted} />
                        <Text style={[styles.specText, { color: theme.textSecondary }]}>
                          VIP Class
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },
  carsList: {
    gap: 10,
    paddingBottom: 40,
  },
  carCard: {
    padding: 14,
    borderRadius: 16,
    gap: 10,
  },
  carTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  carIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  platePrefix: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  assignedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  selectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  specText: {
    fontSize: 10,
    fontWeight: '600',
  },
})
