import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import { DriverAuthProvider } from './src/context/DriverAuthContext'
import { DriverRidesProvider } from './src/context/DriverRidesContext'
import { DriverDashboardScreen } from './src/screens/DriverDashboardScreen'
import { RidesScheduleScreen } from './src/screens/RidesScheduleScreen'
import { DispatchMarketplaceScreen } from './src/screens/DispatchMarketplaceScreen'
import { DriverProfileScreen } from './src/screens/DriverProfileScreen'
import { DriverBottomTabBar, DriverTabKey } from './src/navigation/DriverBottomTabBar'
import { DriverAuthModal } from './src/screens/DriverAuthModal'

const MainDriverApp: React.FC = () => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<DriverTabKey>('dashboard')
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <DriverDashboardScreen
            onProfilePress={() => setShowAuthModal(true)}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        )}
        {activeTab === 'schedule' && (
          <RidesScheduleScreen
            onProfilePress={() => setShowAuthModal(true)}
            onSelectActiveRide={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'marketplace' && (
          <DispatchMarketplaceScreen
            onProfilePress={() => setShowAuthModal(true)}
          />
        )}
        {activeTab === 'profile' && (
          <DriverProfileScreen
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </View>

      <DriverBottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <DriverAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DriverAuthProvider>
          <DriverRidesProvider>
            <MainDriverApp />
          </DriverRidesProvider>
        </DriverAuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
