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
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.code, { color: theme.primary }]}>#{reservationCode}</Text>
          <Text style={[styles.time, { color: theme.textPrimary }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>
        <Badge
          label={booking.tripType.replace(/_/g, ' ')}
          variant="primary"
          size="sm"
        />
      </View>

      <View style={styles.body}>
        {/* Passenger brief */}
        <View style={styles.passengerRow}>
          <Feather name="user" size={14} color={theme.textMuted} />
          <Text style={[styles.passengerName, { color: theme.textSecondary }]}>
            {booking.user?.name || 'VIP Client'}
          </Text>
          {booking.user?.phone && (
            <TouchableOpacity onPress={() => callPassenger(booking.user?.phone)} style={styles.callIconBtn}>
              <Feather name="phone-call" size={13} color={theme.primary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.fare, { color: theme.primary }]}>${booking.totalAmount}</Text>
        </View>

        {/* Route Details */}
        <View style={styles.routeBox}>
          <View style={styles.routeItem}>
            <Feather name="circle" size={11} color={theme.primary} />
            <Text style={[styles.routeText, { color: theme.textSecondary }]} numberOfLines={1}>
              {booking.pickupLocation}
            </Text>
          </View>
          {booking.dropLocation && (
            <View style={styles.routeItem}>
              <Feather name="map-pin" size={11} color={theme.error} />
              <Text style={[styles.routeText, { color: theme.textSecondary }]} numberOfLines={1}>
                {booking.dropLocation}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action footer */}
      <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => openNavigation(booking.pickupLocation)}
          style={[styles.mapBtn, { backgroundColor: theme.surfaceSubtle }]}
        >
          <Feather name="map" size={13} color={theme.textPrimary} />
          <Text style={[styles.mapBtnText, { color: theme.textPrimary }]}>Preview Map</Text>
        </TouchableOpacity>

        {onStartRide && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              onStartRide(booking)
            }}
            style={[styles.startBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.startBtnText, { color: theme.buttonText }]}>Set As Active Run</Text>
            <Feather name="arrow-right" size={13} color={theme.buttonText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.2,
    marginVertical: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  code: {
    fontSize: 13,
    fontWeight: '800',
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  callIconBtn: {
    padding: 4,
  },
  fare: {
    fontSize: 15,
    fontWeight: '800',
  },
  routeBox: {
    gap: 6,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mapBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#0A0D14',
    fontSize: 11,
    fontWeight: '800',
  },
})
