import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useDriverRides } from '../../context/DriverRidesContext'
import { Booking } from '../../types'
import { Badge } from '../common/Badge'

interface AvailableRideCardProps {
  booking: Booking
}

export const AvailableRideCard: React.FC<AvailableRideCardProps> = ({ booking }) => {
  const { theme } = useTheme()
  const { acceptRide, openNavigation } = useDriverRides()

  const reservationCode = booking.id ? booking.id.slice(-6).toUpperCase() : 'OPEN'

  const formattedDate = new Date(booking.pickupTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const formattedTime = new Date(booking.pickupTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleClaim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    acceptRide(booking.id)
  }

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
          <View style={[styles.openDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.code, { color: theme.primary }]}>#{reservationCode}</Text>
          <Text style={[styles.time, { color: theme.textPrimary }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>
        <Badge
          label={`$${booking.totalAmount}`}
          variant="primary"
          size="md"
        />
      </View>

      <View style={styles.body}>
        {/* Vehicle required */}
        {booking.car && (
          <View style={styles.carRow}>
            <Feather name="shield" size={13} color={theme.primary} />
            <Text style={[styles.carText, { color: theme.textSecondary }]}>
              Vehicle Required: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{booking.car.brand} {booking.car.model}</Text>
            </Text>
          </View>
        )}

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

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => openNavigation(booking.pickupLocation)}
          style={[styles.mapBtn, { backgroundColor: theme.surfaceSubtle }]}
        >
          <Feather name="map" size={13} color={theme.textPrimary} />
          <Text style={[styles.mapBtnText, { color: theme.textPrimary }]}>Preview Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClaim}
          style={[styles.claimBtn, { backgroundColor: theme.primary }]}
        >
          <Feather name="check-circle" size={13} color="#0A0D14" />
          <Text style={styles.claimBtnText}>Claim & Accept Ride</Text>
        </TouchableOpacity>
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
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carText: {
    fontSize: 12,
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
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  claimBtnText: {
    color: '#0A0D14',
    fontSize: 11,
    fontWeight: '800',
  },
})
