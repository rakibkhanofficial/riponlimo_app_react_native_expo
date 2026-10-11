import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../theme/ThemeContext'

export type TabKey = 'book' | 'fleet' | 'rides' | 'profile'

interface BottomTabBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { theme } = useTheme()

  const tabs: { key: TabKey; label: string; icon: any; iconType: 'feather' | 'ionicons' }[] = [
    { key: 'book', label: 'Book', icon: 'navigation', iconType: 'feather' },
    { key: 'fleet', label: 'Fleet', icon: 'grid', iconType: 'feather' },
    { key: 'rides', label: 'My Rides', icon: 'clock', iconType: 'feather' },
    { key: 'profile', label: 'Account', icon: 'user', iconType: 'feather' },
  ]

  const handlePress = (key: TabKey) => {
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
  },
  activeIconContainer: {},
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
})
