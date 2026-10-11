import React, { createContext, useContext, useState, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkTheme, lightTheme, ThemeColors } from './colors'

type ThemeMode = 'system' | 'dark' | 'light'

interface ThemeContextType {
  theme: ThemeColors
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => Promise<void>
  toggleTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeMode: 'system',
  isDark: true,
  setThemeMode: async () => {},
  toggleTheme: async () => {},
})

const THEME_STORAGE_KEY = '@ripon_limo_driver_theme_mode'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeModeState(saved)
      }
      setIsLoaded(true)
    }).catch(() => setIsLoaded(true))
  }, [])

  const effectiveIsDark =
    themeMode === 'system'
      ? systemColorScheme === 'light' ? false : true
      : themeMode === 'dark'

  const activeTheme = effectiveIsDark ? darkTheme : lightTheme

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {})
  }

  const toggleTheme = async () => {
    const nextMode = effectiveIsDark ? 'light' : 'dark'
    await setThemeMode(nextMode)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeMode,
        isDark: effectiveIsDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
