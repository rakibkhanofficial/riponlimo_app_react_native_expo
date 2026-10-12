import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AdminUser } from './src/types';
import { getStoredAdmin, clearAdmin, AdminApi } from './src/services/api';
import { AdminHeader } from './src/components/common/AdminHeader';
import { AdminSidebar, AdminRoute } from './src/components/common/AdminSidebar';

// Screens
import { AdminAuthScreen } from './src/screens/AdminAuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { FleetScreen } from './src/screens/FleetScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { CouponsScreen } from './src/screens/CouponsScreen';
import { DriversScreen } from './src/screens/DriversScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { DriverPortalScreen } from './src/screens/DriverPortalScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

function MainApp() {
  const { colors, mode } = useTheme();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<AdminRoute>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setActiveRoute('dashboard');
  };

  const switchRoute = (route: AdminRoute) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    setActiveRoute(route);
  };

  const navigateToBookings = (filter: string = 'ALL') => {
    setBookingFilter(filter);
    switchRoute('bookings');
  };

  if (authLoading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
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
    switch (activeRoute) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateToBookings={navigateToBookings}
            onNavigateToFleet={() => switchRoute('fleet')}
            onNavigateToDrivers={() => switchRoute('drivers')}
          />
        );
      case 'bookings':
        return <BookingsScreen initialFilter={bookingFilter} />;
      case 'fleet':
        return <FleetScreen />;
      case 'services':
        return <ServicesScreen />;
      case 'coupons':
        return <CouponsScreen />;
      case 'drivers':
        return <DriversScreen />;
      case 'clients':
        return <ClientsScreen />;
      case 'driver_portal':
        return <DriverPortalScreen admin={admin} />;
      case 'settings':
        return <SettingsScreen admin={admin} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  const screenTitles: Record<AdminRoute, { title: string; subtitle: string }> = {
    dashboard: { title: 'RIPON LIMO', subtitle: 'EXECUTIVE DISPATCH OVERVIEW' },
    bookings: { title: 'RESERVATIONS', subtitle: 'ACTIVE & HISTORICAL ORDERS' },
    fleet: { title: 'LUXURY FLEET', subtitle: 'CHAUFFEUR FLEET ROSTER' },
    services: { title: 'SERVICES CATALOG', subtitle: 'TARIFFS & TRIP TIERS' },
    coupons: { title: 'PROMOTIONS', subtitle: 'VIP VOUCHERS & DISCOUNTS' },
    drivers: { title: 'CHAUFFEURS', subtitle: 'EXECUTIVE DRIVER ROSTER' },
    clients: { title: 'CLIENT PROFILES', subtitle: 'ACCOUNT DIRECTORY' },
    driver_portal: { title: 'DRIVER COCKPIT', subtitle: 'LIVE CHAUFFEUR DISPATCH' },
    settings: { title: 'SETTINGS', subtitle: 'SYSTEM & API ENDPOINT' },
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Admin Top Header with Sidebar Trigger */}
      <AdminHeader
        admin={admin}
        onLogout={handleLogout}
        onOpenSidebar={() => setSidebarOpen(true)}
        title={screenTitles[activeRoute]?.title}
        subtitle={screenTitles[activeRoute]?.subtitle}
      />

      {/* Screen Body */}
      <View style={styles.body}>{renderActiveScreen()}</View>

      {/* Side Navigation Drawer */}
      <AdminSidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute={activeRoute}
        onRouteChange={switchRoute}
        admin={admin}
        onLogout={handleLogout}
        pendingBadges={{ bookings: pendingBadge }}
      />
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
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
});
