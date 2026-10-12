import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { ActiveTripCard } from '../components/driver/ActiveTripCard'
import { ScheduledRideCard } from '../components/driver/ScheduledRideCard'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { VehicleAssignmentModal } from '../components/driver/VehicleAssignmentModal'

interface DriverDashboardScreenProps {
  onProfilePress: () => void
  onNavigateToSchedule: () => void
}

export const DriverDashboardScreen: React.FC<DriverDashboardScreenProps> = ({
  onProfilePress,
  onNavigateToSchedule,
}) => {
  const { theme, isDark } = useTheme()
  const {
    shift,
    toggleOnline,
    activeRide,
    assignedRides,
    refreshRides,
    isLoading,
  } = useDriverRides()
  const [showVehicleModal, setShowVehicleModal] = useState(false)

  // Future scheduled rides excluding active ride
  const upcomingRides = assignedRides.filter(
    r => r.id !== activeRide?.id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  )

  const handleToggleDuty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleOnline()
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header onProfilePress={onProfilePress} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshRides}
            tintColor={theme.primary}
          />
        }
      >
        {/* Chauffeur Duty Status Bar */}
        <View style={[styles.dutyBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
          <View style={styles.dutyLeft}>
            <View
              style={[
                styles.dutyDot,
                { backgroundColor: shift.isOnline ? theme.driverActive : theme.textMuted },
              ]}
            />
            <View>
              <Text style={[styles.dutyStatusText, { color: theme.textPrimary }]}>
                {shift.isOnline ? 'CHAUFFEUR ON DUTY' : 'SHIFT PAUSED'}
              </Text>
              <Text style={[styles.dutySubText, { color: theme.textMuted }]}>
                {shift.isOnline ? 'Available for dispatch & VIP assignments' : 'Go online to receive jobs'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleToggleDuty}
            style={[
              styles.dutyToggleBtn,
              {
                backgroundColor: shift.isOnline ? 'rgba(37, 211, 102, 0.15)' : theme.surface,
                borderColor: shift.isOnline ? theme.driverActive : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dutyToggleText,
                { color: shift.isOnline ? theme.driverActive : theme.textSecondary },
              ]}
            >
              {shift.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shift Metrics Bar */}
        <View style={[styles.metricsBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>TOTAL EARNINGS</Text>
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              ${shift.totalEarningsToday}
            </Text>
            <Text style={[styles.metricSub, { color: theme.textMuted }]}>Today's Payout</Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>TRIPS DONE</Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {shift.completedTripsToday}
            </Text>
            <Text style={[styles.metricSub, { color: theme.textMuted }]}>Completed</Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>SHIFT HOURS</Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {shift.hoursOnlineToday}h
            </Text>
            <Text style={[styles.metricSub, { color: theme.textMuted }]}>Active Duty</Text>
          </View>
        </View>

        {/* Assigned Vehicle Overview (Interactive Selector) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setShowVehicleModal(true)
          }}
          style={[styles.vehicleCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <View style={styles.vehicleTopRow}>
            <View style={[styles.vehicleIconBadge, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="car-limousine" size={26} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vehicleCardHeader, { color: theme.textMuted }]}>ASSIGNED FLEET VEHICLE</Text>
              <Text style={[styles.vehicleCardTitle, { color: theme.textPrimary }]}>{shift.vehicleName}</Text>
            </View>
            <View style={[styles.switchVehicleBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}>
              <Text style={[styles.switchVehicleBtnText, { color: theme.primary }]}>SWITCH</Text>
              <Feather name="refresh-cw" size={12} color={theme.primary} />
            </View>
          </View>

          <View style={[styles.vehicleBottomRow, { borderTopColor: theme.borderSubtle }]}>
            <View style={styles.plateContainer}>
              <Text style={[styles.plateLabel, { color: theme.textMuted }]}>PLATE</Text>
              <Text style={[styles.plateNumber, { color: theme.primary }]}>{shift.vehiclePlate}</Text>
            </View>
            <View style={styles.specTagsRow}>
              <View style={[styles.specTag, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                <Feather name="shield" size={11} color={theme.driverActive} />
                <Text style={[styles.specTagText, { color: theme.textSecondary }]}>TLC Livery Insured</Text>
              </View>
              <View style={[styles.specTag, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                <Feather name="users" size={11} color={theme.textMuted} />
                <Text style={[styles.specTagText, { color: theme.textSecondary }]}>VIP Chauffeur Ready</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Active Ongoing Trip */}
        {activeRide ? (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Current Assignment</Text>
            <ActiveTripCard booking={activeRide} />
          </View>
        ) : (
          <Card style={styles.noActiveCard}>
            <View style={styles.noActiveContent}>
              <Feather name="coffee" size={28} color={theme.primary} />
              <Text style={[styles.noActiveTitle, { color: theme.textPrimary }]}>No Ongoing Ride</Text>
              <Text style={[styles.noActiveSub, { color: theme.textMuted }]}>
                You are currently on standby. Check upcoming scheduled rides below or claim an open run.
              </Text>
            </View>
          </Card>
        )}

        {/* Upcoming Manifest */}
        <View style={styles.upcomingHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Next on Manifest</Text>
          <Badge label={`${upcomingRides.length} Scheduled`} variant="neutral" size="sm" />
        </View>

        {upcomingRides.length > 0 ? (
          upcomingRides.map(ride => (
            <ScheduledRideCard key={ride.id} booking={ride} />
          ))
        ) : (
          <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
            No more rides scheduled for your shift today.
          </Text>
        )}
      </ScrollView>

      {/* Vehicle Assignment Modal */}
      <VehicleAssignmentModal
        visible={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 38,
  },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  vehicleCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 14,
    gap: 12,
  },
  vehicleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCardHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  vehicleCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  switchVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  switchVehicleBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vehicleBottomRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  plateNumber: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  specTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  specTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  noActiveCard: {
    marginVertical: 10,
  },
  noActiveContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  noActiveTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  noActiveSub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 10,
    textAlign: 'center',
  },
  dutyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dutyStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dutySubText: {
    fontSize: 10,
    marginTop: 2,
  },
  dutyToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dutyToggleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
})
