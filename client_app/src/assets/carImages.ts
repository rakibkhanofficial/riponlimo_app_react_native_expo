import { ImageSourcePropType } from 'react-native'

export const localCarImages: Record<string, ImageSourcePropType> = {
  // Cadillac Escalade
  '/cars/cadillac-escalade.png': require('../../assets/cars/cadillac-escalade.png'),
  '/cars/cadillac-escalade-interior.png': require('../../assets/cars/cadillac-escalade-interior.png'),
  '/cars/cadillac-escalade-side.png': require('../../assets/cars/cadillac-escalade-side.png'),

  // GMC Yukon
  '/cars/gmc-yukon.png': require('../../assets/cars/gmc-yukon.png'),
  '/cars/gmc-yukon-interior.png': require('../../assets/cars/gmc-yukon-interior.png'),
  '/cars/gmc-yukon-side.png': require('../../assets/cars/gmc-yukon-side.png'),

  // Chevrolet Suburban
  '/cars/chevy-suburban.png': require('../../assets/cars/chevy-suburban.png'),
  '/cars/chevy-suburban-interior.png': require('../../assets/cars/chevy-suburban-interior.png'),
  '/cars/chevy-suburban-side.png': require('../../assets/cars/chevy-suburban-side.png'),

  // Mercedes S-Class
  '/cars/mercedes-s-class.png': require('../../assets/cars/mercedes-s-class.png'),
  '/cars/mercedes-s-class-interior.png': require('../../assets/cars/mercedes-s-class-interior.png'),
  '/cars/mercedes-s-class-side.png': require('../../assets/cars/mercedes-s-class-side.png'),

  // Lincoln MKT
  '/cars/lincoln-mkt.png': require('../../assets/cars/lincoln-mkt.png'),
  '/cars/lincoln-mkt-interior.png': require('../../assets/cars/lincoln-mkt-interior.png'),
  '/cars/lincoln-mkt-side.png': require('../../assets/cars/lincoln-mkt-side.png'),

  // Cadillac CT5
  '/cars/cadillac-ct5.png': require('../../assets/cars/cadillac-ct5.png'),
  '/cars/cadillac-ct5-interior.png': require('../../assets/cars/cadillac-ct5-interior.png'),
  '/cars/cadillac-ct5-side.png': require('../../assets/cars/cadillac-ct5-side.png'),
}

export function resolveCarImage(imagePath?: string): ImageSourcePropType {
  if (!imagePath) {
    return require('../../assets/cars/cadillac-escalade.png')
  }

  // Check local mapped asset
  if (localCarImages[imagePath]) {
    return localCarImages[imagePath]
  }

  // Match by filename suffix if path includes prefix
  const filename = imagePath.split('/').pop()
  if (filename) {
    const key = `/cars/${filename}`
    if (localCarImages[key]) {
      return localCarImages[key]
    }
  }

  // If remote URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return { uri: imagePath }
  }

  return require('../../assets/cars/cadillac-escalade.png')
}
