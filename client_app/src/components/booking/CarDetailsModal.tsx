import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { Car } from '../../types'
import { resolveCarImage } from '../../assets/carImages'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

interface CarDetailsModalProps {
  car: Car | null
  visible: boolean
  onClose: () => void
  onSelect: (car: Car) => void
  estimatedPrice: number
}

const { width } = Dimensions.get('window')

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({
  car,
  visible,
  onClose,
  onSelect,
  estimatedPrice,
}) => {
  const { theme } = useTheme()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (!car) return null

  const images = car.images && car.images.length > 0 ? car.images : ['/cars/cadillac-escalade.png']

  const handleSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onSelect(car)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.brandText, { color: theme.primary }]}>{car.brand}</Text>
              <Text style={[styles.modelText, { color: theme.textPrimary }]}>{car.model}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceSubtle }]}>
              <Feather name="x" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Main Featured Photo */}
            <View style={[styles.mainImageWrapper, { backgroundColor: theme.surfaceSubtle }]}>
              <Image
                source={resolveCarImage(images[selectedPhotoIndex])}
                style={styles.mainImage}
                resizeMode="contain"
              />
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>
                  {selectedPhotoIndex + 1} / {images.length}
                </Text>
              </View>
            </View>

            {/* Photo Thumbnails */}
            <View style={styles.thumbnailsRow}>
              {images.map((img, idx) => {
                const isSelected = idx === selectedPhotoIndex
                const label = idx === 0 ? 'Exterior' : idx === 1 ? 'Interior' : 'Side View'
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setSelectedPhotoIndex(idx)
                    }}
                    style={[
                      styles.thumbnailBtn,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                  >
                    <Image
                      source={resolveCarImage(img)}
                      style={styles.thumbnailImg}
                      resizeMode="cover"
                    />
                    <Text style={[styles.thumbnailLabel, { color: isSelected ? theme.primary : theme.textMuted }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Capacities & Badges */}
            <View style={styles.capacitiesRow}>
              <View style={[styles.capacityCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Feather name="users" size={18} color={theme.primary} />
                <Text style={[styles.capacityValue, { color: theme.textPrimary }]}>{car.capacity} Passengers</Text>
                <Text style={[styles.capacitySub, { color: theme.textMuted }]}>Max seating</Text>
              </View>

              <View style={[styles.capacityCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Feather name="briefcase" size={18} color={theme.primary} />
                <Text style={[styles.capacityValue, { color: theme.textPrimary }]}>{car.luggageCapacity || 6} Luggage</Text>
                <Text style={[styles.capacitySub, { color: theme.textMuted }]}>Full-size bags</Text>
              </View>
            </View>

            {/* Luxury Amenities Included */}
            <View style={[styles.sectionBox, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>Chauffeur Amenities Included</Text>
              <View style={styles.amenitiesGrid}>
                {[
                  { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                  { icon: 'battery-charging', label: 'Device Fast Chargers' },
                  { icon: 'shield', label: 'Privacy Tinted Glass' },
                  { icon: 'coffee', label: 'Chilled Bottled Water' },
                  { icon: 'wind', label: 'Multi-zone Climate' },
                  { icon: 'award', label: 'Commercial Livery Insured' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.amenityItem}>
                    <Feather name={item.icon as any} size={15} color={theme.primary} />
                    <Text style={[styles.amenityText, { color: theme.textSecondary }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pricing Transparent Overview */}
            <View style={[styles.priceBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.primary }]}>
              <View>
                <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Guaranteed Trip Fare</Text>
                <Text style={[styles.priceAmount, { color: theme.primary }]}>${estimatedPrice}</Text>
              </View>
              <Badge label="All Inclusive" variant="primary" />
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <View style={[styles.footer, { borderTopColor: theme.borderSubtle, backgroundColor: theme.card }]}>
            <Button
              title={`Select ${car.model}`}
              onPress={handleSelect}
              size="lg"
              icon={<Feather name="check-circle" size={18} color="#0A0D14" />}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modelText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mainImageWrapper: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mainImage: {
    width: '90%',
    height: '90%',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  thumbnailBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 4,
    alignItems: 'center',
  },
  thumbnailImg: {
    width: '100%',
    height: 50,
    borderRadius: 6,
  },
  thumbnailLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  capacitiesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  capacityCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  capacityValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  capacitySub: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
})
