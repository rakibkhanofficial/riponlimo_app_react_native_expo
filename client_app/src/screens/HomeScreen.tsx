import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Platform,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../theme/ThemeContext'
import { useBooking } from '../context/BookingContext'
import { Header } from '../components/common/Header'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { resolveCarImage } from '../assets/carImages'
import { resolveHeroImage } from '../assets/heroCarImages'
import { DatePickerModal } from '../components/common/DatePickerModal'
import { TimePickerModal } from '../components/common/TimePickerModal'
import { api } from '../config/api'
import { Car, TripType } from '../types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface HomeScreenProps {
  onNavigateToBook: (prefill?: {
    carId?: string
    tripType?: TripType
    pickupLocation?: string
    dropLocation?: string
    pickupDate?: string
    pickupTime?: string
  }) => void
  onNavigateToFleet: () => void
  onNavigateToRides: () => void
  onOpenAuth: () => void
}

interface HeroSlide {
  img: string
  subtitle: string
  brand: string
  model: string
}

const HERO_SLIDES: HeroSlide[] = [
  {
    img: '/hero-cars/cadillac-escalade.jpg',
    subtitle: 'Cadillac Escalade ESV VIP',
    brand: 'CADILLAC',
    model: 'ESCALADE ESV VIP',
  },
  {
    img: '/hero-cars/gmc-yukon.jpg',
    subtitle: 'GMC Yukon Denali XL',
    brand: 'GMC',
    model: 'YUKON DENALI XL',
  },
  {
    img: '/hero-cars/mercedes-s-class.jpg',
    subtitle: 'Mercedes-Benz S 580 Maybach',
    brand: 'MERCEDES-BENZ',
    model: 'S 580 PRESIDENTIAL',
  },
  {
    img: '/hero-cars/chevy-suburban.jpg',
    subtitle: 'Chevrolet Suburban Premier',
    brand: 'CHEVROLET',
    model: 'SUBURBAN PREMIER',
  },
  {
    img: '/hero-cars/lincoln-mkt.jpg',
    subtitle: 'Lincoln MKT Town Car Livery',
    brand: 'LINCOLN',
    model: 'MKT TOWN CAR LIVERY',
  },
  {
    img: '/hero-cars/cadillac-ct5.jpg',
    subtitle: 'Cadillac CT5-V Luxury Sedan',
    brand: 'CADILLAC',
    model: 'CT5-V LUXURY SEDAN',
  },
]

