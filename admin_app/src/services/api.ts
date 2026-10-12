import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AnalyticsData, Booking, Car, Driver, ClientUser, AdminUser } from '../types';

const STORAGE_API_KEY = 'ripon_limo_admin_api_url';
const STORAGE_ADMIN_KEY = 'ripon_limo_admin_user';

const DEFAULT_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? `https://www.riponlimo.com`
    : `https://www.riponlimo.com`);

export const getBaseUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_API_KEY);
    return saved || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
};

export const setBaseUrl = async (url: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_API_KEY, url.trim().replace(/\/+$/, ''));
};

export const getStoredAdmin = async (): Promise<AdminUser | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_ADMIN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveAdmin = async (admin: AdminUser): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify(admin));
};

export const clearAdmin = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_ADMIN_KEY);
};

// Fallback Mock Data for instant offline/demo reliability
const MOCK_ANALYTICS: AnalyticsData = {
  bookings: {
    total: 38,
    pending: 4,
    confirmed: 12,
    completed: 20,
    cancelled: 2,
  },
  revenue: {
    total: 14250,
  },
  cars: {
    total: 6,
    available: 4,
  },
  users: {
    total: 24,
    drivers: 5,
  },
  revenueChart: [
    { name: 'Mon', revenue: 1450 },
    { name: 'Tue', revenue: 2100 },
    { name: 'Wed', revenue: 1850 },
    { name: 'Thu', revenue: 2600 },
    { name: 'Fri', revenue: 3200 },
    { name: 'Sat', revenue: 4100 },
    { name: 'Sun', revenue: 3800 },
  ],
  insights: {
    growth: '+18.4%',
    upcomingProbability: 'High Demand (89%)',
    topService: 'Airport Transfer',
    retentionRate: '72%',
    forecast: 'Expected 25% revenue surge during upcoming holiday corporate galas.',
  },
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'cm-ord-901',
    userId: 'usr-1',
    carId: 'car-1',
    tripType: 'ONE_WAY',
    pickupLocation: 'The Peninsula New York, 5th Ave',
    dropLocation: 'JFK International Airport Terminal 4',
    pickupTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    status: 'PENDING',
    paymentStatus: 'PAID',
    totalAmount: 285,
    passengerCount: 2,
    luggageCount: 3,
    flightName: 'Delta Air Lines',
    flightNumber: 'DL 402',
    meetAndGreet: true,
    createdAt: new Date().toISOString(),
    user: { id: 'usr-1', name: 'Sophia Montgomery', email: 'sophia.m@luxurycorp.com', phone: '+1 212 555 0192' },
    car: { id: 'car-1', brand: 'Cadillac', model: 'Escalade ESV', plateNumber: 'RIPON-01' },
    serviceType: { id: 'srv-1', name: 'Airport Transfer' },
    driver: null,
  },
  {
    id: 'cm-ord-902',
    userId: 'usr-2',
    carId: 'car-4',
    tripType: 'HOURLY',
    pickupLocation: 'Wall Street Executive Suites',
    dropLocation: 'Midtown Manhattan Financial Club',
    pickupTime: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 495,
    passengerCount: 3,
    luggageCount: 2,
    driverId: 'drv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: { id: 'usr-2', name: 'David Rockefeller Jr.', email: 'd.rock@capitalhedge.com', phone: '+1 917 555 0834' },
    car: { id: 'car-4', brand: 'Mercedes-Benz', model: 'S-Class 580 4MATIC', plateNumber: 'RIPON-04' },
    serviceType: { id: 'srv-2', name: 'Hourly Charter' },
    driver: { id: 'drv-1', name: 'John Rivera', phone: '+1 646 555 0142', email: 'driver1@riponlimo.com' },
  },
  {
    id: 'cm-ord-903',
    userId: 'usr-3',
    carId: 'car-2',
    tripType: 'ONE_WAY',
    pickupLocation: 'Four Seasons Downtown NYC',
    dropLocation: 'Newark Liberty Intl Airport (EWR)',
    pickupTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'IN_PROGRESS',
    paymentStatus: 'PAID',
    totalAmount: 320,
    passengerCount: 1,
    luggageCount: 2,
    driverId: 'drv-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: { id: 'usr-3', name: 'Elena Rostova', email: 'elena@vanguardgroup.ch', phone: '+1 347 555 0921' },
    car: { id: 'car-2', brand: 'GMC', model: 'Yukon Denali XL', plateNumber: 'RIPON-02' },
    serviceType: { id: 'srv-1', name: 'Airport Transfer' },
    driver: { id: 'drv-2', name: 'Marcus Lee', phone: '+1 718 555 0199', email: 'driver2@riponlimo.com' },
  },
  {
    id: 'cm-ord-904',
    userId: 'usr-4',
    carId: 'car-3',
    tripType: 'ROUND_TRIP',
    pickupLocation: 'Greenwich Country Club, CT',
    dropLocation: 'Metropolitan Opera House, NYC',
    pickupTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 850,
    passengerCount: 4,
    luggageCount: 2,
    driverId: 'drv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    user: { id: 'usr-4', name: 'Harrison Sterling', email: 'harrison@sterlingcap.com', phone: '+1 203 555 0411' },
    car: { id: 'car-3', brand: 'Chevrolet', model: 'Suburban High Country', plateNumber: 'RIPON-03' },
    serviceType: { id: 'srv-3', name: 'Special Event' },
    driver: { id: 'drv-1', name: 'John Rivera', phone: '+1 646 555 0142', email: 'driver1@riponlimo.com' },
  },
];

