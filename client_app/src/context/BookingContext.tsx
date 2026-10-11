import React, { createContext, useContext, useState, useEffect } from 'react'
import { Car, ServiceType, Booking, TripType, BookingFormData, PaymentMethod } from '../types'
import { api, FALLBACK_CARS, FALLBACK_SERVICES } from '../config/api'
import { useAuth } from './AuthContext'

interface BookingContextType {
  // Step navigation
  currentStep: number
  setStep: (step: number) => void
  nextStep: () => boolean
  prevStep: () => void

  // Data
  cars: Car[]
  services: ServiceType[]
  isLoadingData: boolean
  refreshFleet: () => Promise<void>

  // Form State
  form: BookingFormData
  updateForm: (updates: Partial<BookingFormData>) => void
  resetForm: () => void

  // Helpers & Calculations
  selectedCar: Car | undefined
  selectedService: ServiceType | undefined
  calculateCarPrice: (car: Car) => number
  estimatedETA: string | null
  totalPrice: number

  // Actions
  addStop: () => void
  removeStop: (index: number) => void
  updateStop: (index: number, location: string) => void
  swapLocations: () => void

  // Submission
  isSubmitting: boolean
  lastBooking: Booking | null
  submitBooking: () => Promise<Booking>
  validationErrors: Record<string, string>
}

const getTodayString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultTimeString = () => {
  const d = new Date()
  d.setHours(d.getHours() + 2) // default 2 hours ahead
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = '00'
  return `${hours}:${minutes}`
}

const defaultFormData: BookingFormData = {
  tripType: 'POINT_TO_POINT',
  pickupDate: getTodayString(),
  pickupTime: getDefaultTimeString(),
  dropTime: '18:00',
  totalHours: 3,
  pickupLocation: 'JFK International Airport, Queens, NY',
  dropLocation: 'Midtown Manhattan, New York, NY',
  stops: [],
  distanceMiles: 17.5,
  durationMinutes: 45,

  flightName: '',
  flightNumber: '',
  flightTime: '',
  meetAndGreet: false,
  meetAndGreetType: 'CURBSIDE',
  welcomeMessage: false,
  welcomeMessageName: '',

  passengerCount: 2,
  luggageCount: 2,

  // Requested order: Rear-facing, Front-facing, Booster
  childSeatRearFacing: 0,
  childSeatFrontFacing: 0,
  childSeatBooster: 0,

  travelWithPet: false,
  petCount: 1,

  isReturnTrip: false,
  returnDate: getTodayString(),
  returnTime: getDefaultTimeString(),
  returnPickupLocation: '',
  returnDropLocation: '',
  returnFlightName: '',
  returnFlightNumber: '',

  additionalContacts: [],

  selectedCarId: null,
  selectedServiceId: null,

  fullName: '',
  phoneNumber: '',
  emailAddress: '',
  guestPassword: '',
  specialInstructions: '',

  paymentMethod: 'PAY_LATER',
}

