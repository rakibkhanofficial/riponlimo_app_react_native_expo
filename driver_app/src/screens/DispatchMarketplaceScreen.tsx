import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native'
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
        <View style={styles.bannerBox}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>
              Unassigned Luxury Runs
            </Text>
            <Text style={[styles.bannerSubtitle, { color: theme.textMuted }]}>
              Rides reserved by clients that are ready to be claimed into your manifest. First-come priority.
            </Text>
          </View>
          <Badge label={`${availableRides.length} Open`} variant="primary" size="md" />
        </View>

        {availableRides.length > 0 ? (
          availableRides.map(ride => (
            <AvailableRideCard key={ride.id} booking={ride} />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Feather name="check-circle" size={36} color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>All Rides Covered</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              There are no unassigned rides at this time. Central dispatch will notify you when new VIP bookings arrive.
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
  bannerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
})
