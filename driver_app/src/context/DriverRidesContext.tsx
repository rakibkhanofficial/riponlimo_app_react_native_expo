import React, { createContext, useContext, useState, useEffect } from 'react'
import { Linking, Platform, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Booking, DriverShift, FleetVehicle } from '../types'
import { driverApi, FALLBACK_ASSIGNED_BOOKINGS, FALLBACK_AVAILABLE_BOOKINGS, FALLBACK_FLEET_VEHICLES } from '../config/api'
import { useDriverAuth } from './DriverAuthContext'

export type TripStep = 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_TRANSIT' | 'COMPLETED'

interface DriverRidesContextType {
  // Shift state
  shift: DriverShift
  toggleOnline: () => void
  fleetCars: FleetVehicle[]
  assignVehicle: (car: FleetVehicle) => Promise<void>

  // Rides state
  assignedRides: Booking[]
  availableRides: Booking[]
  activeRide: Booking | null
  currentTripStep: TripStep
  isLoading: boolean

  // Actions
  refreshRides: () => Promise<void>
  acceptRide: (id: string) => Promise<void>
  advanceActiveTrip: () => Promise<void>
  cancelTrip: (id: string) => Promise<void>
  openNavigation: (address: string) => void
  callPassenger: (phone?: string | null) => void
  smsPassenger: (phone?: string | null) => void
}

const DriverRidesContext = createContext<DriverRidesContextType | null>(null)

const DRIVER_SHIFT_STORAGE_KEY = '@ripon_limo_driver_shift'

