export type Role = 'USER' | 'DRIVER' | 'ADMIN' | 'SUPERADMIN'

export interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: Role
  image?: string | null
  referralCode?: string | null
}

export interface Category {
  id: string
  name: string
  description?: string | null
}

export interface Car {
  id: string
  name: string
  brand: string
  model: string
  year?: number
  plateNumber?: string
  capacity: number
  luggageCapacity?: number
  images: string[]
  categoryId?: string
  category?: Category
  rentPrice: number
  pricePerKm?: number | null
  pricePerMile?: number | null
  pricePerMileUnder5?: number | null
  pricePerMileOver5?: number | null
  status?: 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'
  features?: string[]
}

export type TripType = 'POINT_TO_POINT' | 'AIRPORT_TRANSFER' | 'HOURLY'

export interface ServiceType {
  id: string
  name: string
  description?: string | null
  basePrice: number
  pricePerUnit?: number | null
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'ONLINE' | 'PAY_LATER'

export interface AdditionalContact {
  name: string
  phone: string
  email: string
}

export interface Booking {
  id: string
  userId: string
  carId: string
  serviceTypeId: string
  driverId?: string | null
  tripType: TripType
  passengerCount?: number | null
  luggageCount?: number | null
  pickupLocation: string
  stops?: string[]
  dropLocation?: string | null
  pickupTime: string
  dropTime?: string | null
  flightName?: string | null
  flightNumber?: string | null
  flightTime?: string | null
  status: BookingStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  meetAndGreet?: boolean
  meetAndGreetType?: string | null
  welcomeMessage?: boolean
  welcomeMessageName?: string | null
  travelWithPet?: boolean
  petCount?: number | null
  isReturnTrip?: boolean
  returnDate?: string | null
  returnTime?: string | null
  returnPickupLocation?: string | null
  returnDropLocation?: string | null
  returnStops?: string[]
  returnFlightName?: string | null
  returnFlightNumber?: string | null
  additionalContacts?: AdditionalContact[] | null
  createdAt: string
  car?: {
    brand: string
    model: string
    images?: string[]
    plateNumber?: string
    rentPrice?: number
  }
  serviceType?: {
    name: string
  }
  payment?: {
    method: string
    amount: number
  }
}

export interface BookingFormData {
  tripType: TripType
  pickupDate: string // YYYY-MM-DD
  pickupTime: string // HH:mm
  dropTime?: string // for hourly
  totalHours?: number // for hourly
  pickupLocation: string
  dropLocation: string
  stops: string[]
  distanceMiles: number | null
  durationMinutes: number | null
  
  // Airport Transfer specifics
  flightName?: string
  flightNumber?: string
  flightTime?: string
  meetAndGreet: boolean
  meetAndGreetType: 'CURBSIDE' | 'INSIDE_BAGGAGE'
  welcomeMessage: boolean
  welcomeMessageName: string

  // Passenger & luggage
  passengerCount: number
  luggageCount: number

  // Child seats (Requested order: Rear-facing, Front-facing, Booster)
  childSeatRearFacing: number
  childSeatFrontFacing: number
  childSeatBooster: number

  // Pet
  travelWithPet: boolean
  petCount: number

  // Return trip
  isReturnTrip: boolean
  returnDate?: string
  returnTime?: string
  returnPickupLocation?: string
  returnDropLocation?: string
  returnFlightName?: string
  returnFlightNumber?: string

  // Additional Contacts
  additionalContacts: AdditionalContact[]

  // Vehicle & Service selection
  selectedCarId: string | null
  selectedServiceId: string | null

  // Contact info (Guest or user)
  fullName: string
  phoneNumber: string
  emailAddress: string
  guestPassword?: string
  specialInstructions?: string

  // Payment
  paymentMethod: PaymentMethod
}
