'use client'
import { useEffect, useRef, useState } from 'react'
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Layers, Map as MapIcon } from 'lucide-react'
import type { TripPlan, DirectionsResult } from '@/lib/types'

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#141414' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#141414' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#a0a0a0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a7a7a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0f1a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#1a1f14' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#1c1c1c' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#141f10' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3a5c30' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#888' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#555' }] },
]

interface MapOverlaysProps {
  plan: TripPlan | null
  directions: DirectionsResult | null
}

function MapOverlays({ plan, directions }: MapOverlaysProps) {
  const map = useMap()
  const geometryLib = useMapsLibrary('geometry')
  const markersRef = useRef<google.maps.Marker[]>([])
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const animFrameRef = useRef<number>(0)

  // Draw animated polyline
  useEffect(() => {
    if (!map || !geometryLib || !directions?.overview_polyline) return

    cancelAnimationFrame(animFrameRef.current)
    polylineRef.current?.setMap(null)

    const fullPath = geometryLib.encoding.decodePath(directions.overview_polyline)
    const line = new google.maps.Polyline({
      strokeColor: '#CC0000',
      strokeOpacity: 0,
      strokeWeight: 5,
      geodesic: true,
      map,
    })
    polylineRef.current = line

    // Animate the stroke drawing
    const DURATION = 1600
    const start = performance.now()

    const animate = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      const endIdx = Math.max(2, Math.round(eased * fullPath.length))
      line.setPath(fullPath.slice(0, endIdx))
      line.setOptions({ strokeOpacity: 0.3 + eased * 0.6 })
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }
    animFrameRef.current = requestAnimationFrame(animate)

    // Fit bounds with padding
    const bounds = new google.maps.LatLngBounds()
    fullPath.forEach(p => bounds.extend(p))
    map.fitBounds(bounds, { top: 80, right: 60, bottom: 80, left: 60 })

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      polylineRef.current?.setMap(null)
      polylineRef.current = null
    }
  }, [map, geometryLib, directions?.overview_polyline])

  // Draw markers with info window on click
  useEffect(() => {
    if (!map || !directions?.legs.length || !plan) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    infoWindowRef.current?.close()

    const infoWindow = new google.maps.InfoWindow({ disableAutoPan: false })
    infoWindowRef.current = infoWindow

    const legs = directions.legs
    const allStops = [
      { label: 'A', name: plan.origin.name, address: plan.origin.address, type: 'Start', position: legs[0].start_location },
      ...legs.slice(0, -1).map((leg, i) => ({
        label: String.fromCharCode(66 + i),
        name: plan.waypoints[i]?.name ?? leg.end_address,
        address: plan.waypoints[i]?.address ?? leg.end_address,
        type: plan.waypoints[i]?.type ?? 'stop',
        position: leg.end_location,
      })),
      {
        label: String.fromCharCode(65 + legs.length),
        name: plan.destination.name,
        address: plan.destination.address,
        type: 'End',
        position: legs[legs.length - 1].end_location,
      },
    ]

    markersRef.current = allStops.map(stop => {
      const isEndpoint = stop.type === 'Start' || stop.type === 'End'
      const pinColor = isEndpoint ? '#CC0000' : '#1a1a1a'
      const borderColor = isEndpoint ? '#990000' : '#CC0000'

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.6)"/>
        </filter>
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 24 18 24s18-10.5 18-24C36 8.06 27.94 0 18 0z" fill="${pinColor}" stroke="${borderColor}" stroke-width="1.5" filter="url(#shadow)"/>
        <circle cx="18" cy="17" r="11" fill="${isEndpoint ? '#990000' : '#CC0000'}"/>
        <text x="18" y="21.5" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="12" font-weight="bold">${stop.label}</text>
      </svg>`

      const marker = new google.maps.Marker({
        position: stop.position,
        map,
        title: stop.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(36, 42),
          anchor: new google.maps.Point(18, 42),
        },
        zIndex: isEndpoint ? 20 : 10,
      })

      const svPreviewUrl = `/api/streetview?lat=${stop.position.lat}&lng=${stop.position.lng}&size=320x140`

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="background:#1a1a1a;color:#f0f0f0;border-radius:8px;overflow:hidden;min-width:240px;max-width:280px;font-family:system-ui,sans-serif;">
            <div style="position:relative;height:120px;background:#111;overflow:hidden;">
              <img src="${svPreviewUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<div style=\\'height:120px;display:flex;align-items:center;justify-content:center;color:#555;font-size:12px;\\'>No preview available</div>'" />
              <div style="position:absolute;top:8px;left:8px;background:#CC0000;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${stop.label}</div>
            </div>
            <div style="padding:10px 12px;">
              <p style="margin:0 0 3px;font-weight:600;font-size:13px;line-height:1.3;">${stop.name}</p>
              <p style="margin:0;font-size:11px;color:#888;line-height:1.4;">${stop.address}</p>
              ${stop.type !== 'Start' && stop.type !== 'End' ? `<span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;background:#2a2a2a;font-size:10px;color:#aaa;text-transform:capitalize;">${stop.type}</span>` : ''}
            </div>
          </div>
        `)
        infoWindow.open(map, marker)
      })

      return marker
    })

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindow.close()
    }
  }, [map, directions?.legs, plan])

  return null
}

function MapTypeController({ mapType }: { mapType: string }) {
  const map = useMap()
  useEffect(() => {
    if (map) map.setMapTypeId(mapType)
  }, [map, mapType])
  return null
}

interface Props {
  plan: TripPlan | null
  directions: DirectionsResult | null
  isLoading: boolean
}

export function RouteMap({ plan, directions, isLoading }: Props) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  return (
    <div className="w-full h-full relative">
      <Map
        defaultZoom={4}
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={true}
        styles={mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
        className="w-full h-full"
      >
        <MapTypeController mapType={mapType} />
        <MapOverlays plan={plan} directions={directions} />
      </Map>

      {/* Map type toggle */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={() => setMapType(t => (t === 'roadmap' ? 'satellite' : 'roadmap'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 text-white text-xs font-medium hover:bg-black/90 transition-colors shadow-lg"
        >
          {mapType === 'roadmap' ? (
            <><Layers className="w-3.5 h-3.5" /> Satellite</>
          ) : (
            <><MapIcon className="w-3.5 h-3.5" /> Road</>
          )}
        </button>
      </div>

      {/* Directions loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#CC0000] border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Calculating route…</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!plan && !isLoading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-sm text-muted-foreground whitespace-nowrap">
            Enter your trip to see the route
          </div>
        </div>
      )}
    </div>
  )
}
