'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  CollisionBehavior,
} from '@vis.gl/react-google-maps'
import { Layers, Map as MapIcon } from 'lucide-react'
import type { TripPlan, DirectionsResult, StopType } from '@/lib/types'

// Map ID is required for Advanced Markers (latest recommended API) and vector/cloud styling.
// Create one in Google Cloud Console → Maps Platform → Map IDs.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined

if (typeof window !== 'undefined' && !MAP_ID) {
  // eslint-disable-next-line no-console
  console.warn('[RouteMap] NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID is not set. Advanced Markers and modern map styling require a Map ID. See README for setup.')
}

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2330' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2330' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2d3748' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#374151' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4b5563' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#d1d5db' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#6b7280' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1923' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
]

const ACCENT = 'var(--accent)'

const STOP_COLORS: Record<StopType | 'endpoint', string> = {
  food: 'var(--stop-food)',
  charging: 'var(--stop-charging)',
  scenic: 'var(--stop-scenic)',
  rest: 'var(--stop-rest)',
  attraction: 'var(--stop-attraction)',
  endpoint: ACCENT,
}

interface RoutePolylinesProps {
  directions: DirectionsResult | null
}

function RoutePolylines({ directions }: RoutePolylinesProps) {
  const map = useMap()
  const geometryLib = useMapsLibrary('geometry')
  const casingRef = useRef<google.maps.Polyline | null>(null)
  const lineRef = useRef<google.maps.Polyline | null>(null)
  const glowRef = useRef<google.maps.Polyline | null>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!map || !geometryLib || !directions?.overview_polyline) return

    cancelAnimationFrame(animFrameRef.current)
    casingRef.current?.setMap(null)
    lineRef.current?.setMap(null)
    glowRef.current?.setMap(null)

    const fullPath = geometryLib.encoding.decodePath(directions.overview_polyline)

    // Subtle outer glow for premium Tesla feel
    const glow = new google.maps.Polyline({
      strokeColor: '#3CE0C4',
      strokeOpacity: 0.18,
      strokeWeight: 13,
      geodesic: true,
      zIndex: 0,
      map,
    })
    // Dark casing
    const casing = new google.maps.Polyline({
      strokeColor: 'rgba(0,0,0,0.55)',
      strokeOpacity: 1,
      strokeWeight: 9,
      geodesic: true,
      zIndex: 1,
      map,
    })
    // Main Tesla blue line
    const line = new google.maps.Polyline({
      strokeColor: '#3CE0C4',
      strokeOpacity: 1,
      strokeWeight: 5,
      geodesic: true,
      zIndex: 2,
      map,
    })

    glowRef.current = glow
    casingRef.current = casing
    lineRef.current = line

    const DURATION = 1350
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3.0)
      const slice = fullPath.slice(0, Math.max(2, Math.round(eased * fullPath.length)))
      glow.setPath(slice)
      casing.setPath(slice)
      line.setPath(slice)
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    const bounds = new google.maps.LatLngBounds()
    fullPath.forEach(p => bounds.extend(p))
    map.fitBounds(bounds, { top: 80, right: 60, bottom: 80, left: 460 })

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      glowRef.current?.setMap(null)
      casingRef.current?.setMap(null)
      lineRef.current?.setMap(null)
      glowRef.current = null
      casingRef.current = null
      lineRef.current = null
    }
  }, [map, geometryLib, directions?.overview_polyline])

  return null
}

interface RouteMarkersProps {
  plan: TripPlan | null
  directions: DirectionsResult | null
  highlightedStop: number | null
  onHighlight: (index: number | null) => void
}