const MOCK_CARS: Car[] = [
  {
    id: 'car-1',
    name: 'Cadillac Escalade ESV',
    brand: 'Cadillac',
    model: 'Escalade ESV',
    year: 2024,
    plateNumber: 'RIPON-01',
    capacity: 6,
    images: ['/cars/cadillac-escalade.jpg'],
    status: 'AVAILABLE',
    rentPrice: 120,
    pricePerMile: 5.5,
    category: { id: 'cat-1', name: 'Ultra Luxury SUV' },
  },
  {
    id: 'car-2',
    name: 'GMC Yukon Denali XL',
    brand: 'GMC',
    model: 'Yukon Denali XL',
    year: 2024,
    plateNumber: 'RIPON-02',
    capacity: 6,
    images: ['/cars/gmc-yukon.jpg'],
    status: 'AVAILABLE',
    rentPrice: 110,
    pricePerMile: 5.0,
    category: { id: 'cat-1', name: 'Luxury Executive SUV' },
  },
  {
    id: 'car-3',
    name: 'Chevrolet Suburban High Country',
    brand: 'Chevrolet',
    model: 'Suburban High Country',
    year: 2024,
    plateNumber: 'RIPON-03',
    capacity: 7,
    images: ['/cars/chevy-suburban.jpg'],
    status: 'MAINTENANCE',
    rentPrice: 95,
    pricePerMile: 4.8,
    category: { id: 'cat-2', name: 'Full Size SUV' },
  },
  {
    id: 'car-4',
    name: 'Mercedes-Benz S-Class 580',
    brand: 'Mercedes-Benz',
    model: 'S-Class 580 4MATIC',
    year: 2024,
    plateNumber: 'RIPON-04',
    capacity: 3,
    images: ['/cars/mercedes-s-class.jpg'],
    status: 'AVAILABLE',
    rentPrice: 140,
    pricePerMile: 6.0,
    category: { id: 'cat-3', name: 'First Class Sedan' },
  },
  {
    id: 'car-5',
    name: 'Lincoln MKT Limousine',
    brand: 'Lincoln',
    model: 'MKT Stretch Limo',
    year: 2023,
    plateNumber: 'RIPON-05',
    capacity: 8,
    images: ['/cars/lincoln-mkt.jpg'],
    status: 'AVAILABLE',
    rentPrice: 165,
    pricePerMile: 6.5,
    category: { id: 'cat-4', name: 'Stretch Limousine' },
  },
  {
    id: 'car-6',
    name: 'Cadillac CT5-V Blackwing',
    brand: 'Cadillac',
    model: 'CT5 Premium Luxury',
    year: 2024,
    plateNumber: 'RIPON-06',
    capacity: 3,
    images: ['/cars/cadillac-ct5.jpg'],
    status: 'OUT_OF_SERVICE',
    rentPrice: 90,
    pricePerMile: 4.5,
    category: { id: 'cat-3', name: 'Executive Sedan' },
  },
];

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'John Rivera',
    email: 'driver1@riponlimo.com',
    phone: '+1 (646) 555-0142',
    status: 'ON_TRIP',
    activeTrips: 1,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'drv-2',
    name: 'Marcus Lee',
    email: 'driver2@riponlimo.com',
    phone: '+1 (718) 555-0199',
    status: 'ON_TRIP',
    activeTrips: 1,
    createdAt: '2024-02-01T09:30:00Z',
  },
  {
    id: 'drv-3',
    name: 'Alexander Novak',
    email: 'alex.novak@riponlimo.com',
    phone: '+1 (917) 555-0328',
    status: 'AVAILABLE',
    activeTrips: 0,
    createdAt: '2024-03-10T11:00:00Z',
  },
  {
    id: 'drv-4',
    name: 'Dmitri Volkov',
    email: 'dmitri.v@riponlimo.com',
    phone: '+1 (347) 555-0814',
    status: 'AVAILABLE',
    activeTrips: 0,
    createdAt: '2024-04-12T14:15:00Z',
  },
];

