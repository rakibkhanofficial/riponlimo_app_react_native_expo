import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useBooking } from '../../context/BookingContext'
import { Card } from '../common/Card'
import { Input } from '../common/Input'
import { Counter } from '../common/Counter'
import { Button } from '../common/Button'
import { SegmentedControl, SegmentOption } from '../common/SegmentedControl'
import { DatePickerModal } from '../common/DatePickerModal'
import { TimePickerModal } from '../common/TimePickerModal'
import { MapboxRouteMap } from '../common/MapboxRouteMap'
import { LocationPickerMapModal } from '../common/LocationPickerMapModal'
import { TripType } from '../../types'

const TRIP_TYPE_OPTIONS: SegmentOption<TripType>[] = [
  {
    value: 'POINT_TO_POINT',
    label: 'Point to Point',
    icon: <Feather name="navigation" size={14} />,
  },
  {
    value: 'AIRPORT_TRANSFER',
    label: 'Airport Transfer',
    icon: <Ionicons name="airplane-outline" size={15} />,
  },
  {
    value: 'HOURLY',
    label: 'Hourly Charter',
    icon: <Feather name="clock" size={14} />,
  },
]

interface TriggerFieldProps {
  label: string
  value?: string
  placeholder: string
  icon: React.ReactNode
  error?: string
  onPress: () => void
  disabled?: boolean
}

const TriggerField: React.FC<TriggerFieldProps> = ({
  label,
  value,
  placeholder,
  icon,
  error,
  onPress,
  disabled,
}) => {
  const { theme } = useTheme()
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label.toUpperCase()}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.fieldButton,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <View style={styles.fieldContent}>
          <View style={styles.fieldIcon}>{icon}</View>
          <Text
            style={[
              styles.fieldText,
              { color: value ? theme.textPrimary : theme.textMuted },
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
        <Feather name="chevron-down" size={14} color={theme.textMuted} />
      </TouchableOpacity>
      {error ? <Text style={[styles.fieldError, { color: theme.error }]}>{error}</Text> : null}
    </View>
  )
}

