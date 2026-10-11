import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { Booking } from '../../types'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface BookingSuccessModalProps {
  visible: boolean
  booking: Booking | null
  onClose: () => void
  onViewRides: () => void
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  visible,
  booking,
  onClose,
  onViewRides,
}) => {
  const { theme } = useTheme()

  if (!booking) return null

  const reservationCode = booking.id ? booking.id.slice(-6).toUpperCase() : 'CONFIRMED'

  const handleViewRides = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onViewRides()
  }

  const handleBookAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          {/* Success Icon */}
          <View style={[styles.iconBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
            <Feather name="check" size={32} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>Reservation Secured</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Your luxury chauffeur is scheduled and confirmed.
          </Text>

          {/* Reservation Code Box */}
          <View style={[styles.codeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <Text style={[styles.codeLabel, { color: theme.textMuted }]}>Reservation Number</Text>
            <Text style={[styles.codeValue, { color: theme.primary }]}>#{reservationCode}</Text>
          </View>

          {/* Summary Details */}
          <View style={[styles.detailsBox, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Pickup Location</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]} numberOfLines={1}>
                {booking.pickupLocation}
              </Text>
            </View>

            {booking.dropLocation && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Destination</Text>
                <Text style={[styles.detailValue, { color: theme.textPrimary }]} numberOfLines={1}>
                  {booking.dropLocation}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Date & Time</Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {new Date(booking.pickupTime).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Guaranteed Total</Text>
              <Text style={[styles.detailPrice, { color: theme.primary }]}>
                ${booking.totalAmount}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <Button
              title="View In My Rides"
              onPress={handleViewRides}
              size="lg"
              icon={<Feather name="list" size={17} color="#0A0D14" />}
            />
            <View style={{ height: 10 }} />
            <Button
              title="Book Another Ride"
              variant="secondary"
              onPress={handleBookAnother}
              size="md"
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  codeBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14,
  },
  codeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  detailsBox: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
  },
  detailPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
  },
})
