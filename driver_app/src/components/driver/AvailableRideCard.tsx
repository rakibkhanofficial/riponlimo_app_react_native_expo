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
      {/* ─── Fare + Meta Header ─── */}
      <View style={styles.topSection}>
        <View style={styles.topLeft}>
          <View style={[styles.pulseCircle, { backgroundColor: theme.isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.1)' }]}>
            <View style={[styles.pulseDot, { backgroundColor: '#25D366' }]} />
          </View>
          <View>
            <Text style={[styles.openLabel, { color: '#25D366' }]}>OPEN RUN</Text>
            <Text style={[styles.codeText, { color: theme.textMuted }]}>#{reservationCode}</Text>
          </View>
        </View>

        <View style={[styles.fareBadge, { backgroundColor: theme.isDark ? 'rgba(37,211,102,0.12)' : 'rgba(22,163,74,0.08)', borderColor: theme.isDark ? 'rgba(37,211,102,0.25)' : 'rgba(22,163,74,0.2)' }]}>
          <Text style={[styles.fareAmount, { color: '#25D366' }]}>${booking.totalAmount}</Text>
        </View>
      </View>

      {/* ─── Schedule + Vehicle ─── */}
      <View style={[styles.detailsSection, { borderTopColor: theme.borderSubtle }]}>
        <View style={styles.detailItem}>
          <View style={[styles.detailIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Feather name="clock" size={13} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.detailVal, { color: theme.textPrimary }]}>{formattedTime}</Text>
            <Text style={[styles.detailSub, { color: theme.textMuted }]}>{formattedDate}</Text>
          </View>
        </View>

        {booking.car && (
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
              <Feather name="shield" size={13} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.detailVal, { color: theme.textPrimary }]}>{booking.car.brand} {booking.car.model}</Text>
              <Text style={[styles.detailSub, { color: theme.textMuted }]}>Required Vehicle</Text>
            </View>
          </View>
        )}
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

      {/* ─── Actions ─── */}
      <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => openNavigation(booking.pickupLocation)}
          style={[styles.previewBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: theme.borderSubtle }]}
        >
          <Feather name="map" size={14} color={theme.primary} />
          <Text style={[styles.previewBtnText, { color: theme.textPrimary }]}>Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClaim}
          style={[styles.claimBtn, { backgroundColor: '#25D366' }]}
        >
          <Feather name="check-circle" size={14} color="#FFFFFF" />
          <Text style={styles.claimBtnText}>Claim Ride</Text>
        </TouchableOpacity>
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

  /* Top */
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  openLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  fareBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  /* Details */
  detailsSection: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailSub: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
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
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})
