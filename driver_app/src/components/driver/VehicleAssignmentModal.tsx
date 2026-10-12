import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverRides } from '../../context/DriverRidesContext'
import { FleetVehicle } from '../../types'
import { Badge } from '../common/Badge'

interface VehicleAssignmentModalProps {
  visible: boolean
  onClose: () => void
}

export const VehicleAssignmentModal: React.FC<VehicleAssignmentModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme()
  const { shift, fleetCars, assignVehicle } = useDriverRides()

  const handleSelectCar = async (car: FleetVehicle) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await assignVehicle(car)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.brand, { color: theme.primary }]}>FLEET VEHICLE ASSIGNMENT</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                SELECT YOUR ACTIVE CHAUFFEUR VEHICLE
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              Choose the luxury vehicle you are operating for your current shift. Your license plate and vehicle specs will automatically sync to client dispatch.
            </Text>

            <View style={{ gap: 10, marginTop: 12, paddingBottom: 30 }}>
              {fleetCars.map(car => {
                const isSelected =
                  shift.vehicleId === car.id ||
                  shift.vehiclePlate === car.plateNumber ||
                  shift.vehicleName.includes(car.model)

                return (
                  <TouchableOpacity
                    key={car.id}
                    onPress={() => handleSelectCar(car)}
                    activeOpacity={0.8}
                    style={[
                      styles.carCard,
                      {
                        backgroundColor: isSelected ? theme.surfaceSubtle : theme.surface,
                        borderColor: isSelected ? theme.driverActive : theme.border,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={styles.carTopRow}>
                      <View style={styles.carInfo}>
                        <View style={styles.titleRow}>
                          <MaterialCommunityIcons
                            name="car-limousine"
                            size={18}
                            color={isSelected ? theme.primary : theme.textPrimary}
                          />
                          <Text style={[styles.carName, { color: theme.textPrimary }]}>
                            {car.brand} {car.model}
                          </Text>
                        </View>
                        <Text style={[styles.plateText, { color: theme.primary }]}>
                          PLATE: {car.plateNumber}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={[styles.activeBadge, { backgroundColor: theme.driverActiveBg, borderColor: theme.driverActive }]}>
                          <Feather name="check" size={13} color={theme.driverActive} />
                          <Text style={[styles.activeBadgeText, { color: theme.driverActive }]}>ASSIGNED</Text>
                        </View>
                      ) : (
                        <Badge label="AVAILABLE" variant="neutral" size="sm" />
                      )}
                    </View>

                    {/* Features row */}
                    <View style={styles.specsRow}>
                      <View style={styles.specItem}>
                        <Feather name="users" size={12} color={theme.textMuted} />
                        <Text style={[styles.specText, { color: theme.textSecondary }]}>
                          Max {car.capacity || 4} VIP Guests
                        </Text>
                      </View>
                      <View style={styles.specDivider} />
                      <View style={styles.specItem}>
                        <Feather name="shield" size={12} color={theme.textMuted} />
                        <Text style={[styles.specText, { color: theme.textSecondary }]}>
                          TLC Livery Insured
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
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
    paddingVertical: 16,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 18,
  },
  carCard: {
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  carTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  specText: {
    fontSize: 11,
    fontWeight: '500',
  },
})
