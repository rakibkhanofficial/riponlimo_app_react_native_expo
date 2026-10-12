import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverRides, TripStep } from '../../context/DriverRidesContext'
import { Booking } from '../../types'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { MapboxRouteMap } from '../common/MapboxRouteMap'

interface ActiveTripCardProps {
  booking: Booking
}

const STEPS: TripStep[] = ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT', 'COMPLETED']

const STEP_LABELS: Record<TripStep, string> = {
  ASSIGNED: 'Dispatch',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Done',
}

const STEP_ICONS: Record<TripStep, string> = {
  ASSIGNED: 'send',
  EN_ROUTE: 'navigation',
  ARRIVED: 'map-pin',
  IN_TRANSIT: 'truck',
  COMPLETED: 'check-circle',
}

export const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ booking }) => {
  const { theme, isDark } = useTheme()
  const {
    currentTripStep,
    advanceActiveTrip,
    advanceToNextTrip,
    openNavigation,
    callPassenger,
    smsPassenger,
  } = useDriverRides()

  const reservationCode = booking.id ? booking.id.slice(-6).toUpperCase() : 'ACTIVE'
  const currentStepIndex = STEPS.indexOf(currentTripStep)

  const getStepTitle = (step: TripStep) => {
    switch (step) {
      case 'ASSIGNED':
        return 'Step 1 of 5: Dispatched — Ready to Roll'
      case 'EN_ROUTE':
        return 'Step 2 of 5: En Route to Pickup Location'
      case 'ARRIVED':
        return 'Step 3 of 5: Arrived at Pickup Location'
      case 'IN_TRANSIT':
        return 'Step 4 of 5: Passenger In Transit to Drop-off'
      case 'COMPLETED':
        return 'Step 5 of 5: Trip Completed Successfully'
    }
  }

  const getActionButtonText = (step: TripStep) => {
    switch (step) {
      case 'ASSIGNED':
        return 'Step 1 → Step 2: Start Journey to Pickup'
      case 'EN_ROUTE':
        return 'Step 2 → Step 3: I Have Arrived at Pickup'
      case 'ARRIVED':
        return 'Step 3 → Step 4: Passenger Boarded • Start Trip'
      case 'IN_TRANSIT':
        return 'Step 4 → Step 5: Complete Ride & Record Fare'
      case 'COMPLETED':
        return 'Start Next Scheduled Run'
    }
  }

  const handleAdvance = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    advanceActiveTrip()
  }

  const currentDestination =
    currentTripStep === 'IN_TRANSIT'
      ? booking.dropLocation || booking.pickupLocation
      : booking.pickupLocation

  return (
    <Card style={styles.card}>

      {/* ─── SECTION 1: Status Header ─── */}
      <View style={styles.statusHeader}>
        <View style={styles.statusLeft}>
          <View style={[styles.liveIndicator, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
            <View style={[styles.liveDot, { backgroundColor: '#25D366' }]} />
            <Text style={[styles.liveText, { color: '#25D366' }]}>LIVE</Text>
          </View>
          <Text style={[styles.resCodeLg, { color: theme.textPrimary }]}>#{reservationCode}</Text>
        </View>
        <Badge
          label={booking.tripType.replace(/_/g, ' ')}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Current Phase Title */}
      <Text style={[styles.phaseHeadline, { color: theme.textPrimary }]}>
        {getStepTitle(currentTripStep)}
      </Text>

      {/* ─── SECTION 2: Visual Step Progress ─── */}
      <View style={[styles.stepsContainer, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
        <View style={styles.stepsRow}>
          {STEPS.map((step, idx) => {
            const isDone = currentStepIndex > idx
            const isCurrent = currentStepIndex === idx
            const isActive = isDone || isCurrent

            return (
              <View key={step} style={styles.stepItem}>
                {/* Connector line (before each step except first) */}
                {idx > 0 && (
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: isDone ? '#25D366' : (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                      },
                    ]}
                  />
                )}

                {/* Step circle */}
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isCurrent
                        ? '#25D366'
                        : isDone
                          ? 'rgba(37, 211, 102, 0.2)'
                          : (theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                      borderColor: isActive ? '#25D366' : 'transparent',
                    },
                  ]}
                >
                  <Feather
                    name={STEP_ICONS[step] as any}
                    size={12}
                    color={
                      isCurrent
                        ? '#FFFFFF'
                        : isDone
                          ? '#25D366'
                          : theme.textMuted
                    }
                  />
                </View>

                {/* Step label */}
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isCurrent ? '#25D366' : isDone ? theme.textSecondary : theme.textMuted,
                      fontWeight: isCurrent ? '800' : '500',
                    },
                  ]}
                >
                  {STEP_LABELS[step]}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* ─── SECTION 3: Passenger & Comms ─── */}
      <View style={[styles.passengerCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
        <View style={styles.passengerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <Feather name="user" size={20} color={theme.textPrimary} />
          </View>
          <View style={styles.passengerDetails}>
            <Text style={[styles.passengerName, { color: theme.textPrimary }]}>
              {booking.user?.name || 'VIP Client'}
            </Text>
            <Text style={[styles.passengerPhone, { color: theme.textMuted }]}>
              {booking.user?.phone || 'No phone provided'}
            </Text>
          </View>
        </View>

        <View style={styles.commsRow}>
          <TouchableOpacity
            onPress={() => callPassenger(booking.user?.phone)}
            style={[styles.commCircle, { backgroundColor: 'rgba(37, 211, 102, 0.12)', borderColor: 'rgba(37, 211, 102, 0.3)' }]}
          >
            <Feather name="phone" size={16} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => smsPassenger(booking.user?.phone)}
            style={[styles.commCircle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: theme.borderSubtle }]}
          >
            <Feather name="message-square" size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openNavigation(currentDestination)}
            style={[styles.commCircle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: theme.borderSubtle }]}
          >
            <Feather name="navigation" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── SECTION 4: Route with Visual Connector ─── */}
      <View style={[styles.routeCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
        {/* Pickup */}
        <View style={styles.routeRow}>
          <View style={styles.routeIconCol}>
            <View style={[styles.routeDot, { backgroundColor: '#25D366' }]}>
              <Feather name="circle" size={8} color="#FFFFFF" />
            </View>
            {booking.dropLocation && (
              <View style={[styles.routeDottedLine, { borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }]} />
            )}
          </View>
          <View style={styles.routeTextCol}>
            <Text style={[styles.routeLabel, { color: theme.textMuted }]}>PICKUP</Text>
            <Text style={[styles.routeAddress, { color: theme.textPrimary }]}>
              {booking.pickupLocation}
            </Text>
          </View>
        </View>

        {/* Drop-off */}
        {booking.dropLocation && (
          <View style={[styles.routeRow, { marginTop: 4 }]}>
            <View style={styles.routeIconCol}>
              <View style={[styles.routeDot, { backgroundColor: theme.error }]}>
                <Feather name="map-pin" size={8} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.routeTextCol}>
              <Text style={[styles.routeLabel, { color: theme.textMuted }]}>DROP-OFF</Text>
              <Text style={[styles.routeAddress, { color: theme.textPrimary }]}>
                {booking.dropLocation}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Interactive Mapbox Chauffeur Navigation HUD */}
      <MapboxRouteMap
        pickupLocation={booking.pickupLocation}
        dropLocation={booking.dropLocation || undefined}
        height={220}
        showFullscreenToggle={true}
      />

      {/* Airport Flight & Meet & Greet Panel (if Airport ride) */}
      {booking.flightName && (
        <View style={[styles.flightBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <View style={styles.flightRow}>
            <Ionicons name="airplane" size={16} color={theme.primary} />
            <Text style={[styles.flightTitle, { color: theme.textPrimary }]}>
              {booking.flightName} • Flight #{booking.flightNumber}
            </Text>
            {booking.flightTime && (
              <Badge label={`ETA ${booking.flightTime}`} variant="primary" size="sm" />
            )}
          </View>

          {booking.meetAndGreet && (
            <View style={[styles.meetGreetBox, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
              <Feather name="user-check" size={14} color={theme.primary} />
              <Text style={[styles.meetGreetText, { color: theme.textPrimary }]}>
                VIP Meet & Greet:{' '}
                <Text style={{ fontWeight: '800', color: theme.primary }}>
                  {booking.welcomeMessageName || 'Inside Baggage Claim'}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Special Badges: Child Seats / Pets / Luggage */}
      <View style={styles.specialBadgesRow}>
        <Badge label={`${booking.passengerCount || 2} Passengers`} variant="neutral" size="sm" />
        <Badge label={`${booking.luggageCount || 2} Bags`} variant="neutral" size="sm" />
        {((booking.childSeatRearFacing || 0) + (booking.childSeatFrontFacing || 0) + (booking.childSeatBooster || 0)) > 0 && (
          <Badge label="Child Seat Fitted" variant="warning" size="sm" />
        )}
        {booking.travelWithPet && (
          <Badge label="Pet Friendly" variant="warning" size="sm" />
        )}
      </View>

      {/* Phase Progression Big Action Button / Completed Summary */}
      {currentTripStep === 'COMPLETED' ? (
        <View
          style={[
            styles.completedCard,
            {
              backgroundColor: isDark ? 'rgba(37, 211, 102, 0.08)' : 'rgba(22, 163, 74, 0.06)',
              borderColor: isDark ? 'rgba(37, 211, 102, 0.25)' : 'rgba(22, 163, 74, 0.2)',
            },
          ]}
        >
          <View style={styles.completedHeader}>
            <View
              style={[
                styles.completedIconCircle,
                { backgroundColor: isDark ? 'rgba(37, 211, 102, 0.2)' : 'rgba(22, 163, 74, 0.15)' },
              ]}
            >
              <Feather name="check" size={20} color="#25D366" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.completedTitle, { color: theme.textPrimary }]}>
                Trip Finalized & Closed
              </Text>
              <Text style={[styles.completedSub, { color: isDark ? '#25D366' : '#16A34A' }]}>
                +${booking.totalAmount} Fare added to today's shift earnings
              </Text>
            </View>
          </View>
          <Button
            title="Start Next Scheduled Run"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              advanceToNextTrip()
            }}
            size="lg"
            variant="primary"
            iconRight={<Feather name="arrow-right" size={16} color={isDark ? '#000000' : '#FFFFFF'} />}
          />
        </View>
      ) : (
        <View style={styles.mainActionContainer}>
          <Button
            title={getActionButtonText(currentTripStep)}
            onPress={handleAdvance}
            size="lg"
            variant={currentTripStep === 'IN_TRANSIT' ? 'success' : 'primary'}
            iconRight={
              <Feather
                name="chevron-right"
                size={18}
                color={currentTripStep === 'IN_TRANSIT' ? '#FFFFFF' : (theme.isDark ? '#000000' : '#FFFFFF')}
              />
            }
          />
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
  },

  /* ─── Section 1: Status Header ─── */
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  resCodeLg: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  phaseHeadline: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  /* ─── Section 2: Visual Steps ─── */
  stepsContainer: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepConnector: {
    position: 'absolute',
    top: 14,
    right: '50%',
    left: '-50%',
    height: 2,
    borderRadius: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 5,
    zIndex: 1,
  },
  stepLabel: {
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  /* ─── Section 3: Passenger Card ─── */
  passengerCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  passengerPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  commsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  commCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* ─── Section 4: Route Card ─── */
  routeCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeIconCol: {
    alignItems: 'center',
    width: 22,
  },
  routeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDottedLine: {
    width: 0,
    height: 28,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 3,
  },
  routeTextCol: {
    flex: 1,
    paddingBottom: 2,
  },
  routeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  /* ─── Remaining sections (unchanged) ─── */
  flightBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  flightTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  meetGreetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  meetGreetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  specialBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  mainActionContainer: {
    marginTop: 4,
  },
  completedCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginTop: 4,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  completedSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
})