const POPULAR_DESTINATIONS = [
  {
    id: 'mia',
    name: 'Miami International Airport (MIA)',
    type: 'AIRPORT_TRANSFER' as TripType,
    tag: 'AIRPORT HUB',
    icon: 'airplane-outline',
  },
  {
    id: 'fll',
    name: "Fort Lauderdale-Hollywood Int'l (FLL)",
    type: 'AIRPORT_TRANSFER' as TripType,
    tag: 'AIRPORT HUB',
    icon: 'airplane-outline',
  },
  {
    id: 'south-beach',
    name: 'South Beach & Ocean Drive',
    type: 'POINT_TO_POINT' as TripType,
    tag: 'ICONIC LUXURY',
    icon: 'navigate-outline',
  },
  {
    id: 'palm-beach',
    name: 'Palm Beach & Worth Avenue',
    type: 'POINT_TO_POINT' as TripType,
    tag: 'ESTATE DISTRICT',
    icon: 'compass-outline',
  },
  {
    id: 'key-west',
    name: 'Key West & The Florida Keys',
    type: 'HOURLY' as TripType,
    tag: 'ISLAND CHARTER',
    icon: 'car-sport-outline',
  },
]

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Alexander Wright',
    role: 'Executive Managing Director',
    quote:
      'Unrivaled professionalism. The Escalade was immaculate, and the chauffeur arrived 15 minutes ahead of schedule at MIA.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Elena Rostova',
    role: 'Private Client',
    quote:
      'Ripon Limo is my exclusive transportation partner across South Florida. Flawless execution and utmost discretion every single trip.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Marcus Sterling',
    role: 'Venture Partner',
    quote:
      'Discreet, pristine, and effortless reservation experience. The standard for private luxury chauffeur travel.',
    rating: 5,
  },
]

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToBook,
  onNavigateToFleet,
  onNavigateToRides,
  onOpenAuth,
}) => {
  const { theme, isDark } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCars, setFeaturedCars] = useState<Car[]>([])
  const [isScrolled, setIsScrolled] = useState(false)

  // Quick Launcher State
  const [quickTripType, setQuickTripType] = useState<TripType>('POINT_TO_POINT')
  const [quickPickup, setQuickPickup] = useState('')
  const [quickDropoff, setQuickDropoff] = useState('')
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0])
  const [quickTime, setQuickTime] = useState('14:00')

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    // Auto-advance hero slides every 4.5 seconds
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Fetch live inventory for The Collection
    api.getCars().then(data => {
      if (data && data.length > 0) {
        setFeaturedCars(data.slice(0, 3))
      }
    }).catch(() => {})
  }, [])

  const handleLaunchBooking = (carId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onNavigateToBook({
      carId,
      tripType: quickTripType,
      pickupLocation: quickPickup.trim() || undefined,
      dropLocation: quickDropoff.trim() || undefined,
      pickupDate: quickDate,
      pickupTime: quickTime,
    })
  }

  const handleSelectDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onNavigateToBook({
      tripType: dest.type,
      pickupLocation: dest.type === 'AIRPORT_TRANSFER' ? dest.name : 'Miami Downtown',
      dropLocation: dest.type === 'AIRPORT_TRANSFER' ? 'The Setai, Miami Beach' : dest.name,
      pickupDate: quickDate,
      pickupTime: quickTime,
    })
  }

  const activeSlide = HERO_SLIDES[currentSlide]

  const formatDisplayTime = (t: string) => {
    if (!t) return '12:00 PM'
    const [h, m] = t.split(':').map(Number)
    if (isNaN(h)) return '12:00 PM'
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m || 0).padStart(2, '0')} ${period}`
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      {/* 
        When at the top over the dark hero photograph, status bar is light-content (white icons).
        When scrolled down in light mode, switches to dark-content so Wi-Fi, battery, clock,
        and cellular icons are 100% visible against the white header!
      */}
      <StatusBar
        barStyle={isScrolled ? (isDark ? 'light-content' : 'dark-content') : 'light-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Floating Header: Transparent over hero, transitions to solid on scroll */}
      <Header
        transparent
        isScrolled={isScrolled}
        onProfilePress={onOpenAuth}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y
          const scrolled = y > 25
          if (scrolled !== isScrolled) {
            setIsScrolled(scrolled)
          }
        }}
      >
        {/* ========================================================
            1. CINEMATIC HERO SHOWCASE (FULL BACKGROUND IMAGE AS ON WEB)
           ======================================================== */}
        <View style={styles.cinematicHeroWrapper}>
          {/* Full background photograph */}
          <Image
            key={activeSlide.img}
            source={resolveHeroImage(activeSlide.img)}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          />

          {/* Luxury top gradient for crisp status bar & header readability */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.25)', 'transparent']}
            style={styles.heroTopGradient}
            pointerEvents="none"
          />

          {/* Subtle dark vignette */}
          <View style={styles.heroDarkVignette} pointerEvents="none" />

          {/* Luxury bottom gradient so bottom-left actions pop */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.92)']}
            style={styles.heroBottomGradient}
            pointerEvents="none"
          />

          {/* Hero Bottom-Left Content (Compact so the vehicle is highly visible) */}
          <View style={styles.heroBottomLeftContent}>
            {/* Headline */}
            <Text style={styles.heroHeadline}>
              ABSOLUTE <Text style={styles.heroHeadlineBold}>LUXURY.</Text>
            </Text>

            {/* Compact Action Buttons */}
            <View style={styles.heroActionRow}>
              <TouchableOpacity
                onPress={() => handleLaunchBooking()}
                style={styles.heroBookBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBookBtnText}>BOOK NOW</Text>
                <Feather name="arrow-right" size={13} color="#000000" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onNavigateToRides}
                style={styles.heroTrackBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.heroTrackBtnText}>TRACK BOOKING</Text>
              </TouchableOpacity>
            </View>

            {/* Slide Indicator Bars */}
            <View style={styles.slideDotsRow}>
              {HERO_SLIDES.map((slide, idx) => (
                <TouchableOpacity
                  key={slide.img}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCurrentSlide(idx)
                  }}
                  style={[
                    styles.slideBar,
                    idx === currentSlide
                      ? styles.slideBarActive
                      : styles.slideBarInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ========================================================
            2. INSTANT RESERVATION LAUNCHER WITH DATE/TIME PICKERS
           ======================================================== */}
        <View style={[styles.quickReserveSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.quickReserveHeader}>
            <Text style={[styles.sectionOverline, { color: theme.accentGreen }]}>
              PRECISION CHAUFFEUR SERVICE
            </Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              INSTANT RESERVATION
            </Text>
          </View>

          {/* Trip Type Selector Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripTypeScrollContent}
            style={[styles.tripTypeTabs, { borderColor: theme.border, backgroundColor: theme.background }]}
          >
            {(['POINT_TO_POINT', 'AIRPORT_TRANSFER', 'HOURLY'] as TripType[]).map(t => {
              const isActive = quickTripType === t
              const label =
                t === 'POINT_TO_POINT'
                  ? 'Point to Point'
                  : t === 'AIRPORT_TRANSFER'
                  ? 'Airport Transfer'
                  : 'Hourly Charter'
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setQuickTripType(t)
                  }}
                  style={[
                    styles.tripTypeTab,
                    isActive && { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.tripTypeTabText,
                      {
                        color: isActive ? theme.buttonText : theme.textMuted,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Inputs */}
          <View style={styles.quickInputsWrapper}>
            <Input
              label="PICKUP LOCATION"
              value={quickPickup}
              onChangeText={setQuickPickup}
              placeholder="e.g. Miami Airport (MIA) or Hotel"
              leftIcon={<Feather name="circle" size={14} color={theme.textMuted} />}
              containerStyle={styles.quickInputItem}
            />

            <Input
              label={quickTripType === 'HOURLY' ? 'DURATION / ITINERARY' : 'DESTINATION / DROPOFF'}
              value={quickDropoff}
              onChangeText={setQuickDropoff}
              placeholder={quickTripType === 'HOURLY' ? 'e.g. 4 Hours / City Tour' : 'e.g. 1 Hotel South Beach'}
              leftIcon={<Feather name="map-pin" size={14} color={theme.textMuted} />}
              containerStyle={styles.quickInputItem}
            />

            {/* Interactive Date & Time Pickers */}
            <View style={styles.pickerButtonsRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setShowDatePicker(true)
                }}
                style={[styles.pickerTriggerBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
              >
                <View style={styles.pickerTriggerContent}>
                  <Text style={[styles.pickerTriggerLabel, { color: theme.textMuted }]}>DATE</Text>
                  <Text style={[styles.pickerTriggerValue, { color: theme.text }]}>
                    {quickDate}
                  </Text>
                </View>
                <Feather name="calendar" size={16} color={theme.accentGreen} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setShowTimePicker(true)
                }}
                style={[styles.pickerTriggerBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
              >
                <View style={styles.pickerTriggerContent}>
                  <Text style={[styles.pickerTriggerLabel, { color: theme.textMuted }]}>TIME</Text>
                  <Text style={[styles.pickerTriggerValue, { color: theme.text }]}>
                    {formatDisplayTime(quickTime)}
                  </Text>
                </View>
                <Feather name="clock" size={16} color={theme.accentGreen} />
              </TouchableOpacity>
            </View>

            <Button
              title="RESERVE THIS TRIP"
              variant="primary"
              onPress={() => handleLaunchBooking()}
              style={styles.quickReserveBtn}
            />
          </View>
        </View>

        {/* ========================================================
            3. THE COLLECTION / FLEET SHOWCASE
           ======================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>THE COLLECTION</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                Discover our precision-engineered fleet
              </Text>
            </View>
            <TouchableOpacity
              onPress={onNavigateToFleet}
              style={[styles.outlineMiniBtn, { borderColor: theme.border }]}
            >
              <Text style={[styles.outlineMiniBtnText, { color: theme.text }]}>VIEW ALL</Text>
              <Feather name="arrow-right" size={14} color={theme.text} />
            </TouchableOpacity>
          </View>

          {featuredCars.map(car => (
            <View
              key={car.id}
              style={[styles.carCollectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.carCardHeader}>
                <View>
                  <Text style={[styles.carBrandText, { color: theme.textMuted }]}>{car.brand}</Text>
                  <Text style={[styles.carModelText, { color: theme.text }]}>{car.model}</Text>
                </View>
                <View style={[styles.categoryBadge, { borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.categoryBadgeText, { color: theme.accentGreen }]}>
                    {car.category?.name || 'LUXURY'}
                  </Text>
                </View>
              </View>

              <View style={styles.carImageHolder}>
                <View style={styles.carShadowBlur} />
                <Image
                  source={resolveCarImage(car.images?.[0])}
                  style={styles.carThumbImage as any}
                  resizeMode="contain"
                />
              </View>

              <View style={[styles.carSpecsBar, { borderTopColor: theme.borderSubtle }]}>
                <View style={styles.specItem}>
                  <Feather name="users" size={14} color={theme.textMuted} />
                  <Text style={[styles.specText, { color: theme.text }]}>{car.capacity} Passengers</Text>
                </View>
                <View style={styles.specItem}>
                  <Feather name="briefcase" size={14} color={theme.textMuted} />
                  <Text style={[styles.specText, { color: theme.text }]}>{car.luggageCapacity} Bags</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={[styles.specPriceText, { color: theme.text }]}>
                    ${car.rentPrice || 59}<Text style={[styles.specPriceSub, { color: theme.textMuted }]}>/hr</Text>
                  </Text>
                </View>
              </View>

              <Button
                title="BOOK THIS VEHICLE"
                variant="primary"
                onPress={() => handleLaunchBooking(car.id)}
                style={styles.carCardBookBtn}
              />
            </View>
          ))}
        </View>

        {/* ========================================================
            4. POPULAR DESTINATIONS
           ======================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>POPULAR DESTINATIONS</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Seamless travel to Florida's most iconic locations
          </Text>

          <View style={styles.destinationsGrid}>
            {POPULAR_DESTINATIONS.map(dest => (
              <TouchableOpacity
                key={dest.id}
                onPress={() => handleSelectDestination(dest)}
                activeOpacity={0.8}
                style={[styles.destinationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.destinationCardTop}>
                  <View style={[styles.destBadge, { borderColor: theme.borderSubtle }]}>
                    <Text style={[styles.destBadgeText, { color: theme.accentGreen }]}>
                      {dest.tag}
                    </Text>
                  </View>
                  <Ionicons name={dest.icon as any} size={20} color={theme.textMuted} />
                </View>

                <View style={styles.destinationCardBottom}>
                  <Text style={[styles.destinationName, { color: theme.text }]}>
                    {dest.name}
                  </Text>
                  <View style={styles.destSelectRow}>
                    <Text style={[styles.destActionText, { color: theme.primary }]}>SELECT</Text>
                    <Feather name="arrow-right" size={12} color={theme.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================
            5. SERVICES - ENGINEERED FOR EXCELLENCE
           ======================================================== */}
        <View style={[styles.servicesSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionOverline, { color: theme.textMuted }]}>SERVICES</Text>
          <Text style={[styles.servicesTitle, { color: theme.text }]}>
            ENGINEERED{'\n'}
            <Text style={{ fontWeight: '800' }}>FOR EXCELLENCE.</Text>
          </Text>
          <Text style={[styles.servicesDescription, { color: theme.textMuted }]}>
            Beyond transportation. We deliver precision, discretion, and absolute comfort for those who demand the highest standard.
          </Text>

          <View style={styles.servicePillars}>
            <View style={[styles.servicePillarItem, { borderTopColor: theme.border }]}>
              <View style={styles.servicePillarHead}>
                <Text style={[styles.servicePillarName, { color: theme.text }]}>AIRPORT TRANSFERS</Text>
                <Feather name="arrow-up-right" size={18} color={theme.textMuted} />
              </View>
              <Text style={[styles.servicePillarDesc, { color: theme.textMuted }]}>
                Seamless arrivals and departures. Synchronized with your flight itinerary for zero wait time.
              </Text>
            </View>

            <View style={[styles.servicePillarItem, { borderTopColor: theme.border }]}>
              <View style={styles.servicePillarHead}>
                <Text style={[styles.servicePillarName, { color: theme.text }]}>HOURLY CHARTER</Text>
                <Feather name="arrow-up-right" size={18} color={theme.textMuted} />
              </View>
              <Text style={[styles.servicePillarDesc, { color: theme.textMuted }]}>
                Ultimate flexibility. Keep a professional chauffeur on standby for uninterrupted journeys across the city.
              </Text>
            </View>

            <View style={[styles.servicePillarItem, { borderTopColor: theme.border, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
              <View style={styles.servicePillarHead}>
                <Text style={[styles.servicePillarName, { color: theme.text }]}>VIP & CORPORATE</Text>
                <Feather name="arrow-up-right" size={18} color={theme.textMuted} />
              </View>
              <Text style={[styles.servicePillarDesc, { color: theme.textMuted }]}>
                Strict NDA compliance and heavily tinted vehicles ensuring maximum privacy and security.
              </Text>
            </View>
          </View>

          <Button
            title="SCHEDULE SERVICE"
            variant="outline"
            onPress={() => handleLaunchBooking()}
            style={styles.serviceScheduleBtn}
          />
        </View>

        {/* ========================================================
            6. DISTINGUISHED CLIENT FEEDBACK
           ======================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>CLIENT FEEDBACK</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            What our distinguished clients say
          </Text>

          <View style={styles.testimonialsStack}>
            {TESTIMONIALS.map(t => (
              <View
                key={t.id}
                style={[styles.testimonialCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.starsRow}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#EAB308" style={styles.starIcon} />
                  ))}
                </View>
                <Text style={[styles.testimonialQuote, { color: theme.text }]}>
                  "{t.quote}"
                </Text>
                <View style={styles.testimonialAuthor}>
                  <Text style={[styles.testimonialAuthorName, { color: theme.text }]}>
                    {t.name}
                  </Text>
                  <Text style={[styles.testimonialAuthorRole, { color: theme.textMuted }]}>
                    {t.role}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================
            7. BRUTALIST LUXURY FOOTER
           ======================================================== */}
        <View style={[styles.footerContainer, { backgroundColor: '#000000', borderColor: theme.border }]}>
          <View style={styles.footerBrandRow}>
            <Text style={styles.footerBrandTitle}>RIPON <Text style={{ opacity: 0.45 }}>LIMO</Text></Text>
            <Text style={styles.footerBrandTagline}>
              Defining the standard for luxury transportation across Florida. Uncompromising aesthetic, unmatched precision.
            </Text>
          </View>

          <View style={styles.footerContactBox}>
            <View style={styles.contactItem}>
              <Feather name="map-pin" size={16} color="#A3A3A3" />
              <Text style={styles.contactItemText}>Miami, Florida</Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL('tel:+16465174942')}
              style={styles.contactItem}
            >
              <Feather name="phone" size={16} color="#25D366" />
              <Text style={[styles.contactItemText, { color: '#FFFFFF' }]}>+1 (646) 517-4942</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:reservation@riponlimo.com')}
              style={styles.contactItem}
            >
              <Feather name="mail" size={16} color="#A3A3A3" />
              <Text style={styles.contactItemText}>reservation@riponlimo.com</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerBottomRow}>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} RIPON LIMO. ALL RIGHTS RESERVED.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date & Time Modals */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={quickDate}
        onSelectDate={setQuickDate}
        onClose={() => setShowDatePicker(false)}
      />

      <TimePickerModal
        visible={showTimePicker}
        selectedTime={quickTime}
        onSelectTime={setQuickTime}
        onClose={() => setShowTimePicker(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // 1. Cinematic Full-Bleed Hero (Web Parity with Clear Car Visibility)
  cinematicHeroWrapper: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.70, 580),
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 2,
  },
  heroDarkVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },
  heroBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
    zIndex: 2,
  },
  heroBottomLeftContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
    textAlign: 'left',
    lineHeight: 34,
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroHeadlineBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  heroBookBtn: {
    height: 38,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  heroBookBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroTrackBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTrackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  slideDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  slideBar: {
    height: 3,
    borderRadius: 1,
  },
  slideBarActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  slideBarInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // 2. Quick Reserve Launcher
  quickReserveSection: {
    marginHorizontal: 16,
    marginTop: -24,
    borderWidth: 1,
    borderRadius: 4,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  quickReserveHeader: {
    marginBottom: 16,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 4,
  },
  tripTypeTabs: {
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tripTypeScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  tripTypeTab: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTypeTabText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickInputsWrapper: {
    gap: 12,
  },
  quickInputItem: {
    marginBottom: 0,
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  pickerTriggerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 2,
  },
  pickerTriggerContent: {
    flex: 1,
  },
  pickerTriggerLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pickerTriggerValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  quickReserveBtn: {
    marginTop: 8,
    height: 50,
  },

  // 3. The Collection
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  outlineMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 2,
    flexShrink: 0,
  },
  outlineMiniBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  carCollectionCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
  },
  carCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  carBrandText: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  carModelText: {
    fontSize: 18,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  categoryBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  carImageHolder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  carShadowBlur: {
    position: 'absolute',
    bottom: 12,
    width: '75%',
    height: 16,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  carThumbImage: {
    width: '100%',
    height: '100%',
  },
  carSpecsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 14,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  specPriceText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  specPriceSub: {
    fontSize: 11,
    fontWeight: '400',
  },
  carCardBookBtn: {
    height: 46,
  },

  // 4. Destinations
  destinationsGrid: {
    marginTop: 16,
    gap: 12,
  },
  destinationCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  destinationCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  destBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  destBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  destinationCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    maxWidth: '75%',
  },
  destSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  destActionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // 5. Services
  servicesSection: {
    marginHorizontal: 16,
    marginTop: 36,
    borderWidth: 1,
    borderRadius: 4,
    padding: 24,
  },
  servicesTitle: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
    lineHeight: 34,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 12,
  },
  servicesDescription: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  servicePillars: {
    marginBottom: 20,
  },
  servicePillarItem: {
    borderTopWidth: 1,
    paddingVertical: 18,
  },
  servicePillarHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  servicePillarName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
  servicePillarDesc: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  serviceScheduleBtn: {
    height: 48,
  },

  // 6. Testimonials
  testimonialsStack: {
    marginTop: 16,
    gap: 12,
  },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  testimonialQuote: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
  },
  testimonialAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  testimonialAuthorRole: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // 7. Footer
  footerContainer: {
    marginTop: 40,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
  },
  footerBrandRow: {
    marginBottom: 24,
  },
  footerBrandTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  footerBrandTagline: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  footerContactBox: {
    gap: 12,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactItemText: {
    color: '#A3A3A3',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  footerBottomRow: {
    alignItems: 'center',
  },
  footerCopyright: {
    color: '#737373',
    fontSize: 10,
    letterSpacing: 1.5,
  },
})