function RouteMarkers({ plan, directions, highlightedStop, onHighlight }: RouteMarkersProps) {
  const legs = directions?.legs ?? []
  if (!plan || legs.length === 0) return null

  // Build ordered stops (A = origin, B... = waypoints, last = destination)
  const stops = [
    {
      index: 0,
      label: 'A',
      name: plan.origin.name,
      address: plan.origin.address,
      type: 'endpoint' as const,
      reason: undefined as string | undefined,
      position: legs[0].start_location,
      color: STOP_COLORS.endpoint,
    },
    ...legs.slice(0, -1).map((leg, i) => {
      const wp = plan.waypoints[i]
      const t = (wp?.type ?? 'attraction') as StopType
      return {
        index: i + 1,
        label: String.fromCharCode(66 + i),
        name: wp?.name ?? leg.end_address,
        address: wp?.address ?? leg.end_address,
        type: t,
        reason: wp?.reason,
        position: leg.end_location,
        color: STOP_COLORS[t] ?? STOP_COLORS.endpoint,
      }
    }),
    {
      index: legs.length,
      label: String.fromCharCode(65 + legs.length),
      name: plan.destination.name,
      address: plan.destination.address,
      type: 'endpoint' as const,
      reason: undefined as string | undefined,
      position: legs[legs.length - 1].end_location,
      color: STOP_COLORS.endpoint,
    },
  ]

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  // Sync external highlight (from sidebar) into local selected for InfoWindow
  useEffect(() => {
    if (highlightedStop != null) {
      setSelectedIdx(highlightedStop)
    }
  }, [highlightedStop])

  const selectedStop = selectedIdx != null ? stops[selectedIdx] : null

  const openInfoFor = (idx: number, marker?: google.maps.marker.AdvancedMarkerElement) => {
    setSelectedIdx(idx)
    onHighlight(idx)
    // If we have a marker ref we could anchor, but for simplicity we use position below
  }

  const closeInfo = () => {
    setSelectedIdx(null)
    onHighlight(null)
  }

  return (
    <>
      {stops.map((stop, idx) => {
        const isHighlighted = highlightedStop === idx
        const isEndpoint = stop.type === 'endpoint'

        return (
          <AdvancedMarker
            key={idx}
            position={stop.position}
            zIndex={isEndpoint ? 200 : isHighlighted ? 150 : 100}
            collisionBehavior={CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL}
            onClick={() => openInfoFor(idx)}
            title={stop.name}
          >
            {/* Custom numbered pin matching the sidebar letter badges */}
            <div
              className="flex items-center justify-center rounded-full text-[11px] font-bold shadow-md border border-black/30"
              style={{
                background: stop.color,
                color: '#000',
                width: isEndpoint || isHighlighted ? 28 : 24,
                height: isEndpoint || isHighlighted ? 28 : 24,
                transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 120ms ease-out',
              }}
            >
              {stop.label}
            </div>
          </AdvancedMarker>
        )
      })}

      {/* Nice declarative InfoWindow (dark themed, consistent with app) */}
      {selectedStop && (
        <InfoWindow
          position={selectedStop.position}
          onCloseClick={closeInfo}
          maxWidth={260}
        >
          <div className="text-[#111215] min-w-[200px] max-w-[260px] font-sans text-sm">
            <div className="flex items-start gap-2 mb-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: selectedStop.color, color: '#000' }}
              >
                {selectedStop.label}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[13px] leading-tight text-[#111215]">{selectedStop.name}</div>
                {! (selectedStop.type === 'endpoint') && (
                  <span
                    className="inline-block mt-0.5 text-[10px] px-1.5 py-px rounded-full capitalize"
                    style={{
                      background: `${selectedStop.color}22`,
                      color: selectedStop.color,
                      border: `1px solid ${selectedStop.color}55`,
                    }}
                  >
                    {selectedStop.type}
                  </span>
                )}
              </div>
            </div>

            <div className="text-[#6b7280] text-[11px] leading-snug mb-1.5">{selectedStop.address}</div>

            {selectedStop.reason && (
              <div className="text-[#374151] text-[11px] leading-snug mb-2">{selectedStop.reason}</div>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStop.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] text-[12px] font-semibold hover:underline"
            >
              Open in Maps →
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

function MapTypeController({ mapType }: { mapType: string }) {
  const map = useMap()
  useEffect(() => { if (map) map.setMapTypeId(mapType) }, [map, mapType])
  return null
}

interface Props {
  plan: TripPlan | null
  directions: DirectionsResult | null
  isLoading: boolean
  highlightedStop: number | null
  onHighlight: (index: number | null) => void
}

export function RouteMap({ plan, directions, isLoading, highlightedStop, onHighlight }: Props) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  return (
    <div className="w-full h-full relative">
      <Map
        defaultZoom={4}
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoomControl={true}
        mapId={MAP_ID}
        styles={mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
        className="w-full h-full"
      >
        <MapTypeController mapType={mapType} />
        <RoutePolylines directions={directions} />
        <RouteMarkers
          plan={plan}
          directions={directions}
          highlightedStop={highlightedStop}
          onHighlight={onHighlight}
        />
      </Map>

      <div className="map-controls">
        <button
          type="button"
          onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
          className={`mapctl ${mapType === 'satellite' ? 'on' : ''}`}
          title={mapType === 'roadmap' ? 'Switch to satellite' : 'Switch to map'}
          aria-label={mapType === 'roadmap' ? 'Switch to satellite view' : 'Switch to map view'}
        >
          {mapType === 'roadmap' ? <Layers className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
        </button>
      </div>

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ background: 'var(--surface-overlay)', backdropFilter: 'blur(2px)' }}
        >
          <div className="route-flash" style={{ position: 'relative', top: 0, left: 0, transform: 'none' }}>
            <div
              className="w-4 h-4 rounded-full border-2 animate-spin"
              style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'var(--accent)' }}
            />
            Calculating route…
          </div>
        </div>
      )}
    </div>
  )
}