const MOCK_CLIENTS: ClientUser[] = [
  {
    id: 'usr-1',
    name: 'Sophia Montgomery',
    email: 'sophia.m@luxurycorp.com',
    phone: '+1 212 555 0192',
    role: 'USER',
    createdAt: '2024-03-01T10:00:00Z',
    referralCode: 'SOPHIAVIP',
    _count: { bookings: 6 },
  },
  {
    id: 'usr-2',
    name: 'David Rockefeller Jr.',
    email: 'd.rock@capitalhedge.com',
    phone: '+1 917 555 0834',
    role: 'USER',
    createdAt: '2024-02-14T11:20:00Z',
    referralCode: 'ROCKCAP',
    _count: { bookings: 14 },
  },
  {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena@vanguardgroup.ch',
    phone: '+1 347 555 0921',
    role: 'USER',
    createdAt: '2024-05-18T16:45:00Z',
    referralCode: null,
    _count: { bookings: 3 },
  },
  {
    id: 'usr-4',
    name: 'Harrison Sterling',
    email: 'harrison@sterlingcap.com',
    phone: '+1 203 555 0411',
    role: 'USER',
    createdAt: '2024-01-20T09:15:00Z',
    referralCode: 'STERLING20',
    _count: { bookings: 9 },
  },
];

// In-memory mutation buffer for offline/demo persistence
let localBookings = [...MOCK_BOOKINGS];
let localCars = [...MOCK_CARS];
let localDrivers = [...MOCK_DRIVERS];

