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

const ACCENT = '#3CE0C4' // design system electric cyan

const STOP_COLORS: Record<StopType | 'endpoint', string> = {
  food: '#FB923C',
  charging: '#4ADE80',
  scenic: '#38BDF8',
  rest: '#A78BFA',
  attraction: '#FBBF24',
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
      strokeColor: ACCENT,
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
      strokeColor: ACCENT,
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

      {/* Map type toggle + mini type legend */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
        <button
          onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tesla-panel/90 text-white/70 text-sm font-medium hover:bg-tesla-card/90 hover:text-white transition-colors shadow-float backdrop-blur-sm border border-white/10"
        >
          {mapType === 'roadmap'
            ? <><Layers className="w-4 h-4" /> Satellite</>
            : <><MapIcon className="w-4 h-4" /> Map</>
          }
        </button>

        {/* Tiny stop type legend (matches map pins + cards) */}
        <div className="hidden md:flex items-center gap-1 rounded-lg bg-tesla-panel/90 border border-white/10 px-2 py-1 text-[10px] text-white/50 backdrop-blur-sm shadow-float">
          {Object.entries(STOP_COLORS).filter(([k]) => k !== 'endpoint').map(([type, color]) => (
            <div key={type} className="flex items-center gap-1" title={type}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Route calculating overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-[#111215]/95 border border-white/10 shadow-float">
            <div className="w-9 h-9 rounded-full border-[3px] border-[#4DA6FF]/30 border-t-[#4DA6FF] animate-spin" />
            <p className="text-sm text-white/50">Calculating route…</p>
          </div>
        </div>
      )}
    </div>
  )
}
