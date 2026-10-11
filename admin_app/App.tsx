import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AdminUser } from './src/types';
import { getStoredAdmin, clearAdmin, AdminApi } from './src/services/api';
import { AdminHeader } from './src/components/common/AdminHeader';

// Screens
import { AdminAuthScreen } from './src/screens/AdminAuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { FleetScreen } from './src/screens/FleetScreen';
import { DriversScreen } from './src/screens/DriversScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type TabType = 'dashboard' | 'bookings' | 'fleet' | 'drivers' | 'clients' | 'settings';

function MainApp() {
  const { colors, mode } = useTheme();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [bookingFilter, setBookingFilter] = useState<string>('ALL');
  const [pendingBadge, setPendingBadge] = useState<number>(0);

  useEffect(() => {
    getStoredAdmin().then(stored => {
      setAdmin(stored);
      setAuthLoading(false);
      if (stored) {
        // fetch initial pending count
        AdminApi.getAnalytics().then(a => {
          if (a?.bookings?.pending) setPendingBadge(a.bookings.pending);
        });
      }
    });
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdmin(user);
    AdminApi.getAnalytics().then(a => {
      if (a?.bookings?.pending) setPendingBadge(a.bookings.pending);
    });
  };

  const handleLogout = async () => {
    await clearAdmin();
    setAdmin(null);
    setActiveTab('dashboard');
  };

  const switchTab = (tab: TabType) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    setActiveTab(tab);
  };

  const navigateToBookings = (filter: string = 'ALL') => {
    setBookingFilter(filter);
    switchTab('bookings');
  };

  if (authLoading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!admin) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <AdminAuthScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateToBookings={navigateToBookings}
            onNavigateToFleet={() => switchTab('fleet')}
            onNavigateToDrivers={() => switchTab('drivers')}
          />
        );
      case 'bookings':
        return <BookingsScreen initialFilter={bookingFilter} />;
      case 'fleet':
        return <FleetScreen />;
      case 'drivers':
        return <DriversScreen />;
      case 'clients':
        return <ClientsScreen />;
      case 'settings':
        return <SettingsScreen admin={admin} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  const tabs: { key: TabType; label: string; icon: any; activeIcon: any; badge?: number }[] = [
    { key: 'dashboard', label: 'Analytics', icon: 'grid-outline', activeIcon: 'grid' },
    { key: 'bookings', label: 'Orders', icon: 'calendar-outline', activeIcon: 'calendar', badge: pendingBadge },
    { key: 'fleet', label: 'Fleet', icon: 'car-sport-outline', activeIcon: 'car-sport' },
    { key: 'drivers', label: 'Chauffeurs', icon: 'people-outline', activeIcon: 'people' },
    { key: 'clients', label: 'Clients', icon: 'person-outline', activeIcon: 'person' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Admin Top Header */}
      <AdminHeader admin={admin} onLogout={handleLogout} />

      {/* Screen Body */}
      <View style={styles.body}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tabItem}
              onPress={() => switchTab(t.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? t.activeIcon : t.icon}
                  size={20}
                  color={isActive ? colors.gold : colors.textMuted}
                />
                {t.badge && t.badge > 0 ? (
                  <View style={[styles.tabBadge, { backgroundColor: colors.warning }]}>
                    <Text style={styles.tabBadgeText}>{t.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.gold : colors.textMuted },
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconContainer: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#0B0E14',
    fontSize: 9,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
