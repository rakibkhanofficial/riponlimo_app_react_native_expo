import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { useBooking } from '../../context/BookingContext'
import { Car } from '../../types'
import { resolveCarImage } from '../../assets/carImages'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { CarDetailsModal } from './CarDetailsModal'

export const Step2VehicleSelect: React.FC = () => {
  const { theme } = useTheme()
  const {
    cars,
    form,
    updateForm,
    calculateCarPrice,
    nextStep,
    prevStep,
  } = useBooking()

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [modalCar, setModalCar] = useState<Car | null>(null)

  const categories = ['ALL', 'Luxury SUV', 'Luxury Sedan']

  const filteredCars = cars.filter(car => {
    if (selectedCategory === 'ALL') return true
    return car.category?.name === selectedCategory
  })

  const handleSelectCar = (carId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    updateForm({ selectedCarId: carId })
  }

  const handleOpenDetails = (car: Car) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setModalCar(car)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Filter Pills */}
      <View style={styles.categoryBar}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedCategory(cat)
              }}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? '#0A0D14' : theme.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat === 'ALL' ? 'All Vehicles' : cat}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Fleet Cards */}
      {filteredCars.map(car => {
        const isSelected = form.selectedCarId === car.id
        const price = calculateCarPrice(car)
        const primaryImage = car.images?.[0] || '/cars/cadillac-escalade.png'

        return (
          <TouchableOpacity
            key={car.id}
            onPress={() => handleSelectCar(car.id)}
            activeOpacity={0.85}
            style={[
              styles.vehicleCard,
              {
                backgroundColor: theme.card,
                borderColor: isSelected ? theme.primary : theme.cardBorder,
                shadowColor: theme.isDark ? '#000000' : '#64748B',
              },
            ]}
          >
            {/* Top Row: Category badge & Selected indicator */}
            <View style={styles.cardHeader}>
              <Badge
                label={car.category?.name || 'Luxury'}
                variant={isSelected ? 'primary' : 'neutral'}
                size="sm"
              />
              {isSelected ? (
                <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                  <Feather name="check" size={12} color="#0A0D14" />
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              ) : (
                <Text style={[styles.tapToSelect, { color: theme.textMuted }]}>Tap to select</Text>
              )}
            </View>

            {/* Car Name & Model */}
            <View style={styles.titleRow}>
              <Text style={[styles.brand, { color: theme.primary }]}>{car.brand}</Text>
              <Text style={[styles.model, { color: theme.textPrimary }]}>{car.model}</Text>
            </View>

            {/* Vehicle Image */}
            <View style={[styles.imageContainer, { backgroundColor: theme.surfaceSubtle }]}>
              <Image
                source={resolveCarImage(primaryImage)}
                style={styles.carImage}
                resizeMode="contain"
              />
            </View>

            {/* Capacity & Price Row */}
            <View style={[styles.infoRow, { borderTopColor: theme.borderSubtle }]}>
              <View style={styles.capacities}>
                <View style={styles.capItem}>
                  <Feather name="users" size={14} color={theme.primary} />
                  <Text style={[styles.capText, { color: theme.textSecondary }]}>{car.capacity} Seats</Text>
                </View>
                <View style={styles.capItem}>
                  <Feather name="briefcase" size={14} color={theme.primary} />
                  <Text style={[styles.capText, { color: theme.textSecondary }]}>{car.luggageCapacity || 6} Bags</Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.rateLabel, { color: theme.textMuted }]}>Guaranteed Rate</Text>
                <Text style={[styles.priceValue, { color: theme.primary }]}>${price}</Text>
              </View>
            </View>

            {/* Action Bar */}
            <View style={[styles.cardActions, { borderTopColor: theme.borderSubtle }]}>
              <TouchableOpacity
                onPress={() => handleOpenDetails(car)}
                style={styles.inspectBtn}
              >
                <Feather name="info" size={13} color={theme.primary} />
                <Text style={[styles.inspectText, { color: theme.primary }]}>Inspect & Photos</Text>
              </TouchableOpacity>

              <View style={styles.actionRight}>
                {isSelected ? (
                  <View style={[styles.radioSelected, { borderColor: theme.primary }]}>
                    <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />
                  </View>
                ) : (
                  <View style={[styles.radioUnselected, { borderColor: theme.border }]} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )
      })}

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <View style={{ flex: 1 }}>
          <Button
            title="Back to Details"
            variant="secondary"
            onPress={prevStep}
            icon={<Feather name="arrow-left" size={16} color={theme.textPrimary} />}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Review & Checkout"
            onPress={nextStep}
            iconRight={<Feather name="arrow-right" size={16} color="#0A0D14" />}
          />
        </View>
      </View>

      {/* Inspect Vehicle Modal */}
      <CarDetailsModal
        car={modalCar}
        visible={!!modalCar}
        onClose={() => setModalCar(null)}
        onSelect={car => handleSelectCar(car.id)}
        estimatedPrice={modalCar ? calculateCarPrice(modalCar) : 150}
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
  categoryBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  vehicleCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    color: '#0A0D14',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tapToSelect: {
    fontSize: 11,
  },
  titleRow: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  model: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  imageContainer: {
    height: 140,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carImage: {
    width: '92%',
    height: '92%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  capacities: {
    flexDirection: 'row',
    gap: 14,
  },
  capItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inspectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
})
