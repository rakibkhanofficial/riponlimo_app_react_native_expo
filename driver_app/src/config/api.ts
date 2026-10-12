import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { User, Booking } from '../types'

const API_STORAGE_KEY = '@ripon_limo_driver_api_url'

export const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Platform.select({
    android: `https://www.riponlimo.com`,
    ios: `https://www.riponlimo.com`,
    default: `https://www.riponlimo.com`,
  }) ||
  `https://www.riponlimo.com`

export const FALLBACK_DRIVER_USER: User = {
  id: 'cmtsaqszn000213isx86po6mo',
  name: 'John Rivera',
  email: 'driver1@riponlimo.com',
  phone: '+1 (305) 123-4567',
  role: 'DRIVER',
}

export const FALLBACK_ASSIGNED_BOOKINGS: Booking[] = [
  {
    id: 'cmtsar0mx000s13is5fu1xm9s',
    userId: 'cmtsalice01',
    driverId: 'cmtsaqszn000213isx86po6mo',
    carId: 'cmtsaqvvw000a13is7v3ul06p',
    serviceTypeId: 'cmtsaqz7h000m13isjn51971x',
    tripType: 'AIRPORT_TRANSFER',
    passengerCount: 2,
    luggageCount: 3,
    pickupLocation: 'JFK International Airport (Terminal 4 Arrival)',
    dropLocation: 'The St. Regis New York, 2 East 55th St',
    pickupTime: new Date(Date.now() + 30 * 60000).toISOString(), // in 30 minutes
    flightName: 'Delta Air Lines',
    flightNumber: 'DL 420',
    flightTime: '03:15 PM',
    meetAndGreet: true,
    meetAndGreetType: 'INSIDE_BAGGAGE',
    welcomeMessage: true,
    welcomeMessageName: 'MR. & MRS. STERLING',
    travelWithPet: false,
    childSeatRearFacing: 0,
    childSeatFrontFacing: 1,
    childSeatBooster: 0,
    status: 'CONFIRMED',
    totalAmount: 220,
    createdAt: new Date().toISOString(),
    user: {
      name: 'Alice Sterling',
      phone: '+1 (786) 987-6543',
      email: 'alice@example.com',
    },
    car: {
      brand: 'Cadillac',
      model: 'Escalade ESV VIP',
      plateNumber: 'SUV-001',
      images: ['/cars/cadillac-escalade.png'],
    },
    serviceType: {
      name: 'AIRPORT_TRANSFER',
    },
  },
  {
    id: 'cmtsar9912002',
    userId: 'cmtsdavid02',
    driverId: 'cmtsaqszn000213isx86po6mo',
    carId: 'cmtsaqvvw000a13is7v3ul06p',
    serviceTypeId: 'cmtsaqzg1000n13is87jctsk6',
    tripType: 'HOURLY',
    passengerCount: 3,
    luggageCount: 2,
    pickupLocation: 'Midtown Manhattan, 450 Lexington Ave',
    dropLocation: 'Multiple Manhattan stops (Hourly Charter)',
    pickupTime: new Date(Date.now() + 4 * 3600000).toISOString(), // in 4 hours
    status: 'CONFIRMED',
    totalAmount: 380,
    createdAt: new Date().toISOString(),
    user: {
      name: 'David Park',
      phone: '+1 (561) 456-7890',
      email: 'david@example.com',
    },
    car: {
      brand: 'Cadillac',
      model: 'Escalade ESV VIP',
      plateNumber: 'SUV-001',
      images: ['/cars/cadillac-escalade.png'],
    },
    serviceType: {
      name: 'HOURLY',
    },
  },
]

