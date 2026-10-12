import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useBooking } from '../context/BookingContext'
import { Header } from '../components/common/Header'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Car } from '../types'
import { resolveCarImage } from '../assets/carImages'
import { CarDetailsModal } from '../components/booking/CarDetailsModal'

interface FleetScreenProps {
  onSelectCarAndBook: (carId: string) => void
  onOpenAuth: () => void
}

export const FleetScreen: React.FC<FleetScreenProps> = ({
  onSelectCarAndBook,
  onOpenAuth,
}) => {
  const { theme, isDark } = useTheme()
  const { cars, calculateCarPrice } = useBooking()
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [modalCar, setModalCar] = useState<Car | null>(null)

  const categories = ['ALL', 'Luxury SUV', 'Luxury Sedan']

  const filteredCars = cars.filter(c => {
    if (selectedCategory === 'ALL') return true
    return c.category?.name === selectedCategory
  })

  const handleBookCar = (carId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onSelectCarAndBook(carId)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="VIP FLEET" subtitle="PRESTIGE & LUXURY LIMOUSINES" onProfilePress={onOpenAuth} />

      {/* Category Filter Pills */}
      <View style={[styles.categoryBar, { backgroundColor: theme.background }]}>
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
                    color: isSelected ? theme.buttonText : theme.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {cat === 'ALL' ? 'ALL VEHICLES' : cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroTextContainer}>
          <Text style={[styles.fleetHeading, { color: theme.textPrimary }]}>
            Hand-Crafted Executive Comfort
          </Text>
          <Text style={[styles.fleetSubtitle, { color: theme.textMuted }]}>
            Every vehicle in our livery fleet undergoes meticulous sanitation, daily mechanical inspections, and is driven exclusively by certified chauffeurs.
          </Text>
        </View>

        {filteredCars.map(car => {
          const primaryImage = car.images?.[0] || '/cars/cadillac-escalade.png'

          return (
            <View
              key={car.id}
              style={[
                styles.carCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.isDark ? '#000000' : '#64748B',
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.carBrand, { color: theme.primary }]}>{car.brand}</Text>
                  <Text style={[styles.carModel, { color: theme.textPrimary }]}>{car.model}</Text>
                </View>
                <Badge label={car.category?.name || 'Luxury'} variant="primary" />
              </View>

              <TouchableOpacity
                onPress={() => setModalCar(car)}
                activeOpacity={0.9}
                style={[styles.imageWrapper, { backgroundColor: theme.surfaceSubtle }]}
              >
                <Image
                  source={resolveCarImage(primaryImage)}
                  style={styles.carImg}
                  resizeMode="contain"
                />
                <View style={[styles.inspectOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Feather name="maximize-2" size={13} color="#FFFFFF" />
                  <Text style={styles.inspectOverlayText}>View Photos</Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.featuresRow, { borderBottomColor: theme.borderSubtle }]}>
                <View style={styles.feat}>
                  <Feather name="users" size={14} color={theme.primary} />
                  <Text style={[styles.featText, { color: theme.textSecondary }]}>{car.capacity} Passengers</Text>
                </View>
                <View style={styles.feat}>
                  <Feather name="briefcase" size={14} color={theme.primary} />
                  <Text style={[styles.featText, { color: theme.textSecondary }]}>{car.luggageCapacity || 6} Bags</Text>
                </View>
                <View style={styles.feat}>
                  <Feather name="shield" size={14} color={theme.primary} />
                  <Text style={[styles.featText, { color: theme.textSecondary }]}>Tinted VIP</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={[styles.ratesHint, { color: theme.textMuted }]}>Starting Rate</Text>
                  <Text style={[styles.priceTag, { color: theme.primary }]}>
                    ${car.rentPrice || 59} <Text style={[styles.perText, { color: theme.textMuted }]}>base fare</Text>
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    onPress={() => setModalCar(car)}
                    style={[styles.detailsBtn, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}
                  >
                    <Text style={[styles.detailsBtnText, { color: theme.textPrimary }]}>SPECS</Text>
                  </TouchableOpacity>

                  <Button
                    title="RESERVE"
                    size="sm"
                    onPress={() => handleBookCar(car.id)}
                    iconRight={<Feather name="chevron-right" size={14} color={theme.buttonText} />}
                  />
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* Car Details Modal */}
      <CarDetailsModal
        car={modalCar}
        visible={!!modalCar}
        onClose={() => setModalCar(null)}
        onSelect={car => handleBookCar(car.id)}
        estimatedPrice={modalCar ? calculateCarPrice(modalCar) : 150}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 2,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroTextContainer: {
    marginVertical: 10,
  },
  fleetHeading: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  fleetSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  carCard: {
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  carBrand: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  carModel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  imageWrapper: {
    height: 150,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  carImg: {
    width: '90%',
    height: '90%',
  },
  inspectOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  inspectOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  feat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ratesHint: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  perText: {
    fontSize: 11,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
