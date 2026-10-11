import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { ActiveTripCard } from '../components/driver/ActiveTripCard'
import { ScheduledRideCard } from '../components/driver/ScheduledRideCard'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'

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
    activeRide,
    assignedRides,
    refreshRides,
    isLoading,
  } = useDriverRides()

  // Future scheduled rides excluding active ride
  const upcomingRides = assignedRides.filter(
    r => r.id !== activeRide?.id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  )

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

        {/* Assigned Vehicle Overview */}
        <View style={[styles.vehicleRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
          <MaterialCommunityIcons name="car-limousine" size={20} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleLabel, { color: theme.textMuted }]}>Assigned Vehicle</Text>
            <Text style={[styles.vehicleName, { color: theme.textPrimary }]}>{shift.vehicleName}</Text>
          </View>
          <Badge label={`Plate: ${shift.vehiclePlate}`} variant="primary" size="sm" />
        </View>

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
})