export const AdminApi = {
  // Authentication
  login: async (email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    const baseUrl = await getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && ['ADMIN', 'SUPERADMIN'].includes(data.user.role)) {
          await saveAdmin(data.user);
          return { success: true, user: data.user };
        } else {
          return { success: false, error: 'Access denied: Administrator privileges required.' };
        }
      }
    } catch {
      // Backend not running, check demo accounts
    }

    // Demo admin credentials check
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@riponlimo.com' || cleanEmail === 'superadmin@riponlimo.com') &&
      password === 'password123'
    ) {
      const demoAdmin: AdminUser = {
        id: cleanEmail.includes('super') ? 'superadmin-1' : 'admin-1',
        name: cleanEmail.includes('super') ? 'Super Administrator' : 'Executive Dispatcher',
        email: cleanEmail,
        phone: '+1 (800) 555-LIMO',
        role: cleanEmail.includes('super') ? 'SUPERADMIN' : 'ADMIN',
      };
      await saveAdmin(demoAdmin);
      return { success: true, user: demoAdmin };
    }

    return { success: false, error: 'Invalid admin credentials. Use admin@riponlimo.com / password123' };
  },

  // Analytics Overview
  getAnalytics: async (): Promise<AnalyticsData> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/analytics?adminId=${admin?.id || 'admin-1'}`, {
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.bookings) return data;
      }
    } catch {
      // fallback
    }

    // Recalculate dynamic stats from local state
    const pending = localBookings.filter(b => b.status === 'PENDING').length;
    const confirmed = localBookings.filter(b => b.status === 'CONFIRMED').length;
    const inProgress = localBookings.filter(b => b.status === 'IN_PROGRESS').length;
    const completed = localBookings.filter(b => b.status === 'COMPLETED').length;
    const cancelled = localBookings.filter(b => b.status === 'CANCELLED').length;
    const totalRev = localBookings.reduce((sum, b) => (b.paymentStatus === 'PAID' ? sum + b.totalAmount : sum), 0);
    const availableCars = localCars.filter(c => c.status === 'AVAILABLE').length;

    return {
      ...MOCK_ANALYTICS,
      bookings: {
        total: localBookings.length,
        pending,
        confirmed: confirmed + inProgress,
        completed,
        cancelled,
      },
      revenue: {
        total: totalRev,
      },
      cars: {
        total: localCars.length,
        available: availableCars,
      },
      recentBookings: localBookings.slice(0, 5),
    };
  },

  // Bookings / Orders
  getBookings: async (statusFilter?: string): Promise<Booking[]> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const separator = query ? '&' : '?';
      const url = `${baseUrl}/api/admin/bookings${query}${separator}adminId=${admin?.id || 'admin-1'}`;
      const res = await fetch(url, {
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }

    if (!statusFilter || statusFilter === 'ALL') {
      return localBookings;
    }
    return localBookings.filter(b => b.status === statusFilter);
  },

  updateBooking: async (
    id: string,
    updates: {
      status?: string;
      driverId?: string | null;
      paymentStatus?: string;
      totalAmount?: number;
    }
  ): Promise<Booking> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/bookings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local buffer
        localBookings = localBookings.map(b => (b.id === id ? { ...b, ...updated } : b));
        return updated;
      }
    } catch {
      // fallback
    }

    // Local update
    let foundDriver: Driver | null = null;
    if (updates.driverId) {
      foundDriver = localDrivers.find(d => d.id === updates.driverId) || null;
    }

    localBookings = localBookings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...(updates.status ? { status: updates.status as any } : {}),
          ...(updates.driverId !== undefined ? { driverId: updates.driverId } : {}),
          ...(updates.paymentStatus ? { paymentStatus: updates.paymentStatus as any } : {}),
          ...(updates.totalAmount !== undefined ? { totalAmount: updates.totalAmount } : {}),
          ...(updates.driverId !== undefined ? { driver: foundDriver ? { id: foundDriver.id, name: foundDriver.name, phone: foundDriver.phone || null, email: foundDriver.email } : null } : {}),
        };
      }
      return b;
    });

    const target = localBookings.find(b => b.id === id)!;
    return target;
  },

  // Fleet Management
  getCars: async (): Promise<Car[]> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/cars?adminId=${admin?.id || 'admin-1'}`, {
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    return localCars;
  },

  updateCar: async (id: string, updates: Partial<Car>): Promise<Car> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/cars?id=${id}&adminId=${admin?.id || 'admin-1'}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        localCars = localCars.map(c => (c.id === id ? { ...c, ...updated } : c));
        return updated;
      }
    } catch {
      // fallback
    }

    localCars = localCars.map(c => (c.id === id ? { ...c, ...updates } : c));
    return localCars.find(c => c.id === id)!;
  },

  createCar: async (carData: Partial<Car>): Promise<Car> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/cars?adminId=${admin?.id || 'admin-1'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
        body: JSON.stringify(carData),
      });
      if (res.ok) {
        const created = await res.json();
        localCars.unshift(created);
        return created;
      }
    } catch {
      // fallback
    }

    const newCar: Car = {
      id: `car-custom-${Date.now()}`,
      name: `${carData.brand || 'Vehicle'} ${carData.model || ''}`,
      brand: carData.brand || 'Luxury',
      model: carData.model || 'Model',
      year: carData.year || 2024,
      plateNumber: carData.plateNumber || `RIPON-${Math.floor(10 + Math.random() * 89)}`,
      capacity: carData.capacity || 4,
      images: carData.images && carData.images.length > 0 ? carData.images : ['/cars/cadillac-escalade.jpg'],
      status: carData.status || 'AVAILABLE',
      rentPrice: carData.rentPrice || 100,
      pricePerMile: carData.pricePerMile || 5.0,
      category: { id: 'cat-custom', name: 'Executive Fleet' },
    };
    localCars.unshift(newCar);
    return newCar;
  },

  deleteCar: async (id: string): Promise<boolean> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/cars?id=${id}&adminId=${admin?.id || 'admin-1'}`, {
        method: 'DELETE',
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        localCars = localCars.filter(c => c.id !== id);
        return true;
      }
    } catch {
      // fallback
    }
    localCars = localCars.filter(c => c.id !== id);
    return true;
  },

  // Chauffeurs
  getDrivers: async (): Promise<Driver[]> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/drivers?adminId=${admin?.id || 'admin-1'}`, {
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    return localDrivers;
  },

  createDriver: async (driverData: { name: string; email: string; phone?: string; password?: string }): Promise<Driver> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/drivers?adminId=${admin?.id || 'admin-1'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
        body: JSON.stringify(driverData),
      });
      if (res.ok) {
        const created = await res.json();
        localDrivers.unshift(created);
        return created;
      }
    } catch {
      // fallback
    }

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      name: driverData.name,
      email: driverData.email,
      phone: driverData.phone || null,
      status: 'AVAILABLE',
      activeTrips: 0,
      createdAt: new Date().toISOString(),
    };
    localDrivers.unshift(newDriver);
    return newDriver;
  },

  // Clients
  getClients: async (): Promise<ClientUser[]> => {
    const baseUrl = await getBaseUrl();
    const admin = await getStoredAdmin();
    try {
      const res = await fetch(`${baseUrl}/api/admin/users?adminId=${admin?.id || 'admin-1'}`, {
        headers: {
          'x-admin-id': admin?.id || 'admin-1',
          'x-user-id': admin?.id || 'admin-1',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    return MOCK_CLIENTS;
  },
};
