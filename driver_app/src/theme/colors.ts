export interface ThemeColors {
  isDark: boolean
  background: string
  surface: string
  surfaceSubtle: string
  card: string
  cardBorder: string
  cardBorderHighlight: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string
  primary: string // Luxury Gold
  primaryHover: string
  primaryLight: string
  primaryGradient: [string, string]
  darkGradient: [string, string]
  accent: string
  border: string
  borderSubtle: string
  inputBackground: string
  inputBorder: string
  error: string
  errorBackground: string
  success: string
  successBackground: string
  warning: string
  warningBackground: string
  tabBarBackground: string
  tabBarBorder: string
  badgeBackground: string
  driverActive: string
  driverActiveBg: string
}

export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0B0E14',
  surface: '#121722',
  surfaceSubtle: '#181E2C',
  card: '#141A26',
  cardBorder: '#232B3C',
  cardBorderHighlight: '#D4AF37',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textInverse: '#0B0E14',
  primary: '#D4AF37', // Chauffeur Gold
  primaryHover: '#C5A030',
  primaryLight: 'rgba(212, 175, 55, 0.15)',
  primaryGradient: ['#E6C25B', '#C59E28'],
  darkGradient: ['#141A26', '#0B0E14'],
  accent: '#E5C365',
  border: '#232B3C',
  borderSubtle: '#1B2230',
  inputBackground: '#10141D',
  inputBorder: '#283244',
  error: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.12)',
  success: '#10B981',
  successBackground: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBackground: 'rgba(245, 158, 11, 0.12)',
  tabBarBackground: '#0F131C',
  tabBarBorder: '#1E2534',
  badgeBackground: 'rgba(212, 175, 55, 0.12)',
  driverActive: '#10B981',
  driverActiveBg: 'rgba(16, 185, 129, 0.15)',
}

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardBorderHighlight: '#B89025',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  primary: '#B89025',
  primaryHover: '#9A771C',
  primaryLight: 'rgba(184, 144, 37, 0.12)',
  primaryGradient: ['#CFA93E', '#B89025'],
  darkGradient: ['#FFFFFF', '#F8FAFC'],
  accent: '#A37C18',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  inputBackground: '#F8FAFC',
  inputBorder: '#CBD5E1',
  error: '#DC2626',
  errorBackground: '#FEE2E2',
  success: '#059669',
  successBackground: '#D1FAE5',
  warning: '#D97706',
  warningBackground: '#FEF3C7',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  badgeBackground: 'rgba(184, 144, 37, 0.1)',
  driverActive: '#059669',
  driverActiveBg: 'rgba(5, 150, 105, 0.12)',
}