export const Step1TripDetails: React.FC = () => {
  const { theme } = useTheme()
  const {
    cars,
    form,
    updateForm,
    addStop,
    removeStop,
    updateStop,
    swapLocations,
    nextStep,
    estimatedETA,
    validationErrors,
  } = useBooking()

  const [showChildSeats, setShowChildSeats] = useState(
    form.childSeatRearFacing > 0 || form.childSeatFrontFacing > 0 || form.childSeatBooster > 0
  )
  const [showAdditionalContacts, setShowAdditionalContacts] = useState(
    form.additionalContacts.length > 0
  )

  // Custom modal pickers state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerTarget, setDatePickerTarget] = useState<'pickupDate' | 'returnDate'>('pickupDate')
  const [timePickerTarget, setTimePickerTarget] = useState<'pickupTime' | 'hourlyStart' | 'hourlyEnd' | 'returnTime' | null>(null)

  // Mapbox location picker state
  const [locationPickerTarget, setLocationPickerTarget] = useState<'pickup' | 'drop' | null>(null)
  const [showRouteMap, setShowRouteMap] = useState(true)

  const selectedCar = cars.find(c => c.id === form.selectedCarId)

  const handleTripTypeChange = (type: TripType) => {
    updateForm({ tripType: type })
  }

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    swapLocations()
  }

  // Hourly duration calculation
  const updateHourlyTimes = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    if (!isNaN(startH) && !isNaN(endH)) {
      let diffMinutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0))
      if (diffMinutes <= 0) diffMinutes += 24 * 60
      const totalHours = Math.max(2, Math.round((diffMinutes / 60) * 10) / 10)
      updateForm({ pickupTime: start, dropTime: end, totalHours })
    }
  }

  const handleDateSelect = (dateStr: string) => {
    if (datePickerTarget === 'pickupDate') {
      updateForm({ pickupDate: dateStr })
    } else {
      updateForm({ returnDate: dateStr })
    }
    setShowDatePicker(false)
  }

  const handleTimeSelect = (timeStr: string) => {
    if (timePickerTarget === 'pickupTime') {
      updateForm({ pickupTime: timeStr })
    } else if (timePickerTarget === 'hourlyStart') {
      updateHourlyTimes(timeStr, form.dropTime || '18:00')
    } else if (timePickerTarget === 'hourlyEnd') {
      updateHourlyTimes(form.pickupTime || '14:00', timeStr)
    } else if (timePickerTarget === 'returnTime') {
      updateForm({ returnTime: timeStr })
    }
    setTimePickerTarget(null)
  }

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    if (parts.length < 2) return timeStr
    const h = parseInt(parts[0], 10)
    const m = parts[1]
    if (isNaN(h)) return timeStr
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${String(h12).padStart(2, '0')}:${m} ${period}`
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Preselected Car Banner (when arrived from Fleet) */}
      {selectedCar && (
        <View style={[styles.preselectedBanner, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <View style={styles.preselectedLeft}>
            <Text style={[styles.preselectedEyebrow, { color: theme.primary }]}>RESERVING VEHICLE</Text>
            <Text style={[styles.preselectedCarName, { color: theme.textPrimary }]}>
              {selectedCar.brand} {selectedCar.model}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => updateForm({ selectedCarId: '' })}
            style={[styles.preselectedChangeBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.preselectedChangeText, { color: theme.textSecondary }]}>CHANGE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 1. Trip Type Selector */}
      <View style={styles.sectionMargin}>
        <SegmentedControl
          options={TRIP_TYPE_OPTIONS}
          selectedValue={form.tripType}
          onSelect={handleTripTypeChange}
        />
      </View>

      {/* 2. Route Details Box */}
      <Card
        title="Route Details"
        subtitle={form.tripType === 'HOURLY' ? 'Origin & Destinations' : 'Pickup & Drop-off Locations'}
        icon={<Feather name="map-pin" size={16} color={theme.primary} />}
        rightAction={
          form.tripType !== 'HOURLY' ? (
            <TouchableOpacity
              onPress={handleSwap}
              style={[styles.swapBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
              accessibilityLabel="Swap Pickup and Dropoff"
            >
              <Feather name="repeat" size={13} color={theme.primary} />
              <Text style={[styles.swapBtnText, { color: theme.primary }]}>Swap</Text>
            </TouchableOpacity>
          ) : undefined
        }
      >
        <View style={styles.inputHeaderActionRow}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>PICKUP LOCATION</Text>
          <TouchableOpacity
            onPress={() => setLocationPickerTarget('pickup')}
            style={[styles.pinMapBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
          >
            <Feather name="map" size={11} color={theme.primary} />
            <Text style={[styles.pinMapBtnText, { color: theme.primary }]}>PIN ON MAP</Text>
          </TouchableOpacity>
        </View>
        <Input
          placeholder="e.g., JFK Airport Terminal 4 or 450 Lexington Ave"
          value={form.pickupLocation}
          onChangeText={text => updateForm({ pickupLocation: text })}
          leftIcon={<Feather name="circle" size={14} color={theme.primary} />}
          error={validationErrors.pickupLocation}
        />

        {/* Multi-stops */}
        {form.stops.map((stop, index) => (
          <View key={index} style={styles.stopRow}>
            <View style={{ flex: 1 }}>
              <Input
                label={`Stop #${index + 1}`}
                placeholder="Intermediate stop address"
                value={stop}
                onChangeText={text => updateStop(index, text)}
                leftIcon={<Feather name="map-pin" size={14} color={theme.accent} />}
              />
            </View>
            <TouchableOpacity
              onPress={() => removeStop(index)}
              style={[styles.removeStopBtn, { borderColor: theme.border }]}
            >
              <Feather name="x" size={16} color={theme.error} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={addStop}
          style={[styles.addStopBtn, { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceSubtle }]}
        >
          <Feather name="plus-circle" size={14} color={theme.primary} />
          <Text style={[styles.addStopText, { color: theme.primary }]}>Add Stop</Text>
        </TouchableOpacity>

        {form.tripType !== 'HOURLY' && (
          <>
            <View style={styles.inputHeaderActionRow}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>DROP-OFF LOCATION</Text>
              <TouchableOpacity
                onPress={() => setLocationPickerTarget('drop')}
                style={[styles.pinMapBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
              >
                <Feather name="map" size={11} color={theme.primary} />
                <Text style={[styles.pinMapBtnText, { color: theme.primary }]}>PIN ON MAP</Text>
              </TouchableOpacity>
            </View>
            <Input
              placeholder="e.g., The Plaza Hotel, 5th Avenue, NYC"
              value={form.dropLocation}
              onChangeText={text => updateForm({ dropLocation: text })}
              leftIcon={<Feather name="map-pin" size={14} color={theme.error} />}
              error={validationErrors.dropLocation}
            />
          </>
        )}

        {/* Live Mapbox Route Preview */}
        {(form.pickupLocation || form.dropLocation) && (
          <View style={styles.mapContainerMargin}>
            <MapboxRouteMap
              pickupLocation={form.pickupLocation}
              dropLocation={form.dropLocation}
              stops={form.stops}
              height={190}
            />
          </View>
        )}

        {/* Mileage & Time Single Line Display (strict client requirement) */}
        {form.tripType !== 'HOURLY' && (
          <View style={[styles.mileagePill, { backgroundColor: theme.surfaceSubtle, borderColor: theme.primary }]}>
            <Text style={[styles.mileageText, { color: theme.textSecondary }]}>
              Distance: <Text style={{ color: theme.primary, fontWeight: '700' }}>{form.distanceMiles || 17.5} miles</Text>
              {'  •  '}Duration: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{form.durationMinutes || 45}m</Text>
              {'  •  '}ETA: <Text style={{ color: theme.primary, fontWeight: '700' }}>{estimatedETA || 'Arrival: 8:45 AM'}</Text>
            </Text>
          </View>
        )}
      </Card>

      {/* 3. Schedule Box */}
      <Card
        title="Schedule"
        subtitle="Reservation Date & Departure Time"
        icon={<Feather name="calendar" size={16} color={theme.primary} />}
      >
        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <TriggerField
              label="Pickup Date"
              placeholder="YYYY-MM-DD"
              value={form.pickupDate}
              icon={<Feather name="calendar" size={14} color={theme.primary} />}
              error={validationErrors.pickupDate}
              onPress={() => {
                setDatePickerTarget('pickupDate')
                setShowDatePicker(true)
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TriggerField
              label="Pickup Time"
              placeholder="HH:mm"
              value={form.pickupTime ? formatDisplayTime(form.pickupTime) : undefined}
              icon={<Feather name="clock" size={14} color={theme.primary} />}
              error={validationErrors.pickupTime}
              onPress={() => setTimePickerTarget('pickupTime')}
            />
          </View>
        </View>

        {/* Hourly Charter Specific Schedule: Start Time, End Time & Total Hours on same line */}
        {form.tripType === 'HOURLY' && (
          <View style={[styles.hourlyBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <View style={styles.threeColumnRow}>
              <View style={{ flex: 1 }}>
                <TriggerField
                  label="Start Time"
                  placeholder="14:00"
                  value={form.pickupTime ? formatDisplayTime(form.pickupTime) : undefined}
                  icon={<Feather name="play-circle" size={13} color={theme.primary} />}
                  onPress={() => setTimePickerTarget('hourlyStart')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TriggerField
                  label="End Time"
                  placeholder="18:00"
                  value={form.dropTime ? formatDisplayTime(form.dropTime) : undefined}
                  icon={<Feather name="stop-circle" size={13} color={theme.primary} />}
                  onPress={() => setTimePickerTarget('hourlyEnd')}
                />
              </View>
              <View style={{ flex: 0.9 }}>
                <Input
                  label="Total Hours"
                  placeholder="4"
                  value={String(form.totalHours || 2)}
                  keyboardType="numeric"
                  onChangeText={text => updateForm({ totalHours: Math.max(2, parseFloat(text) || 2) })}
                />
              </View>
            </View>
            <Text style={[styles.hourlyHint, { color: theme.textMuted }]}>
              Minimum charter duration is 2 hours. Chauffeur at your continuous disposal.
            </Text>
          </View>
        )}
      </Card>

      {/* 4. Airport Transfer Flight Info (When tripType === 'AIRPORT_TRANSFER') */}
      {form.tripType === 'AIRPORT_TRANSFER' && (
        <Card
          title="Airport & Flight Details"
          subtitle="Chauffeur tracks incoming flights for automatic delays"
          icon={<Ionicons name="airplane" size={16} color={theme.primary} />}
        >
          <Input
            label="Airline Name"
            placeholder="e.g. Delta Air Lines, Emirates, United"
            value={form.flightName}
            onChangeText={text => updateForm({ flightName: text })}
            leftIcon={<Feather name="globe" size={14} color={theme.primary} />}
            error={validationErrors.flightName}
          />

          {/* Flight Number and Flight Time in two boxes on the SAME line (client checklist rule!) */}
          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Flight Number"
                placeholder="e.g. DL 420"
                value={form.flightNumber}
                onChangeText={text => updateForm({ flightNumber: text })}
                leftIcon={<Feather name="hash" size={14} color={theme.primary} />}
                error={validationErrors.flightNumber}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Flight Time"
                placeholder="e.g. 02:45 PM"
                value={form.flightTime}
                onChangeText={text => updateForm({ flightTime: text })}
                leftIcon={<Feather name="clock" size={14} color={theme.primary} />}
              />
            </View>
          </View>

          {/* Meet & Greet Option */}
          <View style={[styles.optionRow, { borderTopColor: theme.borderSubtle, borderTopWidth: 1 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
                VIP Meet & Greet Service
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Chauffeur meets inside baggage claim with personalized name sign
              </Text>
            </View>
            <Switch
              value={form.meetAndGreet}
              onValueChange={val => updateForm({ meetAndGreet: val })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : form.meetAndGreet ? theme.surface : '#FFFFFF'}
            />
          </View>

          {form.meetAndGreet && (
            <View style={styles.meetGreetDetails}>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  onPress={() => updateForm({ meetAndGreetType: 'CURBSIDE' })}
                  style={[
                    styles.typeBtn,
                    {
                      borderColor: form.meetAndGreetType === 'CURBSIDE' ? theme.primary : theme.border,
                      backgroundColor: form.meetAndGreetType === 'CURBSIDE' ? theme.primaryLight : theme.surface,
                    },
                  ]}
                >
                  <Text style={[styles.typeBtnText, { color: form.meetAndGreetType === 'CURBSIDE' ? theme.primary : theme.textPrimary }]}>
                    Curbside Express
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateForm({ meetAndGreetType: 'INSIDE_BAGGAGE' })}
                  style={[
                    styles.typeBtn,
                    {
                      borderColor: form.meetAndGreetType === 'INSIDE_BAGGAGE' ? theme.primary : theme.border,
                      backgroundColor: form.meetAndGreetType === 'INSIDE_BAGGAGE' ? theme.primaryLight : theme.surface,
                    },
                  ]}
                >
                  <Text style={[styles.typeBtnText, { color: form.meetAndGreetType === 'INSIDE_BAGGAGE' ? theme.primary : theme.textPrimary }]}>
                    Inside Baggage Claim
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Name on Welcome Board"
                placeholder="e.g., MR. & MRS. SMITH"
                value={form.welcomeMessageName}
                onChangeText={text => updateForm({ welcomeMessageName: text, welcomeMessage: true })}
                leftIcon={<Feather name="user-check" size={14} color={theme.primary} />}
              />
            </View>
          )}
        </Card>
      )}

      {/* 5. Passengers & Luggage Box (Directly on page, popover removed per checklist) */}
      <Card
        title="Passengers & Luggage"
        subtitle="Ensure vehicle selected has sufficient comfort capacity"
        icon={<Feather name="users" size={16} color={theme.primary} />}
      >
        <Counter
          label="Passengers"
          subtitle="Adults and children requiring a seat"
          value={form.passengerCount}
          onChange={val => updateForm({ passengerCount: val })}
          min={1}
          max={14}
          icon={<Feather name="user" size={16} color={theme.primary} />}
        />
        <Counter
          label="Luggage Pieces"
          subtitle="Full-size check-in bags & carry-ons"
          value={form.luggageCount}
          onChange={val => updateForm({ luggageCount: val })}
          min={0}
          max={12}
          icon={<Feather name="briefcase" size={16} color={theme.primary} />}
        />
      </Card>

      {/* 6. Child Seats Box (Requested order: Rear-facing, Front-facing, Booster) */}
      <Card
        title="Child Seats"
        subtitle="Certified clean, sanitised car seats installed by chauffeur"
        icon={<MaterialCommunityIcons name="car-child-seat" size={18} color={theme.primary} />}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowChildSeats(!showChildSeats)}
            style={[styles.togglePill, { backgroundColor: theme.surfaceSubtle }]}
          >
            <Text style={[styles.togglePillText, { color: theme.primary }]}>
              {showChildSeats ? 'Hide Options' : 'Add Child Seats'}
            </Text>
          </TouchableOpacity>
        }
      >
        {showChildSeats ? (
          <View style={styles.childSeatsContainer}>
            {/* 1. Rear-facing */}
            <Counter
              label="Rear-facing Seat"
              subtitle="Infants up to 2 years / 30 lbs"
              value={form.childSeatRearFacing}
              onChange={val => updateForm({ childSeatRearFacing: val })}
              min={0}
              max={3}
            />
            {/* 2. Front-facing */}
            <Counter
              label="Front-facing Seat"
              subtitle="Toddlers 2-4 years / 20-40 lbs"
              value={form.childSeatFrontFacing}
              onChange={val => updateForm({ childSeatFrontFacing: val })}
              min={0}
              max={3}
            />
            {/* 3. Booster */}
            <Counter
              label="Booster Seat"
              subtitle="Children 4-8 years / 40+ lbs"
              value={form.childSeatBooster}
              onChange={val => updateForm({ childSeatBooster: val })}
              min={0}
              max={3}
            />
          </View>
        ) : (
          <Text style={[styles.noSeatsHint, { color: theme.textMuted }]}>
            No child seats selected. Tap "Add Child Seats" if traveling with infants or young children.
          </Text>
        )}
      </Card>

      {/* 7. Special Services: Pets & Return Trip */}
      <Card
        title="Special Options & Return Trip"
        subtitle="Customize your experience and schedule your return"
        icon={<Ionicons name="sparkles-outline" size={16} color={theme.primary} />}
      >
        {/* Travel with Pet */}
        <View style={styles.optionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
              Travel with Pet
            </Text>
            <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
              Pet-friendly limousine with protective blankets
            </Text>
          </View>
          <Switch
            value={form.travelWithPet}
            onValueChange={val => updateForm({ travelWithPet: val })}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {form.travelWithPet && (
          <View style={{ marginTop: 8 }}>
            <Counter
              label="Number of Pets"
              value={form.petCount}
              onChange={val => updateForm({ petCount: val })}
              min={1}
              max={4}
            />
          </View>
        )}

        {/* Need a Return Trip? (Checklist item) */}
        <View style={[styles.optionRow, { borderTopColor: theme.borderSubtle, borderTopWidth: 1, marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
              Need a Return Trip?
            </Text>
            <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
              Lock in your round-trip ride with priority chauffeur guarantee
            </Text>
          </View>
          <Switch
            value={form.isReturnTrip}
            onValueChange={val => updateForm({ isReturnTrip: val })}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {form.isReturnTrip && (
          <View style={[styles.returnTripBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <TriggerField
                  label="Return Date"
                  placeholder="YYYY-MM-DD"
                  value={form.returnDate}
                  icon={<Feather name="calendar" size={14} color={theme.primary} />}
                  error={validationErrors.returnDate}
                  onPress={() => {
                    setDatePickerTarget('returnDate')
                    setShowDatePicker(true)
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TriggerField
                  label="Return Time"
                  placeholder="HH:mm"
                  value={form.returnTime ? formatDisplayTime(form.returnTime) : undefined}
                  icon={<Feather name="clock" size={14} color={theme.primary} />}
                  error={validationErrors.returnTime}
                  onPress={() => setTimePickerTarget('returnTime')}
                />
              </View>
            </View>

            <Input
              label="Return Pickup"
              placeholder={form.dropLocation || 'Return pickup location'}
              value={form.returnPickupLocation || form.dropLocation}
              onChangeText={text => updateForm({ returnPickupLocation: text })}
            />
            <Input
              label="Return Destination"
              placeholder={form.pickupLocation || 'Return drop-off location'}
              value={form.returnDropLocation || form.pickupLocation}
              onChangeText={text => updateForm({ returnDropLocation: text })}
            />
          </View>
        )}
      </Card>

      {/* Continue Button */}
      <View style={styles.nextButtonWrapper}>
        <Button
          title="Proceed to Select Vehicle"
          onPress={nextStep}
          size="lg"
          iconRight={<Feather name="arrow-right" size={18} color="#0A0D14" />}
        />
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={datePickerTarget === 'pickupDate' ? form.pickupDate : form.returnDate}
        onSelectDate={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerTarget !== null}
        selectedTime={
          timePickerTarget === 'pickupTime' || timePickerTarget === 'hourlyStart'
            ? form.pickupTime || '14:00'
            : timePickerTarget === 'hourlyEnd'
            ? form.dropTime || '18:00'
            : form.returnTime || '16:00'
        }
        onSelectTime={handleTimeSelect}
        onClose={() => setTimePickerTarget(null)}
      />

      {/* Location Picker Mapbox Modal */}
      <LocationPickerMapModal
        visible={locationPickerTarget !== null}
        title={locationPickerTarget === 'pickup' ? 'SET PICKUP PIN' : 'SET DROP-OFF PIN'}
        initialLocationName={locationPickerTarget === 'pickup' ? form.pickupLocation : form.dropLocation}
        onConfirmLocation={(address) => {
          if (locationPickerTarget === 'pickup') {
            updateForm({ pickupLocation: address })
          } else if (locationPickerTarget === 'drop') {
            updateForm({ dropLocation: address })
          }
          setLocationPickerTarget(null)
        }}
        onClose={() => setLocationPickerTarget(null)}
      />
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
  sectionMargin: {
    marginBottom: 6,
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  swapBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeStopBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  addStopText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mileagePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    alignItems: 'center',
  },
  mileageText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  threeColumnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hourlyBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  hourlyHint: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  meetGreetDetails: {
    marginTop: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  togglePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  childSeatsContainer: {
    marginTop: 4,
  },
  noSeatsHint: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  returnTripBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  nextButtonWrapper: {
    marginTop: 16,
    marginBottom: 20,
  },
  preselectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginBottom: 12,
  },
  preselectedLeft: {
    flex: 1,
  },
  preselectedEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  preselectedCarName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  preselectedChangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
  },
  preselectedChangeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 2,
    borderWidth: 1,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  fieldIcon: {
    width: 18,
    alignItems: 'center',
  },
  fieldText: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldError: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  inputHeaderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 4,
  },
  pinMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
  },
  pinMapBtnText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mapContainerMargin: {
    marginVertical: 10,
  },
})
