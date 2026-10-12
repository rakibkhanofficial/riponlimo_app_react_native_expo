import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../../theme/ThemeContext'
import { ENV } from '../../config/env'

interface MapboxRouteMapProps {
  pickupLocation?: string
  dropLocation?: string
  stops?: string[]
  pickupCoords?: [number, number] // [lng, lat]
  dropCoords?: [number, number] // [lng, lat]
  height?: number
  showFullscreenToggle?: boolean
  style?: any
}

export const MapboxRouteMap: React.FC<MapboxRouteMapProps> = ({
  pickupLocation,
  dropLocation,
  stops = [],
  pickupCoords: propPickupCoords,
  dropCoords: propDropCoords,
  height = 220,
  showFullscreenToggle = true,
  style,
}) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [resolvedPickup, setResolvedPickup] = useState<[number, number] | null>(propPickupCoords || null)
  const [resolvedDrop, setResolvedDrop] = useState<[number, number] | null>(propDropCoords || null)
  const [routeInfo, setRouteInfo] = useState<{ distanceMiles: number; durationMinutes: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapStyleTheme, setMapStyleTheme] = useState<'dark' | 'streets'>('dark')

  // Geocode address strings via Mapbox Geocoding API if coordinates are missing
  useEffect(() => {
    let isCancelled = false

    const geocodeAddress = async (query: string): Promise<[number, number] | null> => {
      try {
        const token = ENV.MAPBOX_TOKEN
        if (!token) return null
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&limit=1`
        const res = await fetch(url)
        if (!res.ok) return null
        const data = await res.json()
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center
          return [lng, lat]
        }
      } catch (e) {
        console.warn('Geocoding error for:', query, e)
      }
      return null
    }

    const resolveAll = async () => {
      let pCoords = propPickupCoords || null
      let dCoords = propDropCoords || null

      if (!pCoords && pickupLocation && pickupLocation.trim().length > 3) {
        pCoords = await geocodeAddress(pickupLocation)
      }
      if (!dCoords && dropLocation && dropLocation.trim().length > 3) {
        dCoords = await geocodeAddress(dropLocation)
      }

      if (!isCancelled) {
        // Fallback default coordinates (NYC Manhattan to JFK) if unresolved
        const finalP = pCoords || [-73.9855, 40.758] // Times Square
        const finalD = dCoords || (dropLocation ? [-73.7781, 40.6413] : null) // JFK
        setResolvedPickup(finalP)
        setResolvedDrop(finalD)
      }
    }

    resolveAll()

    return () => {
      isCancelled = true
    }
  }, [pickupLocation, dropLocation, propPickupCoords, propDropCoords])

  // Build the Mapbox GL JS HTML payload
  const generateMapHtml = (isFull: boolean) => {
    const pLng = resolvedPickup ? resolvedPickup[0] : -73.9855
    const pLat = resolvedPickup ? resolvedPickup[1] : 40.758
    const dLng = resolvedDrop ? resolvedDrop[0] : -73.7781
    const dLat = resolvedDrop ? resolvedDrop[1] : 40.6413
    const hasRoute = !!resolvedDrop

    const styleUrl =
      mapStyleTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12'

    return `
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
          .pickup-pin {
            background-color: #25D366;
            color: #000000;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11px;
            font-weight: 900;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.6);
          }
          .drop-pin {
            background-color: #FFFFFF;
            color: #000000;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            border: 2px solid #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 11px;
            font-weight: 900;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
          }
          .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left {
            transform: scale(0.8);
            transform-origin: bottom;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${ENV.MAPBOX_TOKEN}';
          
          const pCoords = [${pLng}, ${pLat}];
          const dCoords = [${dLng}, ${dLat}];
          const hasDrop = ${hasRoute};

          const map = new mapboxgl.Map({
            container: 'map',
            style: '${styleUrl}',
            center: pCoords,
            zoom: 12,
            attributionControl: false
          });

          map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

          // Pickup marker element
          const elP = document.createElement('div');
          elP.className = 'pickup-pin';
          elP.innerHTML = 'A';
          new mapboxgl.Marker(elP).setLngLat(pCoords).addTo(map);

          if (hasDrop) {
            // Drop marker element
            const elD = document.createElement('div');
            elD.className = 'drop-pin';
            elD.innerHTML = 'B';
            new mapboxgl.Marker(elD).setLngLat(dCoords).addTo(map);

            // Fetch and draw driving route via Mapbox Directions API
            map.on('load', async () => {
              try {
                const directionsUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + 
                  pCoords[0] + ',' + pCoords[1] + ';' + dCoords[0] + ',' + dCoords[1] + 
                  '?geometries=geojson&overview=full&access_token=' + mapboxgl.accessToken;
                
                const response = await fetch(directionsUrl);
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                  const route = data.routes[0];
                  const geometry = route.geometry;

                  // Post route stats back to React Native
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ROUTE_INFO',
                    distanceMiles: (route.distance * 0.000621371).toFixed(1),
                    durationMinutes: Math.round(route.duration / 60)
                  }));

                  map.addSource('route', {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: geometry
                    }
                  });

                  // Outer glow line
                  map.addLayer({
                    id: 'route-glow',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                      'line-color': '#25D366',
                      'line-width': 8,
                      'line-opacity': 0.35
                    }
                  });

                  // Main route line
                  map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                      'line-color': '#FFFFFF',
                      'line-width': 4,
                      'line-opacity': 0.95
                    }
                  });

                  // Fit camera bounds around route
                  const bounds = new mapboxgl.LngLatBounds();
                  geometry.coordinates.forEach(c => bounds.extend(c));
                  map.fitBounds(bounds, {
                    padding: { top: 40, bottom: 40, left: 40, right: 40 },
                    duration: 1200
                  });
                }
              } catch (err) {
                console.error('Mapbox Directions error:', err);
              }
            });
          }
        </script>
      </body>
      </html>
    `
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'ROUTE_INFO') {
        setRouteInfo({
          distanceMiles: parseFloat(data.distanceMiles) || 15.2,
          durationMinutes: parseInt(data.durationMinutes, 10) || 35,
        })
      }
    } catch (e) {
      // ignore
    }
  }

  const toggleFullscreen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsFullscreen(!isFullscreen)
  }

  const toggleStyle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setMapStyleTheme(prev => (prev === 'dark' ? 'streets' : 'dark'))
  }

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Map Header / Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.pulseDot} />
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>CHAUFFEUR ROUTE HUD</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleStyle}
            style={[styles.smallBtn, { borderColor: theme.border }]}
          >
            <Text style={[styles.smallBtnText, { color: theme.textSecondary }]}>
              {mapStyleTheme === 'dark' ? 'DAY MAP' : 'VIP DARK'}
            </Text>
          </TouchableOpacity>

          {showFullscreenToggle && (
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={[styles.smallBtn, { borderColor: theme.border }]}
              accessibilityLabel="Expand map to fullscreen"
            >
              <Feather name="maximize-2" size={12} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Mapbox View */}
      <View style={styles.mapWrapper}>
        <WebView
          originWhitelist={['*']}
          source={{ html: generateMapHtml(false) }}
          style={styles.webView}
          onMessage={handleMessage}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {/* Route Stats HUD Overlay */}
        {routeInfo && (
          <View style={[styles.hudOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.88)', borderColor: theme.border }]}>
            <View style={styles.hudItem}>
              <Feather name="navigation" size={11} color="#25D366" />
              <Text style={styles.hudValue}>{routeInfo.distanceMiles} mi</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Feather name="clock" size={11} color="#25D366" />
              <Text style={styles.hudValue}>{routeInfo.durationMinutes} min</Text>
            </View>
          </View>
        )}
      </View>

      {/* Fullscreen Map Modal */}
      <Modal visible={isFullscreen} animationType="fade" onRequestClose={toggleFullscreen}>
        <View style={[styles.fullscreenModal, { backgroundColor: '#000000' }]}>
          <View style={[styles.fullscreenHeader, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
            <View style={styles.headerLeft}>
              <View style={styles.pulseDot} />
              <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>LIVE NAVIGATION OVERVIEW</Text>
            </View>
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityLabel="Close fullscreen map"
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <WebView
            originWhitelist={['*']}
            source={{ html: generateMapHtml(true) }}
            style={styles.fullscreenWebView}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />

          {/* Floating bottom close button */}
          <View style={[styles.floatingCloseContainer, { bottom: Math.max(insets.bottom, 16) + 16 }]} pointerEvents="box-none">
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.floatingClosePill}
              activeOpacity={0.85}
            >
              <Feather name="minimize-2" size={15} color="#000000" />
              <Text style={styles.floatingClosePillText}>CLOSE MAP VIEW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    marginVertical: 10,
  },
  headerBar: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  smallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  smallBtnText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hudOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    gap: 8,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hudValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hudDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullscreenModal: {
    flex: 1,
  },
  fullscreenHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    zIndex: 10,
  },
  fullscreenWebView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCloseContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  floatingClosePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingClosePillText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
})
