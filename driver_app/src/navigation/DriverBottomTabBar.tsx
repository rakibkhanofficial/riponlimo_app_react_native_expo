import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'
import { useDriverRides } from '../context/DriverRidesContext'

export type DriverTabKey = 'dashboard' | 'schedule' | 'marketplace' | 'profile'

interface DriverBottomTabBarProps {
  activeTab: DriverTabKey
  onTabChange: (tab: DriverTabKey) => void
}

export const DriverBottomTabBar: React.FC<DriverBottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { theme } = useTheme()
  const { availableRides } = useDriverRides()

  const tabs: { key: DriverTabKey; label: string; icon: any; badgeCount?: number }[] = [
    { key: 'dashboard', label: 'Active Run', icon: 'navigation' },
    { key: 'schedule', label: 'Schedule', icon: 'calendar' },
    { key: 'marketplace', label: 'Open Rides', icon: 'compass', badgeCount: availableRides.length },
    { key: 'profile', label: 'Chauffeur', icon: 'user' },
  ]

  const handlePress = (key: DriverTabKey) => {
    if (key !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onTabChange(key)
    }
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          shadowColor: theme.isDark ? '#000000' : '#64748B',
        },
      ]}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && [
                  styles.activeIconContainer,
                  { backgroundColor: theme.primaryLight },
                ],
              ]}
            >
              <Feather
                name={tab.icon}
                size={20}
                color={isActive ? theme.primary : theme.textMuted}
              />
              {tab.badgeCount && tab.badgeCount > 0 ? (
                <View style={[styles.badgePill, { backgroundColor: theme.primary }]}>
                  <Text style={styles.badgePillText}>{tab.badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.primary : theme.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIconContainer: {},
  badgePill: {
    position: 'absolute',
    top: -2,
    right: -4,
    paddingHorizontal: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePillText: {
    color: '#0A0D14',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
})
