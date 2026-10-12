export interface ThemeColors {
  isDark: boolean
  background: string
  surface: string
  surfaceSubtle: string
  card: string
  cardBorder: string
  cardBorderHighlight: string
  text: string // convenience alias for textPrimary
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string
  buttonText: string // convenience alias for textInverse (Black on White button)
  primary: string // Web monochrome primary (White in dark, Black in light)
  primaryHover: string
  primaryLight: string
  primaryGradient: [string, string]
  darkGradient: [string, string]
  accent: string // Luxury green badge as on web (#25D366)
  accentGreen: string // convenience alias for accent (#25D366)
  gold: string
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
  buttonRadius: number
  cardRadius: number
}

// Pure Monochrome Palette matching Web Ripon Limo
export const darkTheme: ThemeColors = {
  isDark: true,
  background: '#000000', // Pure Pitch Black
  surface: '#0A0A0A',
  surfaceSubtle: '#141414',
  card: '#0D0D0D',
  cardBorder: '#222222',
  cardBorderHighlight: '#FFFFFF',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#D4D4D8',
  textMuted: '#71717A',
  textInverse: '#000000',
  buttonText: '#000000',
  primary: '#FFFFFF', // Clean Crisp White (Button bg)
  primaryHover: '#E4E4E7',
  primaryLight: 'rgba(255, 255, 255, 0.12)',
  primaryGradient: ['#FFFFFF', '#E4E4E7'],
  darkGradient: ['#121212', '#000000'],
  accent: '#25D366', // Web featuring green accent
  accentGreen: '#25D366',
  gold: '#FFFFFF', // Remove yellow; pure crisp monochrome
  border: '#222222',
  borderSubtle: '#181818',
  inputBackground: '#080808',
  inputBorder: '#262626',
  error: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.15)',
  success: '#10B981',
  successBackground: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningBackground: 'rgba(245, 158, 11, 0.15)',
  tabBarBackground: '#000000',
  tabBarBorder: '#1F1F1F',
  badgeBackground: 'rgba(255, 255, 255, 0.1)',
  buttonRadius: 2, // Sharp architectural web shape
  cardRadius: 4,
}

export const lightTheme: ThemeColors = {
  isDark: false,
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceSubtle: '#F1F3F5',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  cardBorderHighlight: '#000000',
  text: '#000000',
  textPrimary: '#000000',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  buttonText: '#FFFFFF',
  primary: '#000000', // Clean Solid Black (Button bg)
  primaryHover: '#1F2937',
  primaryLight: 'rgba(0, 0, 0, 0.08)',
  primaryGradient: ['#000000', '#1F2937'],
  darkGradient: ['#F8F9FA', '#E5E7EB'],
  accent: '#16A34A',
  accentGreen: '#16A34A',
  gold: '#000000',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',
  error: '#DC2626',
  errorBackground: 'rgba(220, 38, 38, 0.1)',
  success: '#059669',
  successBackground: 'rgba(5, 150, 105, 0.1)',
  warning: '#D97706',
  warningBackground: 'rgba(217, 119, 6, 0.1)',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  badgeBackground: 'rgba(0, 0, 0, 0.06)',
  buttonRadius: 2,
  cardRadius: 4,
}