export const DriverRidesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { driver } = useDriverAuth()

  const [shift, setShift] = useState<DriverShift>({
    isOnline: true,
    vehicleId: 'cmtsaqvvw000a13is7v3ul06p',
    vehicleName: 'Cadillac Escalade ESV VIP',
    vehiclePlate: 'SUV-001',
    completedTripsToday: 3,
    totalEarningsToday: 485,
    hoursOnlineToday: 5.5,
  })

  const [fleetCars, setFleetCars] = useState<FleetVehicle[]>(FALLBACK_FLEET_VEHICLES)
  const [assignedRides, setAssignedRides] = useState<Booking[]>([])
  const [availableRides, setAvailableRides] = useState<Booking[]>([])
  const [activeRide, setActiveRide] = useState<Booking | null>(null)
  const [currentTripStep, setCurrentTripStep] = useState<TripStep>('ASSIGNED')
  const [isLoading, setIsLoading] = useState(false)

  // Load saved shift from storage on mount
  useEffect(() => {
    const loadSavedShift = async () => {
      try {
        const stored = await AsyncStorage.getItem(DRIVER_SHIFT_STORAGE_KEY)
        if (stored) {
          setShift(JSON.parse(stored))
        }
      } catch (err) {
        console.log('Error loading saved shift', err)
      }
    }
    loadSavedShift()
  }, [])

  useEffect(() => {
    if (driver?.id) {
      refreshRides()
    } else {
      setAssignedRides([])
      setAvailableRides([])
      setActiveRide(null)
    }
  }, [driver])

  const refreshRides = async () => {
    if (!driver?.id) return
    setIsLoading(true)
    try {
      const [assigned, available, cars] = await Promise.all([
        driverApi.getAssignedBookings(driver.id),
        driverApi.getAvailableBookings(),
        driverApi.getCars(),
      ])
      setAssignedRides(assigned)
      setAvailableRides(available)
      if (Array.isArray(cars) && cars.length > 0) {
        setFleetCars(cars)
      }

      // Set active ride to the first non-completed trip
      const ongoing = assigned.find(b => b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED')
      if (ongoing) {
        setActiveRide(ongoing)
        if (ongoing.status === 'IN_PROGRESS') {
          setCurrentTripStep('EN_ROUTE')
        }
      }
    } catch (e) {
      console.log('Error refreshing rides', e)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleOnline = async () => {
    const updated = { ...shift, isOnline: !shift.isOnline }
    setShift(updated)
    try {
      await AsyncStorage.setItem(DRIVER_SHIFT_STORAGE_KEY, JSON.stringify(updated))
    } catch { }
  }

  const assignVehicle = async (car: FleetVehicle) => {
    const updated: DriverShift = {
      ...shift,
      vehicleId: car.id,
      vehicleName: `${car.brand} ${car.model}`,
      vehiclePlate: car.plateNumber,
    }
    setShift(updated)
    try {
      await AsyncStorage.setItem(DRIVER_SHIFT_STORAGE_KEY, JSON.stringify(updated))
    } catch { }
    Alert.alert('Vehicle Assigned', `Chauffeur vehicle set to: ${car.brand} ${car.model} (${car.plateNumber})`)
  }

  const acceptRide = async (id: string) => {
    if (!driver?.id) return
    try {
      const claimed = await driverApi.acceptBooking(id, driver.id)
      setAvailableRides(prev => prev.filter(r => r.id !== id))
      setAssignedRides(prev => [claimed, ...prev])
      if (!activeRide) {
        setActiveRide(claimed)
        setCurrentTripStep('ASSIGNED')
      }
      Alert.alert('Ride Claimed', 'Reservation successfully assigned to your manifest.')
    } catch (err: any) {
      Alert.alert('Notice', err.message || 'Could not claim ride.')
    }
  }

  const advanceActiveTrip = async () => {
    if (!activeRide || !driver?.id) return

    if (currentTripStep === 'ASSIGNED') {
      // Step 1: Start journey to pickup
      setCurrentTripStep('EN_ROUTE')
      await driverApi.updateBookingStatus(activeRide.id, driver.id, 'IN_PROGRESS')
      setActiveRide(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : null)
      setAssignedRides(prev => prev.map(r => r.id === activeRide.id ? { ...r, status: 'IN_PROGRESS' } : r))
    } else if (currentTripStep === 'EN_ROUTE') {
      // Step 2: Arrived at pickup
      setCurrentTripStep('ARRIVED')
    } else if (currentTripStep === 'ARRIVED') {
      // Step 3: Passenger boarded, transit to destination
      setCurrentTripStep('IN_TRANSIT')
    } else if (currentTripStep === 'IN_TRANSIT') {
      // Step 4: Dropoff complete
      setCurrentTripStep('COMPLETED')
      await driverApi.updateBookingStatus(activeRide.id, driver.id, 'COMPLETED')
      setActiveRide(prev => prev ? { ...prev, status: 'COMPLETED' } : null)
      setAssignedRides(prev => prev.map(r => r.id === activeRide.id ? { ...r, status: 'COMPLETED' } : r))

      // Update earnings
      setShift(prev => ({
        ...prev,
        completedTripsToday: prev.completedTripsToday + 1,
        totalEarningsToday: prev.totalEarningsToday + activeRide.totalAmount,
      }))

      Alert.alert('Trip Completed', `Fare recorded: $${activeRide.totalAmount}. Client invoice dispatched.`)
    }
  }

  const cancelTrip = async (id: string) => {
    if (!driver?.id) return
    await driverApi.updateBookingStatus(id, driver.id, 'CANCELLED')
    setAssignedRides(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r))
    if (activeRide?.id === id) {
      setActiveRide(null)
      setCurrentTripStep('ASSIGNED')
    }
  }

  const openNavigation = (address: string) => {
    const encoded = encodeURIComponent(address)
    const url = Platform.select({
      ios: `maps://?daddr=${encoded}`,
      android: `google.navigation:q=${encoded}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    })
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`)
    })
  }

  const callPassenger = (phone?: string | null) => {
    if (!phone) {
      Alert.alert('Contact Notice', 'No phone number on file for passenger.')
      return
    }
    Linking.openURL(`tel:${phone}`)
  }

  const smsPassenger = (phone?: string | null) => {
    if (!phone) {
      Alert.alert('Contact Notice', 'No phone number on file for passenger.')
      return
    }
    Linking.openURL(`sms:${phone}`)
  }

  return (
    <DriverRidesContext.Provider
      value={{
        shift,
        toggleOnline,
        fleetCars,
        assignVehicle,
        assignedRides,
        availableRides,
        activeRide,
        currentTripStep,
        isLoading,
        refreshRides,
        acceptRide,
        advanceActiveTrip,
        cancelTrip,
        openNavigation,
        callPassenger,
        smsPassenger,
      }}
    >
      {children}
    </DriverRidesContext.Provider>
  )
}

export const useDriverRides = () => {
  const ctx = useContext(DriverRidesContext)
  if (!ctx) throw new Error('useDriverRides must be used within DriverRidesProvider')
  return ctx
}
