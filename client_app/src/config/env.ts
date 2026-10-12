/**
 * Application Environment Configuration
 * Centralizes all API keys, OAuth client IDs, and tokens.
 * Values are provided via .env (EXPO_PUBLIC_*) and app configuration.
 */

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://www.riponlimo.com',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
}
