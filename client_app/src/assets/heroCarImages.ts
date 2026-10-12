import { ImageSourcePropType } from 'react-native'

export const heroCarImages: Record<string, ImageSourcePropType> = {
  '/hero-cars/lincoln-mkt.jpg': require('../../assets/hero-cars/lincoln-mkt.jpg'),
  '/hero-cars/gmc-yukon.jpg': require('../../assets/hero-cars/gmc-yukon.jpg'),
  '/hero-cars/mercedes-s-class.jpg': require('../../assets/hero-cars/mercedes-s-class.jpg'),
  '/hero-cars/cadillac-escalade.jpg': require('../../assets/hero-cars/cadillac-escalade.jpg'),
  '/hero-cars/chevy-suburban.jpg': require('../../assets/hero-cars/chevy-suburban.jpg'),
  '/hero-cars/cadillac-ct5.jpg': require('../../assets/hero-cars/cadillac-ct5.jpg'),
}

export function resolveHeroImage(key: string): ImageSourcePropType {
  if (heroCarImages[key]) {
    return heroCarImages[key]
  }
  return require('../../assets/hero-cars/cadillac-escalade.jpg')
}
