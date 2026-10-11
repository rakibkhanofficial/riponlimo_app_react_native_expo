import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Driver, Booking } from '../../types';

interface AssignDriverModalProps {
  visible: boolean;
  booking: Booking | null;
  drivers: Driver[];
  loading: boolean;
  onClose: () => void;
  onAssign: (bookingId: string, driverId: string | null) => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  visible,
  booking,
  drivers,
  loading,
  onClose,
  onAssign,
}) => {
  const { colors } = useTheme();

  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Assign Chauffeur</Text>
              <Text style={[styles.subtitle, { color: colors.gold }]}>
                Order #{booking.id.slice(-6).toUpperCase()} • {booking.car?.brand} {booking.car?.model}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Passenger & Trip Info */}
          <View style={[styles.tripSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.clientName, { color: colors.text }]}>{booking.user?.name}</Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color={colors.gold} /> {booking.pickupLocation}
            </Text>
            {booking.dropLocation && (
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                <Ionicons name="flag-outline" size={12} color={colors.info} /> {booking.dropLocation}
              </Text>
            )}
          </View>

          {/* Unassign option if currently assigned */}
          {booking.driverId && (
            <TouchableOpacity
              style={[styles.unassignBtn, { borderColor: colors.danger, backgroundColor: colors.dangerBg }]}
              onPress={() => onAssign(booking.id, null)}
            >
              <Ionicons name="person-remove-outline" size={16} color={colors.danger} />
              <Text style={[styles.unassignText, { color: colors.danger }]}>Unassign Current Chauffeur (Release to Market)</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SELECT ACTIVE CHAUFFEUR</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.gold} size="small" />
            </View>
          ) : (
            <FlatList
              data={drivers}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCurrent = booking.driverId === item.id;
                const isAvailable = item.status === 'AVAILABLE' || (item.activeTrips || 0) === 0;

                return (
                  <TouchableOpacity
                    style={[
                      styles.driverCard,
                      {
                        backgroundColor: isCurrent ? colors.goldBg : colors.card,
                        borderColor: isCurrent ? colors.gold : colors.border,
                      },
                    ]}
                    onPress={() => onAssign(booking.id, item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.driverLeft}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: isCurrent ? colors.gold : colors.surfaceElevated,
                          },
                        ]}
                      >
                        <Ionicons
                          name="person"
                          size={18}
                          color={isCurrent ? '#0B0E14' : colors.gold}
                        />
                      </View>
                      <View>
                        <View style={styles.nameRow}>
                          <Text style={[styles.driverName, { color: colors.text }]}>{item.name}</Text>
                          {isCurrent && (
                            <View style={[styles.currentBadge, { backgroundColor: colors.gold }]}>
                              <Text style={styles.currentBadgeText}>ASSIGNED</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.driverPhone, { color: colors.textSecondary }]}>
                          {item.phone || item.email}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.driverRight}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isAvailable ? colors.successBg : colors.warningBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: isAvailable ? colors.success : colors.warning },
                          ]}
                        >
                          {isAvailable ? 'Available' : `${item.activeTrips} Active Trip`}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={isCurrent ? colors.gold : colors.textMuted}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tripSummary: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
  },
  unassignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  unassignText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#0B0E14',
    fontSize: 8,
    fontWeight: '900',
  },
  driverPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  driverRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