const BookingContext = createContext<BookingContextType | null>(null)

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [cars, setCars] = useState<Car[]>(FALLBACK_CARS)
  const [services, setServices] = useState<ServiceType[]>(FALLBACK_SERVICES)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true)
  const [form, setForm] = useState<BookingFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [lastBooking, setLastBooking] = useState<Booking | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadFleetAndServices()
  }, [])

  // Auto-fill user contact info if logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        emailAddress: prev.emailAddress || user.email || '',
        phoneNumber: prev.phoneNumber || user.phone || '',
      }))
    }
  }, [user])

  const loadFleetAndServices = async () => {
    setIsLoadingData(true)
    try {
      const [fetchedCars, fetchedServices] = await Promise.all([
        api.getCars(),
        api.getServices(),
      ])
      setCars(fetchedCars)
      setServices(fetchedServices)

      // Set default selected car & service if not already set
      if (fetchedCars.length > 0 && !form.selectedCarId) {
        setForm(prev => ({
          ...prev,
          selectedCarId: fetchedCars[0].id,
        }))
      }
      const matching = fetchedServices.find(s => s.name === form.tripType)
      if (matching) {
        setForm(prev => ({ ...prev, selectedServiceId: matching.id }))
      }
    } catch (e) {
      console.error('Error fetching fleet', e)
    } finally {
      setIsLoadingData(false)
    }
  }

  const updateForm = (updates: Partial<BookingFormData>) => {
    setForm(prev => {
      const next = { ...prev, ...updates }

      // If trip type changed, match the appropriate service ID
      if (updates.tripType && updates.tripType !== prev.tripType) {
        const matching = services.find(s => s.name === updates.tripType)
        if (matching) {
          next.selectedServiceId = matching.id
        }
      }

      return next
    })
    setValidationErrors({})
  }

  const resetForm = () => {
    setForm({
      ...defaultFormData,
      pickupDate: getTodayString(),
      pickupTime: getDefaultTimeString(),
      selectedCarId: cars[0]?.id || null,
      fullName: user?.name || '',
      emailAddress: user?.email || '',
      phoneNumber: user?.phone || '',
    })
    setCurrentStep(1)
    setValidationErrors({})
    setLastBooking(null)
  }

  const addStop = () => {
    setForm(prev => ({
      ...prev,
      stops: [...prev.stops, ''],
    }))
  }

  const removeStop = (index: number) => {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }))
  }

  const updateStop = (index: number, location: string) => {
    setForm(prev => {
      const newStops = [...prev.stops]
      newStops[index] = location
      return { ...prev, stops: newStops }
    })
  }

  const swapLocations = () => {
    setForm(prev => ({
      ...prev,
      pickupLocation: prev.dropLocation,
      dropLocation: prev.pickupLocation,
    }))
  }

  const selectedCar = cars.find(c => c.id === form.selectedCarId) || cars[0]
  const selectedService = services.find(s => s.id === form.selectedServiceId) || services[0]

  const calculateCarPrice = (car: Car): number => {
    if (form.tripType === 'HOURLY') {
      const hours = form.totalHours || 2
      const ratePerHour = car.rentPrice || 150
      return Math.round(ratePerHour * hours)
    }

    const miles = form.distanceMiles || 15
    let ratePerMile = car.pricePerMile || 2.75
    if (miles <= 5 && car.pricePerMileUnder5) {
      ratePerMile = car.pricePerMileUnder5
    } else if (miles > 5 && car.pricePerMileOver5) {
      ratePerMile = car.pricePerMileOver5
    }

    const baseFare = car.rentPrice || 59
    let fare = baseFare + miles * ratePerMile

    // Additional optional charges
    if (form.tripType === 'AIRPORT_TRANSFER' && form.meetAndGreet) {
      fare += form.meetAndGreetType === 'INSIDE_BAGGAGE' ? 35 : 15
    }
    if (form.travelWithPet) {
      fare += (form.petCount || 1) * 20
    }
    const totalChildSeats = (form.childSeatRearFacing || 0) + (form.childSeatFrontFacing || 0) + (form.childSeatBooster || 0)
    if (totalChildSeats > 0) {
      fare += totalChildSeats * 15
    }

    // Return trip doubles the primary ride fare
    if (form.isReturnTrip) {
      fare = fare * 1.95 // 5% discount on round trip
    }

    return Math.round(fare)
  }

  const totalPrice = selectedCar ? calculateCarPrice(selectedCar) : 150

  const estimatedETA = (() => {
    if (!form.pickupTime || form.durationMinutes === null) return null
    const [h, m] = form.pickupTime.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return null
    const totalMin = h * 60 + m + (form.durationMinutes || 45)
    const etaH = Math.floor(totalMin / 60) % 24
    const etaM = totalMin % 60
    const period = etaH >= 12 ? 'PM' : 'AM'
    const h12 = etaH % 12 || 12
    return `${String(h12).padStart(2, '0')}:${String(etaM).padStart(2, '0')} ${period}`
  })()

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup address is required'
    }
    if (form.tripType !== 'HOURLY' && !form.dropLocation.trim()) {
      errors.dropLocation = 'Drop-off address is required'
    }
    if (form.tripType === 'AIRPORT_TRANSFER') {
      if (!form.flightName?.trim()) errors.flightName = 'Airline name is required'
      if (!form.flightNumber?.trim()) errors.flightNumber = 'Flight number is required'
    }
    if (form.isReturnTrip) {
      if (!form.returnDate) errors.returnDate = 'Return date is required'
      if (!form.returnTime) errors.returnTime = 'Return time is required'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.selectedCarId) {
      errors.selectedCarId = 'Please select a vehicle'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.fullName.trim()) errors.fullName = 'Full name is required'
    if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required'
    if (!form.emailAddress.trim()) {
      errors.emailAddress = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
      errors.emailAddress = 'Enter a valid email address'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = (): boolean => {
    if (currentStep === 1) {
      if (!validateStep1()) return false
      setCurrentStep(2)
      return true
    }
    if (currentStep === 2) {
      if (!validateStep2()) return false
      setCurrentStep(3)
      return true
    }
    return true
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setValidationErrors({})
    }
  }

  const submitBooking = async (): Promise<Booking> => {
    if (!validateStep3()) {
      throw new Error('Please fill in required contact information')
    }

    setIsSubmitting(true)
    try {
      const [h, m] = (form.pickupTime || '12:00').split(':').map(Number)
      const pickupDateTime = new Date(form.pickupDate || getTodayString())
      pickupDateTime.setHours(h || 12, m || 0, 0, 0)

      const payload = {
        userId: user?.id || undefined,
        carId: form.selectedCarId,
        serviceTypeId: form.selectedServiceId,
        tripType: form.tripType,
        passengerCount: form.passengerCount,
        luggageCount: form.luggageCount,
        pickupLocation: form.pickupLocation,
        stops: form.stops.filter(Boolean),
        dropLocation: form.dropLocation,
        distanceMiles: form.distanceMiles,
        pickupTime: pickupDateTime.toISOString(),
        flightName: form.tripType === 'AIRPORT_TRANSFER' ? form.flightName : undefined,
        flightNumber: form.tripType === 'AIRPORT_TRANSFER' ? form.flightNumber : undefined,
        flightTime: form.tripType === 'AIRPORT_TRANSFER' ? form.flightTime : undefined,
        meetAndGreet: form.tripType === 'AIRPORT_TRANSFER' ? form.meetAndGreet : false,
        meetAndGreetType: form.tripType === 'AIRPORT_TRANSFER' && form.meetAndGreet ? form.meetAndGreetType : null,
        welcomeMessage: form.tripType === 'AIRPORT_TRANSFER' ? form.welcomeMessage : false,
        welcomeMessageName: form.tripType === 'AIRPORT_TRANSFER' && form.welcomeMessage ? form.welcomeMessageName : null,
        travelWithPet: form.travelWithPet,
        petCount: form.travelWithPet ? form.petCount : null,
        paymentMethod: form.paymentMethod,
        phone: form.phoneNumber,
        name: form.fullName,
        email: form.emailAddress,
        password: form.guestPassword || undefined,
        childSeatFrontFacing: form.childSeatFrontFacing > 0 ? form.childSeatFrontFacing : undefined,
        childSeatRearFacing: form.childSeatRearFacing > 0 ? form.childSeatRearFacing : undefined,
        childSeatBooster: form.childSeatBooster > 0 ? form.childSeatBooster : undefined,
        isReturnTrip: form.isReturnTrip,
        returnDate: form.isReturnTrip && form.returnDate ? new Date(form.returnDate).toISOString() : undefined,
        returnTime: form.isReturnTrip ? form.returnTime : undefined,
        returnPickupLocation: form.isReturnTrip ? (form.returnPickupLocation || form.dropLocation) : undefined,
        returnDropLocation: form.isReturnTrip ? (form.returnDropLocation || form.pickupLocation) : undefined,
        returnFlightName: form.isReturnTrip ? form.returnFlightName : undefined,
        returnFlightNumber: form.isReturnTrip ? form.returnFlightNumber : undefined,
        additionalContacts: form.additionalContacts.filter(c => c.name || c.phone || c.email),
        totalAmount: totalPrice,
      }

      const res = await api.createBooking(payload)
      setLastBooking(res)
      return res
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        setStep: setCurrentStep,
        nextStep,
        prevStep,
        cars,
        services,
        isLoadingData,
        refreshFleet: loadFleetAndServices,
        form,
        updateForm,
        resetForm,
        selectedCar,
        selectedService,
        calculateCarPrice,
        estimatedETA,
        totalPrice,
        addStop,
        removeStop,
        updateStop,
        swapLocations,
        isSubmitting,
        lastBooking,
        submitBooking,
        validationErrors,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) throw new Error('useBooking must be used within BookingProvider')
  return context
}
