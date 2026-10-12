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

export const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ booking }) => {
  const { theme } = useTheme()
  const {
    currentTripStep,
    advanceActiveTrip,
    openNavigation,
    callPassenger,
    smsPassenger,
  } = useDriverRides()

  const reservationCode = booking.id ? booking.id.slice(-6).toUpperCase() : 'ACTIVE'

  const getStepTitle = (step: TripStep) => {
    switch (step) {
      case 'ASSIGNED':
        return 'Dispatched • Ready to Roll'
      case 'EN_ROUTE':
        return 'En Route to Pickup Location'
      case 'ARRIVED':
        return 'Arrived at Curbside / Terminal'
      case 'IN_TRANSIT':
        return 'Passenger Boarded • In Transit'
      case 'COMPLETED':
        return 'Trip Completed'
    }
  }

  const getActionButtonText = (step: TripStep) => {
    switch (step) {
      case 'ASSIGNED':
        return 'Start Journey to Pickup'
      case 'EN_ROUTE':
        return 'I Have Arrived at Pickup'
      case 'ARRIVED':
        return 'Passenger Boarded • Start Trip'
      case 'IN_TRANSIT':
        return 'Complete Ride & Record Fare'
      case 'COMPLETED':
        return 'Ride Finalized'
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
      {/* Top Banner with reservation code and status */}
      <View style={styles.topRow}>
        <View style={styles.codeRow}>
          <View style={[styles.activePill, { backgroundColor: theme.driverActiveBg, borderColor: theme.driverActive }]}>
            <View style={[styles.pulseDot, { backgroundColor: theme.driverActive }]} />
            <Text style={[styles.activePillText, { color: theme.driverActive }]}>ACTIVE RUN</Text>
          </View>
          <Text style={[styles.resCode, { color: theme.textPrimary }]}>#{reservationCode}</Text>
        </View>
        <Badge
          label={booking.tripType.replace(/_/g, ' ')}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Progress Phase Bar */}
      <View style={[styles.phaseBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
        <View style={styles.phaseHeader}>
          <Text style={[styles.phaseLabel, { color: theme.textMuted }]}>Current Chauffeur Phase</Text>
          <Text style={[styles.phaseTitle, { color: theme.textPrimary }]}>
            {getStepTitle(currentTripStep)}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          {['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT', 'COMPLETED'].map((step, idx) => {
            const stepsOrder = ['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT', 'COMPLETED']
            const currentIndex = stepsOrder.indexOf(currentTripStep)
            const isDone = currentIndex >= idx
            return (
              <View
                key={step}
                style={[
                  styles.progressBarSegment,
                  {
                    backgroundColor: isDone ? '#25D366' : 'rgba(255, 255, 255, 0.08)',
                  },
                ]}
              />
            )
          })}
        </View>
      </View>

      {/* Passenger & Communication Panel */}
      <View style={[styles.passengerPanel, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
        <View style={styles.passengerInfo}>
          <View style={[styles.passengerAvatar, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Feather name="user" size={18} color={theme.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.passengerName, { color: theme.textPrimary }]}>
              {booking.user?.name || 'VIP Client'}
            </Text>
            <Text style={[styles.passengerPhone, { color: theme.textMuted }]}>
              {booking.user?.phone || 'No phone provided'}
            </Text>
          </View>
        </View>

        <View style={styles.commsButtons}>
          <TouchableOpacity
            onPress={() => callPassenger(booking.user?.phone)}
            style={[styles.commBtn, { backgroundColor: theme.card, borderColor: theme.borderSubtle }]}
          >
            <Feather name="phone" size={15} color="#25D366" />
            <Text style={[styles.commBtnText, { color: theme.textPrimary }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => smsPassenger(booking.user?.phone)}
            style={[styles.commBtn, { backgroundColor: theme.card, borderColor: theme.borderSubtle }]}
          >
            <Feather name="message-square" size={15} color={theme.textPrimary} />
            <Text style={[styles.commBtnText, { color: theme.textPrimary }]}>SMS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Addresses */}
      <View style={styles.routeSection}>
        <View style={styles.routeItem}>
          <Feather name="circle" size={14} color={theme.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeLabel, { color: theme.textMuted }]}>Pickup Address</Text>
            <Text style={[styles.routeAddress, { color: theme.textPrimary }]}>
              {booking.pickupLocation}
            </Text>
          </View>
        </View>

        {booking.dropLocation && (
          <View style={[styles.routeItem, { marginTop: 10 }]}>
            <Feather name="map-pin" size={14} color={theme.error} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeLabel, { color: theme.textMuted }]}>Drop-off Destination</Text>
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

      {/* Navigation Quick Action */}
      <TouchableOpacity
        onPress={() => openNavigation(currentDestination)}
        style={[styles.navActionBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}
      >
        <Feather name="navigation" size={15} color="#25D366" />
        <Text style={[styles.navActionText, { color: theme.textPrimary }]}>
          Open GPS Navigation ({currentTripStep === 'IN_TRANSIT' ? 'Drop-off' : 'Pickup'})
        </Text>
        <Feather name="external-link" size={14} color={theme.textMuted} />
      </TouchableOpacity>

      {/* Phase Progression Big Action Button */}
      {currentTripStep !== 'COMPLETED' && (
        <View style={styles.mainActionContainer}>
          <Button
            title={getActionButtonText(currentTripStep)}
            onPress={handleAdvance}
            size="lg"
            variant={currentTripStep === 'IN_TRANSIT' ? 'success' : 'primary'}
            iconRight={<Feather name="chevron-right" size={18} color="#0A0D14" />}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resCode: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  phaseBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  phaseHeader: {
    marginBottom: 8,
  },
  phaseLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  passengerPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  passengerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  passengerPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  commsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  commBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  commBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeSection: {
    marginBottom: 14,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  routeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 18,
  },
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
  navActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  navActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainActionContainer: {
    marginTop: 4,
  },
})
