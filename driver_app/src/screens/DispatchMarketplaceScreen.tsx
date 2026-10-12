import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme/ThemeContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { AvailableRideCard } from '../components/driver/AvailableRideCard'
import { Badge } from '../components/common/Badge'

interface DispatchMarketplaceScreenProps {
  onProfilePress: () => void
}

export const DispatchMarketplaceScreen: React.FC<DispatchMarketplaceScreenProps> = ({
  onProfilePress,
}) => {
  const { theme, isDark } = useTheme()
  const { availableRides, refreshRides, isLoading } = useDriverRides()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="OPEN RUNS" subtitle="DISPATCH MARKETPLACE" onProfilePress={onProfilePress} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshRides}
            tintColor={theme.primary}
          />
        }
      >
        {/* ─── Hero Banner ─── */}
        <View
          style={[
            styles.heroBanner,
            {
              backgroundColor: isDark ? 'rgba(37, 211, 102, 0.06)' : 'rgba(22, 163, 74, 0.05)',
              borderColor: isDark ? 'rgba(37, 211, 102, 0.15)' : 'rgba(22, 163, 74, 0.12)',
            },
          ]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroIconCircle, { backgroundColor: isDark ? 'rgba(37,211,102,0.15)' : 'rgba(22,163,74,0.1)' }]}>
              <Feather name="radio" size={18} color="#25D366" />
            </View>
            <Badge label={`${availableRides.length} Open`} variant="primary" size="md" />
          </View>

          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Unassigned Luxury Runs
          </Text>
          <Text style={[styles.heroSub, { color: theme.textMuted }]}>
            First-come priority • Claim rides into your manifest
          </Text>
        </View>

        {/* ─── Rides List ─── */}
        {availableRides.length > 0 ? (
          availableRides.map(ride => (
            <AvailableRideCard key={ride.id} booking={ride} />
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
              <Feather name="check-circle" size={28} color="#25D366" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>All Rides Covered</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              No unassigned rides at this time. Dispatch will notify you when new VIP bookings arrive.
            </Text>
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

  /* Hero */
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '500',
  },

  /* Empty */
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
})
