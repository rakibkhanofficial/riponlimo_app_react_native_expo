import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { MapboxRouteMap } from '../common/MapboxRouteMap'
import { resolveCarImage } from '../../assets/carImages'
import { PaymentMethod } from '../../types'

interface Step3CheckoutProps {
  onBookingSuccess: () => void
}

export const Step3Checkout: React.FC<Step3CheckoutProps> = ({ onBookingSuccess }) => {
  const { theme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const {
    form,
    updateForm,
    selectedCar,
    selectedService,
    totalPrice,
    prevStep,
    submitBooking,
    isSubmitting,
    validationErrors,
  } = useBooking()

  const [agreedToTerms, setAgreedToTerms] = useState(true)

  // Stripe card fields
  const [cardName, setCardName] = useState(form.fullName || 'VIP Client')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('123')
  const [cardZip, setCardZip] = useState('10001')

  const handleFillTestCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setCardNumber('4242 4242 4242 4242')
    setCardExpiry('12/28')
    setCardCvc('123')
    setCardZip('10001')
    setCardName(form.fullName || 'VIP Client')
  }

  const handleConfirmBooking = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Agreement', 'Please accept the terms and conditions to proceed.')
      return
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await submitBooking()
      onBookingSuccess()
    } catch (err: any) {
      Alert.alert('Booking Notice', err.message || 'Failed to submit reservation')
    }
  }

  const primaryImage = selectedCar?.images?.[0] || '/cars/cadillac-escalade.png'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Trip Summary Card */}
      <Card
        title="Reservation Summary"
        subtitle="Review your chauffeur journey details"
        icon={<Feather name="file-text" size={16} color={theme.primary} />}
      >
        {/* Selected Vehicle Overview */}
        <View style={[styles.vehicleRow, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
          <Image
            source={resolveCarImage(primaryImage)}
            style={styles.vehicleThumb}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.vehicleBrand, { color: theme.primary }]}>{selectedCar?.brand}</Text>
            <Text style={[styles.vehicleModel, { color: theme.textPrimary }]}>{selectedCar?.model}</Text>
            <View style={styles.badgeRow}>
              <Badge label={`${form.passengerCount} Passengers`} size="sm" variant="neutral" />
              <Badge label={`${form.luggageCount} Bags`} size="sm" variant="neutral" />
            </View>
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.summaryList}>
          <View style={styles.summaryItem}>
            <Feather name="circle" size={14} color={theme.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Pickup Location</Text>
              <Text style={[styles.itemValue, { color: theme.textPrimary }]}>{form.pickupLocation}</Text>
            </View>
          </View>

          {form.stops.map((stop, idx) => (
            <View key={idx} style={styles.summaryItem}>
              <Feather name="map-pin" size={14} color={theme.accent} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Stop #{idx + 1}</Text>
                <Text style={[styles.itemValue, { color: theme.textPrimary }]}>{stop}</Text>
              </View>
            </View>
          ))}

          {form.tripType !== 'HOURLY' && (
            <View style={styles.summaryItem}>
              <Feather name="map-pin" size={14} color={theme.error} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Drop-off Location</Text>
                <Text style={[styles.itemValue, { color: theme.textPrimary }]}>{form.dropLocation}</Text>
              </View>
            </View>
          )}

          <View style={styles.summaryItem}>
            <Feather name="calendar" size={14} color={theme.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Schedule</Text>
              <Text style={[styles.itemValue, { color: theme.textPrimary }]}>
                {form.pickupDate} at {form.pickupTime}
                {form.tripType === 'HOURLY' ? ` (${form.totalHours || 2} Hours Charter)` : ''}
              </Text>
            </View>
          </View>

          {form.tripType === 'AIRPORT_TRANSFER' && form.flightName ? (
            <View style={styles.summaryItem}>
              <Ionicons name="airplane-outline" size={15} color={theme.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Flight Details</Text>
                <Text style={[styles.itemValue, { color: theme.textPrimary }]}>
                  {form.flightName} • Flight #{form.flightNumber || 'N/A'}
                  {form.meetAndGreet ? ' (VIP Meet & Greet)' : ''}
                </Text>
              </View>
            </View>
          ) : null}

          {form.isReturnTrip && (
            <View style={styles.summaryItem}>
              <Feather name="repeat" size={14} color={theme.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemLabel, { color: theme.textMuted }]}>Round-Trip Return</Text>
                <Text style={[styles.itemValue, { color: theme.textPrimary }]}>
                  {form.returnDate} at {form.returnTime}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Route Preview on Mapbox */}
        {(form.pickupLocation || form.dropLocation) && (
          <View style={{ marginTop: 12 }}>
            <MapboxRouteMap
              pickupLocation={form.pickupLocation}
              dropLocation={form.dropLocation}
              stops={form.stops}
              height={175}
            />
          </View>
        )}
      </Card>

      {/* 2. Contact Information Card */}
      <Card
        title="Contact Information"
        subtitle={isAuthenticated ? 'Logged in as Client' : 'Reservation confirmation will be sent here'}
        icon={<Feather name="user" size={16} color={theme.primary} />}
      >
        <Input
          label="Full Name"
          placeholder="e.g. Johnathan Sterling"
          value={form.fullName}
          onChangeText={text => updateForm({ fullName: text })}
          leftIcon={<Feather name="user" size={14} color={theme.primary} />}
          error={validationErrors.fullName}
        />

        <Input
          label="Phone Number"
          placeholder="+1 (555) 019-2834"
          keyboardType="phone-pad"
          value={form.phoneNumber}
          onChangeText={text => updateForm({ phoneNumber: text })}
          leftIcon={<Feather name="phone" size={14} color={theme.primary} />}
          error={validationErrors.phoneNumber}
        />

        <Input
          label="Email Address"
          placeholder="client@luxury.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.emailAddress}
          onChangeText={text => updateForm({ emailAddress: text })}
          leftIcon={<Feather name="mail" size={14} color={theme.primary} />}
          error={validationErrors.emailAddress}
        />

        {!isAuthenticated && (
          <Input
            label="Optional Password (Create Account)"
            placeholder="Create password to track rides"
            isPassword
            value={form.guestPassword}
            onChangeText={text => updateForm({ guestPassword: text })}
            leftIcon={<Feather name="lock" size={14} color={theme.primary} />}
          />
        )}

        <Input
          label="Special Instructions for Chauffeur"
          placeholder="e.g., Gate code #4012, flight early arrival, specific music preference"
          multiline
          numberOfLines={2}
          value={form.specialInstructions}
          onChangeText={text => updateForm({ specialInstructions: text })}
          leftIcon={<Feather name="message-square" size={14} color={theme.primary} />}
          style={{ height: 60, textAlignVertical: 'top' }}
        />
      </Card>

      {/* 3. Payment Method Selection */}
      <Card
        title="Payment Method"
        subtitle="Transparent pricing with zero hidden fees"
        icon={<Feather name="credit-card" size={16} color={theme.primary} />}
      >
        <TouchableOpacity
          onPress={() => updateForm({ paymentMethod: 'PAY_LATER' })}
          style={[
            styles.paymentOption,
            {
              backgroundColor: form.paymentMethod === 'PAY_LATER' ? theme.primaryLight : theme.surface,
              borderColor: form.paymentMethod === 'PAY_LATER' ? theme.primary : theme.border,
            },
          ]}
        >
          <View style={styles.paymentLeft}>
            <Feather name="dollar-sign" size={18} color={theme.primary} />
            <View>
              <Text style={[styles.paymentTitle, { color: theme.textPrimary }]}>
                Pay Later / Cash to Chauffeur
              </Text>
              <Text style={[styles.paymentSubtitle, { color: theme.textMuted }]}>
                Pay securely in car via card terminal or cash upon completion
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.radio,
              { borderColor: form.paymentMethod === 'PAY_LATER' ? theme.primary : theme.border },
            ]}
          >
            {form.paymentMethod === 'PAY_LATER' && (
              <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => updateForm({ paymentMethod: 'ONLINE' })}
          style={[
            styles.paymentOption,
            {
              backgroundColor: form.paymentMethod === 'ONLINE' ? theme.primaryLight : theme.surface,
              borderColor: form.paymentMethod === 'ONLINE' ? theme.primary : theme.border,
            },
          ]}
        >
          <View style={styles.paymentLeft}>
            <Feather name="credit-card" size={18} color={theme.primary} />
            <View>
              <Text style={[styles.paymentTitle, { color: theme.textPrimary }]}>
                Pay with Card (Stripe Secure)
              </Text>
              <Text style={[styles.paymentSubtitle, { color: theme.textMuted }]}>
                Visa, MasterCard, Amex, Apple Pay
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.radio,
              { borderColor: form.paymentMethod === 'ONLINE' ? theme.primary : theme.border },
            ]}
          >
            {form.paymentMethod === 'ONLINE' && (
              <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
            )}
          </View>
        </TouchableOpacity>

        {/* Stripe Card Input Form */}
        {form.paymentMethod === 'ONLINE' && (
          <View style={[styles.stripeCardBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <View style={styles.stripeHeaderRow}>
              <View style={styles.stripeTitleWrap}>
                <Ionicons name="shield-checkmark" size={14} color="#25D366" />
                <Text style={[styles.stripeTitle, { color: theme.textPrimary }]}>STRIPE SECURE CARD ENTRY</Text>
              </View>
              <Text style={styles.stripeBadge}>256-BIT ENCRYPTION</Text>
            </View>

            <Input
              label="Cardholder Name"
              placeholder="e.g. Eleanor Vance"
              value={cardName}
              onChangeText={setCardName}
              leftIcon={<Feather name="user" size={14} color={theme.primary} />}
            />

            <Input
              label="Card Number"
              placeholder="4242 •••• •••• 4242"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
              leftIcon={<Feather name="credit-card" size={14} color={theme.primary} />}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Expires"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  leftIcon={<Feather name="calendar" size={14} color={theme.primary} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="CVC / CVV"
                  placeholder="CVC"
                  keyboardType="numeric"
                  value={cardCvc}
                  onChangeText={setCardCvc}
                  leftIcon={<Feather name="lock" size={14} color={theme.primary} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Zip Code"
                  placeholder="10001"
                  keyboardType="numeric"
                  value={cardZip}
                  onChangeText={setCardZip}
                  leftIcon={<Feather name="map-pin" size={14} color={theme.primary} />}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleFillTestCard}
              style={[styles.testCardBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
              <Feather name="zap" size={12} color={theme.primary} />
              <Text style={[styles.testCardBtnText, { color: theme.primary }]}>AUTOFILL STRIPE TEST CARD (4242)</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* 4. Guaranteed Rate Itemized Fare */}
      <Card
        title="Guaranteed Total Rate"
        subtitle="All tolls, taxes, and premium gratuity included"
        icon={<Feather name="check-circle" size={16} color={theme.primary} />}
        highlighted
      >
        <View style={styles.fareRow}>
          <Text style={[styles.fareLabel, { color: theme.textMuted }]}>Vehicle Base Fare ({selectedCar?.model})</Text>
          <Text style={[styles.fareValue, { color: theme.textPrimary }]}>${selectedCar?.rentPrice || 59}</Text>
        </View>

        {form.tripType !== 'HOURLY' ? (
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>
              Estimated Mileage ({form.distanceMiles || 17.5} mi @ ${selectedCar?.pricePerMile || 2.75}/mi)
            </Text>
            <Text style={[styles.fareValue, { color: theme.textPrimary }]}>
              ${Math.round((form.distanceMiles || 17.5) * (selectedCar?.pricePerMile || 2.75))}
            </Text>
          </View>
        ) : (
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>
              Hourly Charter ({form.totalHours || 2} Hours @ ${selectedCar?.rentPrice || 150}/hr)
            </Text>
            <Text style={[styles.fareValue, { color: theme.textPrimary }]}>
              ${(form.totalHours || 2) * (selectedCar?.rentPrice || 150)}
            </Text>
          </View>
        )}

        {form.meetAndGreet && (
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>VIP Meet & Greet Service</Text>
            <Text style={[styles.fareValue, { color: theme.textPrimary }]}>
              +${form.meetAndGreetType === 'INSIDE_BAGGAGE' ? 35 : 15}
            </Text>
          </View>
        )}

        {form.travelWithPet && (
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>Pet Transport Fee</Text>
            <Text style={[styles.fareValue, { color: theme.textPrimary }]}>+${(form.petCount || 1) * 20}</Text>
          </View>
        )}

        {(form.childSeatRearFacing > 0 || form.childSeatFrontFacing > 0 || form.childSeatBooster > 0) && (
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textMuted }]}>Certified Child Seats</Text>
            <Text style={[styles.fareValue, { color: theme.textPrimary }]}>
              +${(form.childSeatRearFacing + form.childSeatFrontFacing + form.childSeatBooster) * 15}
            </Text>
          </View>
        )}

        <View style={[styles.totalRow, { borderTopColor: theme.borderSubtle }]}>
          <View>
            <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Guaranteed Trip Total</Text>
            <Text style={[styles.totalSub, { color: theme.textMuted }]}>Rate locked upon booking</Text>
          </View>
          <Text style={[styles.totalPrice, { color: theme.primary }]}>${totalPrice}</Text>
        </View>

        {/* Terms Agreement */}
        <TouchableOpacity
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={styles.termsRow}
        >
          <View style={[styles.checkbox, { borderColor: agreedToTerms ? theme.primary : theme.border }]}>
            {agreedToTerms && <Feather name="check" size={13} color={theme.primary} />}
          </View>
          <Text style={[styles.termsText, { color: theme.textMuted }]}>
            I accept the 24-hr free cancellation policy and terms of executive service.
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Buttons */}
      <View style={styles.actionRow}>
        <View style={{ flex: 1 }}>
          <Button
            title="Change Vehicle"
            variant="secondary"
            onPress={prevStep}
            icon={<Feather name="arrow-left" size={16} color={theme.textPrimary} />}
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <Button
            title={isSubmitting ? 'Securing Ride...' : `Book Ride ($${totalPrice})`}
            onPress={handleConfirmBooking}
            loading={isSubmitting}
            iconRight={<Feather name="check-circle" size={16} color="#0A0D14" />}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 2,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
  },
  vehicleThumb: {
    width: 75,
    height: 50,
  },
  vehicleBrand: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  summaryList: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 2,
    borderWidth: 1,
    marginVertical: 6,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  paymentSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 1,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  fareLabel: {
    fontSize: 12,
  },
  fareValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  totalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 11,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  stripeCardBox: {
    padding: 14,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 12,
  },
  stripeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stripeTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripeTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stripeBadge: {
    color: '#25D366',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  testCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 8,
  },
  testCardBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
})
