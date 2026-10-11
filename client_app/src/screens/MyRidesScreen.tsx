import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/common/Header'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Booking } from '../types'
import { api } from '../config/api'
import { resolveCarImage } from '../assets/carImages'

interface MyRidesScreenProps {
  onBookRidePress: () => void
  onOpenAuth: () => void
}

export const MyRidesScreen: React.FC<MyRidesScreenProps> = ({
  onBookRidePress,
  onOpenAuth,
}) => {
  const { theme, isDark } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL')

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    setRefreshing(true)
    try {
      if (user?.id) {
        const data = await api.getUserBookings(user.id)
        setBookings(data)
      } else {
        // Sample reservation demo for guest testing
        setBookings([
          {
            id: 'cmtsvip99001',
            userId: 'guest',
            carId: 'cmtsaqvvw000a13is7v3ul06p',
            serviceTypeId: 'cmtsaqyqa000l13issf06hoj6',
            tripType: 'POINT_TO_POINT',
            pickupLocation: 'JFK International Airport Terminal 4',
            dropLocation: 'The St. Regis New York, 5th Avenue',
            pickupTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            totalAmount: 185,
            passengerCount: 2,
            luggageCount: 3,
            createdAt: new Date().toISOString(),
            car: {
              brand: 'Cadillac',
              model: 'Escalade ESV VIP',
              images: ['/cars/cadillac-escalade.png'],
            },
          },
        ])
      }
    } catch (e) {
      console.log('Error loading bookings', e)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredBookings = bookings.filter(b => {
    // Status filter
    if (statusFilter === 'ACTIVE' && (b.status === 'COMPLETED' || b.status === 'CANCELLED')) {
      return false
    }
    if (statusFilter === 'COMPLETED' && b.status !== 'COMPLETED') {
      return false
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const idMatch = b.id.toLowerCase().includes(q)
      const pickupMatch = b.pickupLocation.toLowerCase().includes(q)
      const dropMatch = (b.dropLocation || '').toLowerCase().includes(q)
      return idMatch || pickupMatch || dropMatch
    }
    return true
  })

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="MY RIDES" subtitle="CLIENT RESERVATION PORTAL" onProfilePress={onOpenAuth} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadBookings}
            tintColor={theme.primary}
          />
        }
      >
        {/* Track by Reservation Search Input */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Track ride by Reservation # or location"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Feather name="search" size={16} color={theme.primary} />}
            rightIcon={
              searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.filterBar}>
          {[
            { id: 'ALL', label: 'All Rides' },
            { id: 'ACTIVE', label: 'Active & Upcoming' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map(tab => {
            const isSelected = statusFilter === tab.id
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setStatusFilter(tab.id as any)
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#0A0D14' : theme.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {!isAuthenticated && (
          <View style={[styles.guestNotice, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.guestNoticeTitle, { color: theme.primary }]}>Sign In to Sync Rides</Text>
              <Text style={[styles.guestNoticeText, { color: theme.textMuted }]}>
                Access real-time chauffeur GPS tracking and invoice history across all your devices.
              </Text>
            </View>
            <TouchableOpacity onPress={onOpenAuth} style={[styles.signInBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          filteredBookings.map(item => {
            const code = item.id.slice(-6).toUpperCase()
            const carImg = item.car?.images?.[0] || '/cars/cadillac-escalade.png'

            return (
              <View
                key={item.id}
                style={[
                  styles.rideCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                    shadowColor: theme.isDark ? '#000000' : '#64748B',
                  },
                ]}
              >
                <View style={[styles.cardHeader, { borderBottomColor: theme.borderSubtle }]}>
                  <View style={styles.headerLeft}>
                    <Text style={[styles.resCode, { color: theme.primary }]}>#{code}</Text>
                    <Text style={[styles.rideDate, { color: theme.textMuted }]}>
                      {new Date(item.pickupTime).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Badge
                    label={item.status}
                    variant={
                      item.status === 'CONFIRMED'
                        ? 'success'
                        : item.status === 'PENDING'
                        ? 'warning'
                        : item.status === 'COMPLETED'
                        ? 'neutral'
                        : 'error'
                    }
                  />
                </View>

                {/* Vehicle & Fare Row */}
                <View style={styles.cardBody}>
                  <Image
                    source={resolveCarImage(carImg)}
                    style={styles.rideThumb}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.carName, { color: theme.textPrimary }]}>
                      {item.car ? `${item.car.brand} ${item.car.model}` : 'Executive Chauffeur Vehicle'}
                    </Text>
                    <Text style={[styles.rideTime, { color: theme.textMuted }]}>
                      Pickup at {new Date(item.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[styles.fare, { color: theme.primary }]}>
                      ${item.totalAmount}
                    </Text>
                  </View>
                </View>

                {/* Route Route */}
                <View style={[styles.routeBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
                  <View style={styles.routeItem}>
                    <Feather name="circle" size={12} color={theme.primary} />
                    <Text style={[styles.routeText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {item.pickupLocation}
                    </Text>
                  </View>
                  {item.dropLocation && (
                    <View style={styles.routeItem}>
                      <Feather name="map-pin" size={12} color={theme.error} />
                      <Text style={[styles.routeText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.dropLocation}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )
          })
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surfaceSubtle }]}>
              <Feather name="calendar" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Reservations Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {searchQuery ? 'No rides matching your search criteria.' : 'You have not scheduled any rides yet.'}
            </Text>
            <View style={{ marginTop: 20 }}>
              <Button
                title="Book a Limousine"
                onPress={onBookRidePress}
                size="md"
                iconRight={<Feather name="arrow-right" size={16} color="#0A0D14" />}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 6,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
  },
  guestNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  guestNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  guestNoticeText: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  signInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInBtnText: {
    color: '#0A0D14',
    fontSize: 12,
    fontWeight: '700',
  },
  rideCard: {
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resCode: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rideDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rideThumb: {
    width: 70,
    height: 48,
  },
  carName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rideTime: {
    fontSize: 11,
    marginTop: 2,
  },
  fare: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  routeBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
})
