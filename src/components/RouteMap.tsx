'use client'
import { useEffect, useRef } from 'react'
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import type { TripPlan, DirectionsResult } from '@/lib/types'

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
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

  // Draw polyline
  useEffect(() => {
    if (!map || !geometryLib || !directions?.overview_polyline) return

    const path = geometryLib.encoding.decodePath(directions.overview_polyline)

    if (polylineRef.current) {
      polylineRef.current.setMap(null)
    }

    polylineRef.current = new google.maps.Polyline({
      path,
      strokeColor: '#CC0000',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
    })

    const bounds = new google.maps.LatLngBounds()
    path.forEach(p => bounds.extend(p))
    map.fitBounds(bounds, { top: 60, right: 40, bottom: 60, left: 40 })

    return () => {
      polylineRef.current?.setMap(null)
      polylineRef.current = null
    }
  }, [map, geometryLib, directions?.overview_polyline])

  // Draw markers
  useEffect(() => {
    if (!map || !directions?.legs.length || !plan) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const legs = directions.legs
    const stops = [
      { label: 'A', name: plan.origin.name, position: legs[0].start_location },
      ...legs.slice(0, -1).map((leg, i) => ({
        label: String.fromCharCode(66 + i),
        name: plan.waypoints[i]?.name ?? leg.end_address,
        position: leg.end_location,
      })),
      {
        label: String.fromCharCode(65 + legs.length),
        name: plan.destination.name,
        position: legs[legs.length - 1].end_location,
      },
    ]

    markersRef.current = stops.map(stop => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="36" viewBox="0 0 32 36">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 20 16 20s16-8 16-20C32 7.16 24.84 0 16 0z" fill="#CC0000"/>
          <circle cx="16" cy="15" r="10" fill="#990000"/>
          <text x="16" y="19.5" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="11" font-weight="bold">${stop.label}</text>
        </svg>`

      return new google.maps.Marker({
        position: stop.position,
        map,
        title: stop.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(32, 36),
          anchor: new google.maps.Point(16, 36),
        },
        zIndex: 10,
      })
    })

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
    }
  }, [map, directions?.legs, plan])

  return null
}

interface Props {
  plan: TripPlan | null
  directions: DirectionsResult | null
  isLoading: boolean
}

export function RouteMap({ plan, directions, isLoading }: Props) {
  return (
    <div className="w-full h-full relative">
      <Map
        defaultZoom={4}
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        gestureHandling="greedy"
        disableDefaultUI={false}
        styles={DARK_MAP_STYLES}
        mapId={undefined}
        className="w-full h-full"
      >
        <MapOverlays plan={plan} directions={directions} />
      </Map>

      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#CC0000] border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Calculating route…</p>
          </div>
        </div>
      )}

      {!plan && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Enter your trip details to see the route</p>
          </div>
        </div>
      )}
    </div>
  )
}