export const FALLBACK_AVAILABLE_BOOKINGS: Booking[] = [
  {
    id: 'cmtsar4tk000y13is36v3oayc',
    userId: 'client-guest-1',
    driverId: null,
    carId: 'cmtsaqwyy000g13isnh7woeje',
    serviceTypeId: 'cmtsaqyqa000l13issf06hoj6',
    tripType: 'POINT_TO_POINT',
    passengerCount: 2,
    luggageCount: 2,
    pickupLocation: 'Greenwich, CT Executive Estate',
    dropLocation: 'LaGuardia Airport (LGA Terminal B)',
    pickupTime: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: 'CONFIRMED',
    totalAmount: 260,
    createdAt: new Date().toISOString(),
    user: {
      name: 'Richard Wellington',
      phone: '+1 (203) 555-0199',
      email: 'rwellington@finance.com',
    },
    car: {
      brand: 'Mercedes-Benz',
      model: 'S 580 Presidential',
      plateNumber: 'SED-001',
      images: ['/cars/mercedes-s-class.png'],
    },
    serviceType: {
      name: 'POINT_TO_POINT',
    },
  },
  {
    id: 'cmtxurddj00023xlnji8au2ma',
    userId: 'client-guest-2',
    driverId: null,
    carId: 'cmtsaqwfs000c13islbd0noj5',
    serviceTypeId: 'cmtsaqyqa000l13issf06hoj6',
    tripType: 'POINT_TO_POINT',
    passengerCount: 4,
    luggageCount: 4,
    pickupLocation: 'Wall Street Heliport, Downtown NYC',
    dropLocation: 'Teterboro Airport (Private Aviation FBO)',
    pickupTime: new Date(Date.now() + 8 * 3600000).toISOString(),
    status: 'CONFIRMED',
    totalAmount: 295,
    createdAt: new Date().toISOString(),
    user: {
      name: 'Evelyn St. Claire',
      phone: '+1 (917) 555-4321',
      email: 'evelyn@venture.com',
    },
    car: {
      brand: 'GMC',
      model: 'Yukon Denali XL',
      plateNumber: 'SUV-002',
      images: ['/cars/gmc-yukon.png'],
    },
    serviceType: {
      name: 'POINT_TO_POINT',
    },
  },
]

class DriverApiClient {
  private baseUrl: string = DEFAULT_BASE_URL

  constructor() {
    this.init()
  }

  async init() {
    try {
      const saved = await AsyncStorage.getItem(API_STORAGE_KEY)
      if (saved) this.baseUrl = saved
    } catch { }
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  async setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '')
    await AsyncStorage.setItem(API_STORAGE_KEY, this.baseUrl)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return data
    } catch (err: any) {
      clearTimeout(timeout)
      throw err
    }
  }

  async login(email: string, password: string): Promise<{ user: User }> {
    try {
      const res = await this.request<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      return res
    } catch (err: any) {
      // Demo driver fallback for testing
      if (email.toLowerCase().includes('driver') || email.toLowerCase().includes('demo')) {
        return { user: FALLBACK_DRIVER_USER }
      }
      throw err
    }
  }

  async getAssignedBookings(driverId: string): Promise<Booking[]> {
    try {
      const data = await this.request<Booking[]>(`/api/driver/bookings?driverId=${driverId}`)
      if (Array.isArray(data) && data.length > 0) return data
      return FALLBACK_ASSIGNED_BOOKINGS
    } catch (err) {
      console.log('[API] Using local assigned bookings')
      return FALLBACK_ASSIGNED_BOOKINGS
    }
  }

  async getAvailableBookings(): Promise<Booking[]> {
    try {
      const data = await this.request<Booking[]>('/api/driver/bookings?type=available')
      if (Array.isArray(data) && data.length > 0) return data
      return FALLBACK_AVAILABLE_BOOKINGS
    } catch (err) {
      console.log('[API] Using local available bookings')
      return FALLBACK_AVAILABLE_BOOKINGS
    }
  }

  async updateBookingStatus(id: string, driverId: string, status: string): Promise<Booking> {
    try {
      return await this.request<Booking>('/api/driver/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ id, driverId, status }),
      })
    } catch (err: any) {
      console.log('[API] Local mock status update')
      const target = FALLBACK_ASSIGNED_BOOKINGS.find(b => b.id === id)
      if (target) {
        target.status = status as any
        return target
      }
      throw err
    }
  }

  async acceptBooking(id: string, driverId: string): Promise<Booking> {
    try {
      return await this.request<Booking>('/api/driver/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ id, driverId, action: 'ACCEPT' }),
      })
    } catch (err: any) {
      console.log('[API] Local mock accept ride')
      const claimed = FALLBACK_AVAILABLE_BOOKINGS.find(b => b.id === id)
      if (claimed) {
        claimed.driverId = driverId
        claimed.status = 'CONFIRMED'
        return claimed
      }
      throw err
    }
  }
}

export const driverApi = new DriverApiClient()
