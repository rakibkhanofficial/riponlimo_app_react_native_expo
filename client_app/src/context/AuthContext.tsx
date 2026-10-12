import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types'
import { api } from '../config/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: (payload: {
    idToken?: string
    accessToken?: string
    email?: string
    name?: string
    image?: string
    googleId?: string
  }) => Promise<User>
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AUTH_USER_STORAGE_KEY = '@ripon_limo_auth_user'

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented') },
  loginWithGoogle: async () => { throw new Error('Not implemented') },
  register: async () => { throw new Error('Not implemented') },
  logout: async () => {},
  updateUser: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Failed to load user', e)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login(email, password)
    setUser(res.user)
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(res.user))
    return res.user
  }

  const loginWithGoogle = async (payload: {
    idToken?: string
    accessToken?: string
    email?: string
    name?: string
    image?: string
    googleId?: string
  }): Promise<User> => {
    const res = await api.loginWithGoogle(payload)
    setUser(res.user)
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(res.user))
    return res.user
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    const res = await api.register(name, email, password, phone)
    setUser(res.user)
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(res.user))
    return res.user
  }

  const logout = async () => {
    setUser(null)
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }

  const updateUser = async (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
