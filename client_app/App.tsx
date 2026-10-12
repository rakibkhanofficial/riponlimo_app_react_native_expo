import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import { AuthProvider } from './src/context/AuthContext'
import { BookingProvider, useBooking } from './src/context/BookingContext'
import { HomeScreen } from './src/screens/HomeScreen'
import { BookingScreen } from './src/screens/BookingScreen'
import { FleetScreen } from './src/screens/FleetScreen'
import { MyRidesScreen } from './src/screens/MyRidesScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { BottomTabBar, TabKey } from './src/navigation/BottomTabBar'
import { AuthScreen } from './src/screens/AuthScreen'
import { TripType } from './src/types'

const MainApp: React.FC = () => {
  const { theme } = useTheme()
  const { updateForm, setStep } = useBooking()
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleNavigateToBookFromHome = (prefill?: {
    carId?: string
    tripType?: TripType
    pickupLocation?: string
    dropLocation?: string
  }) => {
    if (prefill) {
      updateForm({
        ...(prefill.carId ? { selectedCarId: prefill.carId } : {}),
        ...(prefill.tripType ? { tripType: prefill.tripType } : {}),
        ...(prefill.pickupLocation ? { pickupLocation: prefill.pickupLocation } : {}),
        ...(prefill.dropLocation ? { dropLocation: prefill.dropLocation } : {}),
      })
      if (prefill.carId) {
        setStep(1)
      }
    }
    setActiveTab('book')
  }

  const handleSelectCarFromFleet = (carId: string) => {
    updateForm({ selectedCarId: carId })
    setStep(1) // jump to booking form with car pre-selected
    setActiveTab('book')
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToBook={handleNavigateToBookFromHome}
            onNavigateToFleet={() => setActiveTab('fleet')}
            onNavigateToRides={() => setActiveTab('rides')}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
        {activeTab === 'book' && (
          <BookingScreen
            onNavigateToRides={() => setActiveTab('rides')}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
        {activeTab === 'fleet' && (
          <FleetScreen
            onSelectCarAndBook={handleSelectCarFromFleet}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
        {activeTab === 'rides' && (
          <MyRidesScreen
            onBookRidePress={() => setActiveTab('book')}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen onOpenAuth={() => setShowAuthModal(true)} />
        )}
      </View>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AuthScreen
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
        <AuthProvider>
          <BookingProvider>
            <MainApp />
          </BookingProvider>
        </AuthProvider>
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
