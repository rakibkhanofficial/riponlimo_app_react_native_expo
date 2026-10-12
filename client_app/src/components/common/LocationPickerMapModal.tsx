import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { Feather, Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../theme/ThemeContext'
import { ENV } from '../../config/env'
import { Button } from './Button'

interface LocationPickerMapModalProps {
  visible: boolean
  title?: string
  initialLocationName?: string
  initialCoords?: [number, number] // [lng, lat]
  onConfirmLocation: (address: string, coords: [number, number]) => void
  onClose: () => void
}

export const LocationPickerMapModal: React.FC<LocationPickerMapModalProps> = ({
  visible,
  title = 'SELECT PIN ON MAP',
  initialLocationName = '',
  initialCoords = [-73.9855, 40.758], // Times Square
  onConfirmLocation,
  onClose,
}) => {
  const { theme } = useTheme()
  const [selectedAddress, setSelectedAddress] = useState(initialLocationName)
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>(initialCoords)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Search Mapbox places
  const handleSearch = async (text: string) => {
    setSearchQuery(text)
    if (text.trim().length < 3) {
      setSearchResults([])
      return
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        text
      )}.json?access_token=${ENV.MAPBOX_TOKEN}&types=poi,address,street&limit=5`
      const res = await fetch(url)
      const data = await res.json()
      if (data.features) {
        setSearchResults(data.features)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleSelectSearchResult = (feature: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const [lng, lat] = feature.center
    setSelectedCoords([lng, lat])
    setSelectedAddress(feature.place_name)
    setSearchQuery('')
    setSearchResults([])
  }

  // Reverse geocode when map center moves
  const handleMapCenterChanged = async (lng: number, lat: number) => {
    setSelectedCoords([lng, lat])
    setIsLoadingAddress(true)
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${ENV.MAPBOX_TOKEN}&types=poi,address,street&limit=1`
      const res = await fetch(url)
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        setSelectedAddress(data.features[0].place_name)
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoadingAddress(false)
    }
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'CENTER_CHANGED') {
        handleMapCenterChanged(data.lng, data.lat)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onConfirmLocation(selectedAddress || `${selectedCoords[1].toFixed(5)}, ${selectedCoords[0].toFixed(5)}`, selectedCoords)
    onClose()
  }

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000000; }
        #map { width: 100%; height: 100%; }
        .center-pin {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
          pointer-events: none;
          z-index: 10;
        }
        .pin-head {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #25D366;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          font-weight: 900;
          font-family: -apple-system, sans-serif;
          font-size: 13px;
        }
        .pin-stem {
          width: 2px;
          height: 12px;
          background: #25D366;
          margin: 0 auto;
        }
        .pin-shadow {
          width: 8px;
          height: 4px;
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="center-pin">
        <div class="pin-head">VIP</div>
        <div class="pin-stem"></div>
        <div class="pin-shadow"></div>
      </div>
      <script>
        mapboxgl.accessToken = '${ENV.MAPBOX_TOKEN}';
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [${selectedCoords[0]}, ${selectedCoords[1]}],
          zoom: 14,
          attributionControl: false
        });

        let debounceTimer;
        map.on('moveend', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const center = map.getCenter();
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CENTER_CHANGED',
              lng: center.lng,
              lat: center.lat
            }));
          }, 350);
        });
      </script>
    </body>
    </html>
  `

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>LIVE CHAUFFEUR DISPATCH</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close location picker">
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchInputWrapper, { backgroundColor: '#141414', borderColor: '#262626' }]}>
            <Feather name="search" size={15} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search airport, hotel, or address..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={14} color="#888888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <View style={[styles.searchResultsList, { backgroundColor: '#1A1A1A', borderColor: '#333333' }]}>
              {searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Feather name="map-pin" size={13} color="#25D366" />
                  <Text style={styles.searchItemText} numberOfLines={1}>
                    {item.place_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Mapbox Interactive View */}
        <View style={styles.mapContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.mapWebView}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Bottom Address Confirmation Card */}
        <View style={[styles.footerCard, { backgroundColor: '#0A0A0A', borderTopColor: '#222222' }]}>
          <View style={styles.selectedAddressHeader}>
            <Feather name="navigation" size={14} color="#25D366" />
            <Text style={styles.selectedLabel}>SELECTED LOCATION</Text>
            {isLoadingAddress && <ActivityIndicator size="small" color="#25D366" style={{ marginLeft: 6 }} />}
          </View>
          <Text style={styles.selectedText} numberOfLines={2}>
            {selectedAddress || 'Pan the map to pinpoint pickup or drop-off location'}
          </Text>

          <View style={styles.footerActions}>
            <Button
              title="SET THIS LOCATION"
              onPress={handleConfirm}
              size="lg"
              iconRight={<Feather name="check" size={16} color="#000000" />}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  eyebrow: {
    color: '#25D366',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 2,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0A0A',
    zIndex: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 2,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchResultsList: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    borderRadius: 2,
    borderWidth: 1,
    maxHeight: 180,
    zIndex: 30,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  searchItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  footerCard: {
    padding: 16,
    borderTopWidth: 1,
  },
  selectedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  selectedLabel: {
    color: '#25D366',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 14,
  },
  footerActions: {
    width: '100%',
  },
})
