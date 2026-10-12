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

  const upcomingCount = assignedRides.filter(r => r.status !== 'COMPLETED').length
  const completedCount = assignedRides.filter(r => r.status === 'COMPLETED').length

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Header title="RIDE MANIFEST" subtitle="DAILY CHAUFFEUR SCHEDULE" onProfilePress={onProfilePress} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Search ─── */}
        <Input
          placeholder="Filter by passenger or location"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Feather name="search" size={15} color={theme.primary} />}
        />

        {/* ─── Tab Switcher ─── */}
        <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
          {[
            { id: 'UPCOMING' as const, label: 'Upcoming', icon: 'calendar', count: upcomingCount },
            { id: 'COMPLETED' as const, label: 'Completed', icon: 'check-circle', count: completedCount },
          ].map(item => {
            const isActive = tab === item.id
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setTab(item.id)
                }}
                style={[
                  styles.tabBtn,
                  isActive && {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                    borderWidth: 1,
                    shadowColor: isDark ? '#000' : '#64748B',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 1,
                  },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={14}
                  color={isActive ? theme.primary : theme.textMuted}
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? theme.textPrimary : theme.textMuted,
                      fontWeight: isActive ? '800' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    {
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(37,211,102,0.15)' : 'rgba(22,163,74,0.1)')
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      { color: isActive ? '#25D366' : theme.textMuted },
                    ]}
                  >
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ─── Results ─── */}
        {filtered.length > 0 ? (
          filtered.map(ride => (
            <ScheduledRideCard
              key={ride.id}
              booking={ride}
              onStartRide={() => onSelectActiveRide()}
            />
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }]}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
              <Feather name="calendar" size={28} color={theme.primary} />
            </View>
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

  /* Tab */
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginVertical: 10,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 12,
  },
  tabCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '800',
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
  },
})
