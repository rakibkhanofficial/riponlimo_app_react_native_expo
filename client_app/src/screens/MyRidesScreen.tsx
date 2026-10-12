import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Image,
  Clipboard,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/common/Header'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Booking } from '../types'
import { api } from '../config/api'
import { resolveCarImage } from '../assets/carImages'

interface MyRidesScreenProps {
  onBookRidePress: () => void
  onOpenAuth: () => void
}

const statusStyles: Record<string, { dot: string; color: string; bg: string }> = {
  PENDING: { dot: '#F59E0B', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  CONFIRMED: { dot: '#3B82F6', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  COMPLETED: { dot: '#22C55E', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  CANCELLED: { dot: '#EF4444', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL')

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadBookings()
    } else {
      setBookings([])
    }
  }, [user, isAuthenticated])

  const loadBookings = async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const data = await api.getUserBookings(user.id)
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      console.log('Error loading user bookings', e)
      setBookings([])
    } finally {
      setRefreshing(false)
    }
  }

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status))
  const completed = bookings.filter(b => b.status === 'COMPLETED')
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'UPCOMING' && !['PENDING', 'CONFIRMED'].includes(b.status)) {
      return false
    }
    if (statusFilter === 'COMPLETED' && b.status !== 'COMPLETED') {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const idMatch = b.id.toLowerCase().includes(q)
      const pickupMatch = b.pickupLocation.toLowerCase().includes(q)
      const dropMatch = (b.dropLocation || '').toLowerCase().includes(q)
      return idMatch || pickupMatch || dropMatch
    }
    return true
  })

  const handleCopyReferral = () => {
    const code = user?.referralCode || 'RIPONVIP'
    Clipboard.setString(code)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert('Referral Code Copied', `Code ${code} copied to clipboard!`)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header onProfilePress={onOpenAuth} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadBookings}
              tintColor={theme.primary}
            />
          ) : undefined
        }
      >
        {/* ========================================================
            UNAUTHENTICATED GATE (NO DUMMY DATA SHOWN)
           ======================================================== */}
        {!isAuthenticated ? (
          <View style={[styles.authLockCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.lockIconBox, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Feather name="lock" size={32} color={theme.accentGreen} />
            </View>
            <Text style={[styles.lockOverline, { color: theme.accentGreen }]}>
              CLIENT PORTAL ACCESS
            </Text>
            <Text style={[styles.lockTitle, { color: theme.text }]}>
              PLEASE SIGN IN TO VIEW YOUR RIDES
            </Text>
            <Text style={[styles.lockSubtitle, { color: theme.textMuted }]}>
              Sign in with your client account to track real-time bookings, chauffeur assignments, and past trip invoices.
            </Text>

            <Button
              title="SIGN IN / REGISTER"
              variant="primary"
              onPress={onOpenAuth}
              style={styles.authLockBtn}
            />

            <TouchableOpacity
              onPress={onBookRidePress}
              style={[styles.guestBookBtn, { borderColor: theme.border }]}
            >
              <Text style={[styles.guestBookBtnText, { color: theme.text }]}>
                NEW RESERVATION AS GUEST
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ========================================================
              AUTHENTICATED CLIENT DASHBOARD (LIVE API DATA)
             ======================================================== */
          <>
            {/* DASHBOARD WELCOME HEADER */}
            <View style={styles.dashboardHeader}>
              <Text style={[styles.overTitle, { color: theme.accentGreen }]}>
                CLIENT PORTAL
              </Text>
              <Text style={[styles.mainWelcome, { color: theme.text }]}>
                WELCOME,{' '}
                <Text style={{ fontWeight: '800' }}>
                  {(user?.name ? user.name.split(' ')[0] : 'CLIENT').toUpperCase()}
                </Text>
              </Text>
            </View>

            {/* 4 KPI STAT CARDS (Strict Web Parity) */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>TOTAL RIDES</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{bookings.length}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>UPCOMING</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{upcoming.length}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>COMPLETED</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{completed.length}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>TOTAL SPENT</Text>
                <Text style={[styles.statValue, { color: theme.accentGreen }]}>${totalSpent.toLocaleString()}</Text>
              </View>
            </View>

            {/* Referral Privileges */}
            <View style={[styles.referralCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.referralOverline, { color: theme.accentGreen }]}>REFERRAL PRIVILEGES</Text>
                <Text style={[styles.referralCodeText, { color: theme.text }]}>
                  {user?.referralCode || 'RIPONVIP'}
                </Text>
                <Text style={[styles.referralDesc, { color: theme.textMuted }]}>
                  Share your referral code to receive credits toward future chauffeured trips.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCopyReferral}
                style={[styles.copyBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.copyBtnText, { color: theme.buttonText }]}>COPY</Text>
              </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View style={styles.searchSection}>
              <Input
                placeholder="Search by ID, airport, or hotel"
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Feather name="search" size={16} color={theme.textMuted} />}
                rightIcon={
                  searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Feather name="x" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  ) : undefined
                }
                containerStyle={{ marginBottom: 12 }}
              />

              <View style={[styles.filterTabs, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map(f => {
                  const isActive = statusFilter === f
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setStatusFilter(f)
                      }}
                      style={[
                        styles.filterTab,
                        isActive && { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          {
                            color: isActive ? theme.buttonText : theme.textMuted,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Bookings List from Live API */}
            <View style={styles.bookingsListSection}>
              <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
                {statusFilter === 'UPCOMING'
                  ? 'UPCOMING TRIPS'
                  : statusFilter === 'COMPLETED'
                  ? 'PAST COMPLETED TRIPS'
                  : 'ALL RESERVATIONS'}
              </Text>

              {filteredBookings.length > 0 ? (
                filteredBookings.map(item => {
                  const code = item.id.slice(-6).toUpperCase()
                  const carImg = item.car?.images?.[0] || '/cars/cadillac-escalade.png'
                  const statusCfg = statusStyles[item.status] || statusStyles.PENDING

                  return (
                    <View
                      key={item.id}
                      style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      {/* Top Bar with ID & Status */}
                      <View style={[styles.bookingCardHeader, { borderBottomColor: theme.borderSubtle }]}>
                        <View>
                          <Text style={[styles.bookingIdLabel, { color: theme.textMuted }]}>BOOKING ID</Text>
                          <Text style={[styles.bookingIdValue, { color: theme.text }]}>#{code}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color }]}>
                          <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
                          <Text style={[styles.statusText, { color: statusCfg.color }]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      {/* Body with Car & Amount */}
                      <View style={styles.bookingCardBody}>
                        <Image
                          source={resolveCarImage(carImg)}
                          style={styles.carThumb as any}
                          resizeMode="contain"
                        />
                        <View style={styles.bookingCardBodyInfo}>
                          <Text style={[styles.carNameText, { color: theme.text }]}>
                            {item.car ? `${item.car.brand} ${item.car.model}` : 'Chauffeured Vehicle'}
                          </Text>
                          <Text style={[styles.tripTypeText, { color: theme.textMuted }]}>
                            {item.tripType.replace(/_/g, ' ')}
                          </Text>
                          <Text style={[styles.fareAmountText, { color: theme.text }]}>
                            ${item.totalAmount}
                          </Text>
                        </View>
                      </View>

                      {/* Date & Time */}
                      <View style={[styles.infoRow, { borderTopColor: theme.borderSubtle }]}>
                        <Feather name="calendar" size={14} color={theme.textMuted} />
                        <Text style={[styles.infoRowText, { color: theme.text }]}>
                          {new Date(item.pickupTime).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(item.pickupTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>

                      {/* Pickup & Dropoff Route */}
                      <View style={[styles.routeBox, { backgroundColor: theme.background, borderColor: theme.borderSubtle }]}>
                        <View style={styles.routeItem}>
                          <Feather name="circle" size={12} color={theme.accentGreen} />
                          <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={2}>
                            {item.pickupLocation}
                          </Text>
                        </View>
                        {item.dropLocation && (
                          <View style={styles.routeItem}>
                            <Feather name="map-pin" size={12} color="#EF4444" />
                            <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={2}>
                              {item.dropLocation}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })
              ) : (
                <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Feather name="calendar" size={32} color={theme.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No Reservations Found</Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                    {searchQuery
                      ? 'No bookings matching your criteria.'
                      : 'You do not have any scheduled chauffeured reservations yet.'}
                  </Text>
                  <Button
                    title="RESERVE A VEHICLE"
                    variant="primary"
                    onPress={onBookRidePress}
                    style={{ marginTop: 20, width: '100%' }}
                  />
                </View>
              )}
            </View>
          </>
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
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Auth Lock Card
  authLockCard: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  lockIconBox: {
    width: 64,
    height: 64,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockOverline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  lockSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  authLockBtn: {
    width: '100%',
    height: 50,
    marginBottom: 12,
  },
  guestBookBtn: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBookBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Dashboard Header
  dashboardHeader: {
    marginBottom: 20,
  },
  overTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mainWelcome: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 2,
    padding: 14,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    marginBottom: 20,
  },
  referralOverline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  referralDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  copyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 2,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  searchSection: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabText: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bookingsListSection: {
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  bookingCard: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    marginBottom: 14,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  bookingIdLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bookingIdValue: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bookingCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carThumb: {
    width: 110,
    height: 65,
    marginRight: 12,
  },
  bookingCardBodyInfo: {
    flex: 1,
  },
  carNameText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tripTypeText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  fareAmountText: {
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 1,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10,
  },
  infoRowText: {
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  routeBox: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 10,
    gap: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
})
