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
    resetDemoShift,
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

  const handleResetShift = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    resetDemoShift()
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

        {/* ─── Shift Step-by-Step Flow Bar ─── */}
        <View style={[styles.stepperContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
          <View style={styles.stepperHeader}>
            <View style={styles.stepperHeaderLeft}>
              <View style={[styles.stepperIconCircle, { backgroundColor: isDark ? 'rgba(37,211,102,0.15)' : 'rgba(22,163,74,0.1)' }]}>
                <Feather name="navigation" size={12} color="#25D366" />
              </View>
              <Text style={[styles.stepperTitle, { color: theme.textMuted }]}>SHIFT WORKFLOW</Text>
            </View>
            <TouchableOpacity onPress={handleResetShift} style={styles.resetShiftBtn}>
              <Feather name="rotate-ccw" size={11} color="#25D366" />
              <Text style={styles.resetShiftText}>Reset Demo Run</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepperRow}>
            {/* Step 1: Duty Online */}
            <TouchableOpacity
              onPress={handleToggleDuty}
              activeOpacity={0.8}
              style={[
                styles.stepBadge,
                {
                  backgroundColor: shift.isOnline ? (isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  borderColor: shift.isOnline ? '#25D366' : theme.borderSubtle,
                },
              ]}
            >
              <View style={[styles.stepNumCircle, { backgroundColor: shift.isOnline ? '#25D366' : theme.textMuted }]}>
                {shift.isOnline ? (
                  <Feather name="check" size={10} color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepNumText}>1</Text>
                )}
              </View>
              <Text style={[styles.stepBadgeText, { color: shift.isOnline ? (isDark ? '#25D366' : '#16A34A') : theme.textMuted }]}>
                {shift.isOnline ? '1. On Duty' : '1. Off Duty'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepArrowLine, { backgroundColor: theme.borderSubtle }]} />

            {/* Step 2: Vehicle Selected */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowVehicleModal(true)
              }}
              activeOpacity={0.8}
              style={[
                styles.stepBadge,
                {
                  backgroundColor: isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)',
                  borderColor: '#25D366',
                },
              ]}
            >
              <View style={[styles.stepNumCircle, { backgroundColor: '#25D366' }]}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
              <Text style={[styles.stepBadgeText, { color: isDark ? '#25D366' : '#16A34A' }]}>
                2. {shift.vehiclePlate}
              </Text>
            </TouchableOpacity>

            <View style={[styles.stepArrowLine, { backgroundColor: theme.borderSubtle }]} />

            {/* Step 3: Run Active */}
            <View
              style={[
                styles.stepBadge,
                {
                  backgroundColor: activeRide ? (isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  borderColor: activeRide ? '#25D366' : theme.borderSubtle,
                },
              ]}
            >
              <View style={[styles.stepNumCircle, { backgroundColor: activeRide ? '#25D366' : theme.textMuted }]}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <Text style={[styles.stepBadgeText, { color: activeRide ? (isDark ? '#25D366' : '#16A34A') : theme.textMuted }]}>
                {activeRide ? '3. Run Live' : '3. Standby'}
              </Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            SECTION 1: Chauffeur Duty Status
        ═══════════════════════════════════════════ */}
        <View
          style={[
            styles.dutyCard,
            {
              backgroundColor: shift.isOnline
                ? (isDark ? 'rgba(37, 211, 102, 0.08)' : 'rgba(22, 163, 74, 0.06)')
                : theme.surfaceSubtle,
              borderColor: shift.isOnline
                ? (isDark ? 'rgba(37, 211, 102, 0.25)' : 'rgba(22, 163, 74, 0.2)')
                : theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.dutyTop}>
            {/* Status indicator */}
            <View style={styles.dutyStatusRow}>
              <View
                style={[
                  styles.dutyStatusCircle,
                  {
                    backgroundColor: shift.isOnline
                      ? 'rgba(37, 211, 102, 0.2)'
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                  },
                ]}
              >
                <View
                  style={[
                    styles.dutyDotInner,
                    { backgroundColor: shift.isOnline ? '#25D366' : theme.textMuted },
                  ]}
                />
              </View>

              <View style={styles.dutyInfo}>
                <Text style={[styles.dutyTitle, { color: theme.textPrimary }]}>
                  {shift.isOnline ? 'On Duty' : 'Off Duty'}
                </Text>
                <Text style={[styles.dutySub, { color: theme.textMuted }]}>
                  {shift.isOnline ? 'Receiving dispatch & VIP assignments' : 'Go online to receive jobs'}
                </Text>
              </View>
            </View>

            {/* Toggle button */}
            <TouchableOpacity
              onPress={handleToggleDuty}
              activeOpacity={0.8}
              style={[
                styles.dutyToggle,
                {
                  backgroundColor: shift.isOnline ? '#25D366' : theme.primary,
                },
              ]}
            >
              <Feather
                name={shift.isOnline ? 'pause' : 'play'}
                size={14}
                color={shift.isOnline ? '#FFFFFF' : (isDark ? '#000000' : '#FFFFFF')}
              />
              <Text
                style={[
                  styles.dutyToggleLabel,
                  { color: shift.isOnline ? '#FFFFFF' : (isDark ? '#000000' : '#FFFFFF') },
                ]}
              >
                {shift.isOnline ? 'PAUSE' : 'GO LIVE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            SECTION 2: Earnings & Shift Stats
        ═══════════════════════════════════════════ */}
        <View style={styles.statsGrid}>
          {/* Earnings Card — Hero card, full width */}
          <View
            style={[
              styles.earningsCard,
              {
                backgroundColor: isDark ? 'rgba(37, 211, 102, 0.08)' : 'rgba(22, 163, 74, 0.06)',
                borderColor: isDark ? 'rgba(37, 211, 102, 0.2)' : 'rgba(22, 163, 74, 0.15)',
              },
            ]}
          >
            <View style={styles.earningsTop}>
              <View
                style={[
                  styles.earningsIconCircle,
                  { backgroundColor: isDark ? 'rgba(37, 211, 102, 0.15)' : 'rgba(22, 163, 74, 0.12)' },
                ]}
              >
                <Feather name="dollar-sign" size={18} color="#25D366" />
              </View>
              <Text style={[styles.earningsLabel, { color: theme.textMuted }]}>TODAY'S EARNINGS</Text>
            </View>
            <Text style={[styles.earningsAmount, { color: theme.textPrimary }]}>
              ${shift.totalEarningsToday}
            </Text>
            <Text style={[styles.earningsSub, { color: theme.textMuted }]}>
              Total payout for current shift
            </Text>
          </View>

          {/* Two small stat cards side by side */}
          <View style={styles.statsSmallRow}>
            {/* Trips */}
            <View
              style={[
                styles.statSmallCard,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <Feather name="check-circle" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {shift.completedTripsToday}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Trips Done</Text>
            </View>

            {/* Hours */}
            <View
              style={[
                styles.statSmallCard,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <Feather name="clock" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {shift.hoursOnlineToday}h
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>On Duty</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════
            SECTION 3: Assigned Fleet Vehicle
        ═══════════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setShowVehicleModal(true)
          }}
          style={[styles.vehicleCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          {/* Vehicle identity row */}
          <View style={styles.vehicleIdentity}>
            <View
              style={[
                styles.vehicleIconBox,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
            >
              <MaterialCommunityIcons name="car-limousine" size={28} color={theme.primary} />
            </View>

            <View style={styles.vehicleNameCol}>
              <Text style={[styles.vehicleLabel, { color: theme.textMuted }]}>ACTIVE VEHICLE</Text>
              <Text style={[styles.vehicleName, { color: theme.textPrimary }]}>{shift.vehicleName}</Text>
            </View>

            <View style={[styles.switchBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: theme.borderSubtle }]}>
              <Feather name="refresh-cw" size={14} color={theme.primary} />
            </View>
          </View>

          {/* Plate + Spec Tags */}
          <View style={[styles.vehicleDetails, { borderTopColor: theme.borderSubtle }]}>
            {/* Plate badge */}
            <View
              style={[
                styles.plateBadge,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.platePrefix, { color: theme.textMuted }]}>PLATE</Text>
              <Text style={[styles.plateValue, { color: theme.primary }]}>{shift.vehiclePlate}</Text>
            </View>

            {/* Spec chips */}
            <View style={styles.specChipsRow}>
              <View style={[styles.specChip, { backgroundColor: isDark ? 'rgba(37,211,102,0.1)' : 'rgba(22,163,74,0.08)', borderColor: isDark ? 'rgba(37,211,102,0.2)' : 'rgba(22,163,74,0.15)' }]}>
                <Feather name="shield" size={11} color="#25D366" />
                <Text style={[styles.specChipText, { color: isDark ? '#25D366' : '#16A34A' }]}>TLC Insured</Text>
              </View>
              <View style={[styles.specChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderColor: theme.borderSubtle }]}>
                <Feather name="award" size={11} color={theme.textSecondary} />
                <Text style={[styles.specChipText, { color: theme.textSecondary }]}>VIP Ready</Text>
              </View>
              <View style={[styles.specChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderColor: theme.borderSubtle }]}>
                <Feather name="star" size={11} color={theme.textSecondary} />
                <Text style={[styles.specChipText, { color: theme.textSecondary }]}>Chauffeur</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ═══════════════════════════════════════════
            Remaining sections (unchanged)
        ═══════════════════════════════════════════ */}

        {/* Active Ongoing Trip */}
        {activeRide ? (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Current Assignment</Text>
            <ActiveTripCard booking={activeRide} />
          </View>
        ) : (
          <View
            style={[
              styles.standbyCard,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.standbyIconCircle,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
            >
              <Feather name="coffee" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.standbyTitle, { color: theme.textPrimary }]}>Chauffeur on Standby</Text>
            <Text style={[styles.standbySub, { color: theme.textMuted }]}>
              No active trip in progress. Check upcoming scheduled rides below or claim an open run from the marketplace.
            </Text>
          </View>
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
          <View
            style={[
              styles.emptyManifestCard,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.emptyManifestIcon,
                { backgroundColor: isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)' },
              ]}
            >
              <Feather name="calendar" size={20} color="#25D366" />
            </View>
            <Text style={[styles.emptyManifestTitle, { color: theme.textPrimary }]}>
              Manifest All Clear
            </Text>
            <Text style={[styles.emptyManifestSub, { color: theme.textMuted }]}>
              No further rides scheduled for your shift today.
            </Text>
          </View>
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

  /* ═══ Stepper Workflow Bar ═══ */
  stepperContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resetShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resetShiftText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#25D366',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  stepNumCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepArrowLine: {
    width: 8,
    height: 1,
    marginHorizontal: 3,
  },

  /* ═══ Section 1: Duty Status ═══ */
  dutyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  dutyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dutyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dutyStatusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dutyInfo: {
    flex: 1,
  },
  dutyTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dutySub: {
    fontSize: 11,
    marginTop: 2,
  },
  dutyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dutyToggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  /* ═══ Section 2: Earnings & Stats ═══ */
  statsGrid: {
    marginBottom: 12,
    gap: 10,
  },
  earningsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  earningsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  earningsIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 2,
  },
  earningsSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsSmallRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statSmallCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* ═══ Section 3: Fleet Vehicle ═══ */
  vehicleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  vehicleIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleNameCol: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  switchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  platePrefix: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  plateValue: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  specChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  specChipText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* ═══ Remaining ═══ */
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  standbyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  standbyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  standbyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  standbySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  emptyManifestCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  emptyManifestIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyManifestTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyManifestSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
})
