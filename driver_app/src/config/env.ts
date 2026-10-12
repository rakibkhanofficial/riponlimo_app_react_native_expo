/**
 * Driver Application Environment Configuration
 * Centralizes all API keys and service endpoints.
 * Populated from .env via EXPO_PUBLIC_*
 */

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://www.riponlimo.com',
  MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '',
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
}
