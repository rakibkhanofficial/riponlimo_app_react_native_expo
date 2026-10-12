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
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Today's Earnings</Text>
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              ${shift.totalEarningsToday}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Trips Done</Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {shift.completedTripsToday}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Shift Hours</Text>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {shift.hoursOnlineToday}h
            </Text>
          </View>
        </View>

        {/* Assigned Vehicle Overview (Interactive Selector) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setShowVehicleModal(true)
          }}
          style={[styles.vehicleRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
        >
          <MaterialCommunityIcons name="car-limousine" size={22} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleLabel, { color: theme.textMuted }]}>Assigned Chauffeur Vehicle</Text>
            <Text style={[styles.vehicleName, { color: theme.textPrimary }]}>{shift.vehicleName}</Text>
          </View>
          <View style={styles.vehicleActionGroup}>
            <Badge label={`Plate: ${shift.vehiclePlate}`} variant="primary" size="sm" />
            <View style={[styles.switchCarBtn, { borderColor: theme.border }]}>
              <Text style={[styles.switchCarText, { color: theme.textSecondary }]}>SWITCH</Text>
              <Feather name="chevron-right" size={12} color={theme.textSecondary} />
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
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
  },
  vehicleLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
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
  vehicleActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchCarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  switchCarText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
})
