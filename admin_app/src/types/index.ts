export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type CarStatus = 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'SUPERADMIN';
}

export interface AnalyticsData {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
  };
  cars: {
    total: number;
    available: number;
  };
  users: {
    total: number;
    drivers: number;
  };
  recentBookings?: any[];
  bookingsByStatus?: { status: string; _count: number }[];
  revenueChart: {
    name: string;
    revenue: number;
  }[];
  insights: {
    growth: string;
    upcomingProbability: string;
    topService: string;
    retentionRate: string;
    forecast: string;
  };
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  capacity: number;
  images: string[];
  status: CarStatus;
  rentPrice: number;
  pricePerMile?: number | null;
  pricePerKm?: number | null;
  pricePerMileUnder5?: number | null;
  pricePerMileOver5?: number | null;
  category?: {
    id: string;
    name: string;
  };
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status?: 'AVAILABLE' | 'ON_TRIP';
  activeTrips?: number;
  createdAt?: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  referralCode?: string | null;
  _count?: {
    bookings: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  serviceTypeId?: string;
  driverId?: string | null;
  tripType: string;
  passengerCount?: number | null;
  luggageCount?: number | null;
  childSeatFrontFacing?: number | null;
  childSeatRearFacing?: number | null;
  childSeatBooster?: number | null;
  pickupLocation: string;
  dropLocation?: string | null;
  stops?: string[];
  pickupTime: string;
  dropTime?: string | null;
  flightName?: string | null;
  flightNumber?: string | null;
  flightTime?: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  meetAndGreet?: boolean;
  welcomeMessage?: boolean;
  travelWithPet?: boolean;
  petCount?: number | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  car?: {
    id: string;
    brand: string;
    model: string;
    plateNumber?: string;
    images?: string[];
  };
  serviceType?: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
}
