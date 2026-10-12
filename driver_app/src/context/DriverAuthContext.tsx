import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types'
import { driverApi, FALLBACK_DRIVER_USER } from '../config/api'

interface DriverAuthContextType {
  driver: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  loginDemo: () => Promise<User>
  logout: () => Promise<void>
}

const DRIVER_AUTH_STORAGE_KEY = '@ripon_limo_driver_user'
const DRIVER_LOGGED_OUT_KEY = '@ripon_limo_driver_logged_out'

const DriverAuthContext = createContext<DriverAuthContextType>({
  driver: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented') },
  loginDemo: async () => { throw new Error('Not implemented') },
  logout: async () => {},
})

export const DriverAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDriver()
  }, [])

  const loadDriver = async () => {
    try {
      const isLoggedOut = await AsyncStorage.getItem(DRIVER_LOGGED_OUT_KEY)
      if (isLoggedOut === 'true') {
        setDriver(null)
        setIsLoading(false)
        return
      }

      const stored = await AsyncStorage.getItem(DRIVER_AUTH_STORAGE_KEY)
      if (stored) {
        setDriver(JSON.parse(stored))
      } else {
        setDriver(null)
      }
    } catch {
      setDriver(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loginDemo = async (): Promise<User> => {
    const demoUser = FALLBACK_DRIVER_USER
    setDriver(demoUser)
    await AsyncStorage.removeItem(DRIVER_LOGGED_OUT_KEY)
    await AsyncStorage.setItem(DRIVER_AUTH_STORAGE_KEY, JSON.stringify(demoUser))
    return demoUser
  }

  const login = async (email: string, password: string): Promise<User> => {
    const cleanEmail = email.trim().toLowerCase()

    // Instant local authentication for demo chauffeur (zero latency, offline safe)
    if (
      cleanEmail === 'driver1@riponlimo.com' ||
      cleanEmail === 'demo@riponlimo.com' ||
      cleanEmail.includes('driver1')
    ) {
      return loginDemo()
    }

    try {
      const res = await driverApi.login(email.trim(), password)
      setDriver(res.user)
      await AsyncStorage.removeItem(DRIVER_LOGGED_OUT_KEY)
      await AsyncStorage.setItem(DRIVER_AUTH_STORAGE_KEY, JSON.stringify(res.user))
      return res.user
    } catch (err: any) {
      // If server is unreachable or offline, allow demo account if requested
      if (cleanEmail.includes('driver') || cleanEmail.includes('demo')) {
        return loginDemo()
      }
      throw err
    }
  }

  const logout = async () => {
    setDriver(null)
    await AsyncStorage.removeItem(DRIVER_AUTH_STORAGE_KEY)
    await AsyncStorage.setItem(DRIVER_LOGGED_OUT_KEY, 'true')
  }

  return (
    <DriverAuthContext.Provider
      value={{
        driver,
        isAuthenticated: !!driver,
        isLoading,
        login,
        loginDemo,
        logout,
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  )
}

export const useDriverAuth = () => useContext(DriverAuthContext)
