import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverRides } from '../context/DriverRidesContext'
import { Header } from '../components/common/Header'
import { ScheduledRideCard } from '../components/driver/ScheduledRideCard'
import { Input } from '../components/common/Input'
import { Badge } from '../components/common/Badge'

interface RidesScheduleScreenProps {
  onProfilePress: () => void
  onSelectActiveRide: () => void
}

export const RidesScheduleScreen: React.FC<RidesScheduleScreenProps> = ({
  onProfilePress,
  onSelectActiveRide,
}) => {
  const { theme, isDark } = useTheme()
  const { assignedRides } = useDriverRides()
  const [tab, setTab] = useState<'UPCOMING' | 'COMPLETED'>('UPCOMING')
  const [search, setSearch] = useState('')

  const filtered = assignedRides.filter(r => {
    if (tab === 'UPCOMING' && r.status === 'COMPLETED') return false
    if (tab === 'COMPLETED' && r.status !== 'COMPLETED') return false

    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = r.id.toLowerCase().includes(q)
      const matchName = (r.user?.name || '').toLowerCase().includes(q)
      const matchPickup = r.pickupLocation.toLowerCase().includes(q)
      return matchId || matchName || matchPickup
    }
    return true
  })

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="RIDE MANIFEST" subtitle="DAILY CHAUFFEUR SCHEDULE" onProfilePress={onProfilePress} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <Input
          placeholder="Filter schedule by Passenger or Location"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Feather name="search" size={15} color={theme.primary} />}
        />

        {/* Tab switcher */}
        <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setTab('UPCOMING')
            }}
            style={[
              styles.tabBtn,
              tab === 'UPCOMING' && [styles.activeTab, { backgroundColor: theme.surface, borderColor: theme.border }],
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'UPCOMING' ? theme.textPrimary : theme.textMuted, fontWeight: tab === 'UPCOMING' ? '700' : '500' },
              ]}
            >
              Upcoming Manifest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setTab('COMPLETED')
            }}
            style={[
              styles.tabBtn,
              tab === 'COMPLETED' && [styles.activeTab, { backgroundColor: theme.surface, borderColor: theme.border }],
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'COMPLETED' ? theme.textPrimary : theme.textMuted, fontWeight: tab === 'COMPLETED' ? '700' : '500' },
              ]}
            >
              Completed Runs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rides List */}
        {filtered.length > 0 ? (
          filtered.map(ride => (
            <ScheduledRideCard
              key={ride.id}
              booking={ride}
              onStartRide={() => onSelectActiveRide()}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={32} color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Rides in this View</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              {tab === 'UPCOMING' ? 'You have cleared all upcoming assignments.' : 'No completed rides recorded yet.'}
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
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginVertical: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
  },
})
