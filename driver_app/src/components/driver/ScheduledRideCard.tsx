import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverRides } from '../../context/DriverRidesContext'
import { Booking } from '../../types'
import { Badge } from '../common/Badge'

interface ScheduledRideCardProps {
  booking: Booking
  onStartRide?: (booking: Booking) => void
}

export const ScheduledRideCard: React.FC<ScheduledRideCardProps> = ({
  booking,
  onStartRide,
}) => {
  const { theme } = useTheme()
  const { openNavigation, callPassenger } = useDriverRides()

  const reservationCode = booking.id ? booking.id.slice(-6).toUpperCase() : 'SCHED'

  const formattedDate = new Date(booking.pickupTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const formattedTime = new Date(booking.pickupTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          shadowColor: theme.isDark ? '#000000' : '#64748B',
        },
      ]}
    >
      {/* ─── Top: Time + Code + Badge ─── */}
      <View style={styles.topSection}>
        <View style={styles.timeCol}>
          <View style={[styles.timeIconCircle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Feather name="clock" size={16} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.timeText, { color: theme.textPrimary }]}>{formattedTime}</Text>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <Text style={[styles.code, { color: theme.primary }]}>#{reservationCode}</Text>
          <Badge
            label={booking.tripType.replace(/_/g, ' ')}
            variant="primary"
            size="sm"
          />
        </View>
      </View>

      {/* ─── Passenger + Fare ─── */}
      <View style={[styles.passengerSection, { borderTopColor: theme.borderSubtle }]}>
        <View style={styles.passengerLeft}>
          <View style={[styles.passengerAvatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Feather name="user" size={14} color={theme.textPrimary} />
          </View>
          <View style={styles.passengerInfo}>
            <Text style={[styles.passengerName, { color: theme.textPrimary }]}>
              {booking.user?.name || 'VIP Client'}
            </Text>
            {booking.user?.phone && (
              <TouchableOpacity onPress={() => callPassenger(booking.user?.phone)} style={styles.callRow}>
                <Feather name="phone" size={10} color={theme.primary} />
                <Text style={[styles.callText, { color: theme.primary }]}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.fare, { color: theme.textPrimary }]}>${booking.totalAmount}</Text>
      </View>

      {/* ─── Route with Visual Connector ─── */}
      <View style={[styles.routeSection, { borderTopColor: theme.borderSubtle }]}>
        <View style={styles.routeRow}>
          <View style={styles.routeIconCol}>
            <View style={[styles.routeDot, { backgroundColor: '#25D366' }]}>
              <Feather name="circle" size={7} color="#FFFFFF" />
            </View>
            {booking.dropLocation && (
              <View style={[styles.routeLine, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            )}
          </View>
          <Text style={[styles.routeAddress, { color: theme.textSecondary }]} numberOfLines={1}>
            {booking.pickupLocation}
          </Text>
        </View>

        {booking.dropLocation && (
          <View style={[styles.routeRow, { marginTop: 2 }]}>
            <View style={styles.routeIconCol}>
              <View style={[styles.routeDot, { backgroundColor: theme.error }]}>
                <Feather name="map-pin" size={7} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.routeAddress, { color: theme.textSecondary }]} numberOfLines={1}>
              {booking.dropLocation}
            </Text>
          </View>
        )}
      </View>

      {/* ─── Actions Footer ─── */}
      <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => openNavigation(booking.pickupLocation)}
          style={[styles.mapBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: theme.borderSubtle }]}
        >
          <Feather name="map" size={14} color={theme.primary} />
          <Text style={[styles.mapBtnText, { color: theme.textPrimary }]}>Preview</Text>
        </TouchableOpacity>

        {onStartRide && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              onStartRide(booking)
            }}
            style={[styles.startBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.startBtnText, { color: theme.isDark ? '#000000' : '#FFFFFF' }]}>
              Set Active
            </Text>
            <Feather name="arrow-right" size={14} color={theme.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  topRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  code: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Passenger */
  passengerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  passengerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  passengerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  callText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fare: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  /* Route */
  routeSection: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeIconCol: {
    alignItems: 'center',
    width: 18,
  },
  routeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLine: {
    width: 0,
    height: 16,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  routeAddress: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  mapBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
})
