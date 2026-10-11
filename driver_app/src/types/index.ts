export type Role = 'USER' | 'DRIVER' | 'ADMIN' | 'SUPERADMIN'

export interface User {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: Role
  image?: string | null
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TripType = 'POINT_TO_POINT' | 'AIRPORT_TRANSFER' | 'HOURLY'

export interface Booking {
  id: string
  userId?: string
  driverId?: string | null
  carId: string
  serviceTypeId: string
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
  meetAndGreet?: boolean
  meetAndGreetType?: string | null
  welcomeMessage?: boolean
  welcomeMessageName?: string | null
  travelWithPet?: boolean
  petCount?: number | null
  childSeatFrontFacing?: number | null
  childSeatRearFacing?: number | null
  childSeatBooster?: number | null
  status: BookingStatus
  paymentStatus?: string
  totalAmount: number
  isReturnTrip?: boolean
  createdAt: string
  user?: {
    name: string | null
    phone: string | null
    email: string | null
  }
  car?: {
    brand: string
    model: string
    plateNumber?: string
    images?: string[]
  }
  serviceType?: {
    name: string
  }
}

export interface DriverShift {
  isOnline: boolean
  vehicleName: string
  vehiclePlate: string
  completedTripsToday: number
  totalEarningsToday: number
  hoursOnlineToday: number
}
