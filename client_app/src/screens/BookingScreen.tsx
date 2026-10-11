import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { useBooking } from '../context/BookingContext'
import { Header } from '../components/common/Header'
import { StepIndicator } from '../components/booking/StepIndicator'
import { Step1TripDetails } from '../components/booking/Step1TripDetails'
import { Step2VehicleSelect } from '../components/booking/Step2VehicleSelect'
import { Step3Checkout } from '../components/booking/Step3Checkout'
import { BookingSuccessModal } from '../components/booking/BookingSuccessModal'

interface BookingScreenProps {
  onNavigateToRides: () => void
  onOpenAuth: () => void
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  onNavigateToRides,
  onOpenAuth,
}) => {
  const { theme, isDark } = useTheme()
  const { currentStep, setStep, lastBooking, resetForm } = useBooking()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleBookingSuccess = () => {
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    resetForm()
  }

  const handleViewRides = () => {
    setShowSuccess(false)
    resetForm()
    onNavigateToRides()
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <Header onProfilePress={onOpenAuth} />

      <StepIndicator currentStep={currentStep} onStepPress={setStep} />

      <View style={styles.content}>
        {currentStep === 1 && <Step1TripDetails />}
        {currentStep === 2 && <Step2VehicleSelect />}
        {currentStep === 3 && <Step3Checkout onBookingSuccess={handleBookingSuccess} />}
      </View>

      <BookingSuccessModal
        visible={showSuccess}
        booking={lastBooking}
        onClose={handleCloseSuccess}
        onViewRides={handleViewRides}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
