'use client'
import { useEffect, useRef, useState } from 'react'
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Layers, Map as MapIcon } from 'lucide-react'
import type { TripPlan, DirectionsResult } from '@/lib/types'

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

const TESLA_BLUE = '#4DA6FF'

function buildInfoWindowContent(stop: {
  label: string; name: string; address: string; type: string; reason?: string
}) {
  const isEndpoint = stop.type === 'Start' || stop.type === 'End'
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`

  return `
    <div style="color:#111215;min-width:200px;max-width:260px;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                padding:2px 0 4px;">
      <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
        <div style="background:${TESLA_BLUE};color:#000;border-radius:50%;
                    width:24px;height:24px;min-width:24px;
                    display:flex;align-items:center;justify-content:center;
                    font-weight:700;font-size:11px;margin-top:1px;">
          ${stop.label}
        </div>
        <div style="min-width:0;flex:1;">
          <p style="margin:0 0 3px;font-weight:600;font-size:14px;line-height:1.3;color:#111215;">
            ${stop.name}
          </p>
          ${isEndpoint
            ? `<span style="font-size:12px;color:#6b7280;">${stop.type}</span>`
            : `<span style="display:inline-block;padding:1px 8px;border-radius:99px;
                            background:rgba(77,166,255,0.12);font-size:11px;color:${TESLA_BLUE};
                            border:1px solid rgba(77,166,255,0.3);text-transform:capitalize;">
                 ${stop.type}
               </span>`
          }
        </div>
      </div>
      <p style="margin:0 0 6px;font-size:12px;color:#6b7280;line-height:1.4;">
        ${stop.address}
      </p>
      ${stop.reason
        ? `<p style="margin:0 0 10px;font-size:12px;color:#374151;line-height:1.4;">${stop.reason}</p>`
        : '<div style="margin-bottom:8px;"></div>'
      }
      <a href="${mapsLink}" target="_blank" rel="noopener noreferrer"
         style="color:${TESLA_BLUE};font-size:13px;text-decoration:none;font-weight:600;">
        Open in Maps →
      </a>
    </div>`
}

interface MapOverlaysProps {
  plan: TripPlan | null
  directions: DirectionsResult | null
  highlightedStop: number | null
  onHighlightClear: () => void
}

function MapOverlays({ plan, directions, highlightedStop, onHighlightClear }: MapOverlaysProps) {
  const map = useMap()
  const geometryLib = useMapsLibrary('geometry')
  const markersRef = useRef<google.maps.Marker[]>([])
  const casingRef = useRef<google.maps.Polyline | null>(null)
  const lineRef = useRef<google.maps.Polyline | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const animFrameRef = useRef<number>(0)
  const allStopsRef = useRef<Array<{ position: google.maps.LatLng | google.maps.LatLngLiteral; infoContent: string }>>([])

  useEffect(() => {
    if (!map || !geometryLib || !directions?.overview_polyline) return

    cancelAnimationFrame(animFrameRef.current)
    casingRef.current?.setMap(null)
    lineRef.current?.setMap(null)

    const fullPath = geometryLib.encoding.decodePath(directions.overview_polyline)

    const casing = new google.maps.Polyline({
      strokeColor: 'rgba(0,0,0,0.4)',
      strokeOpacity: 1,
      strokeWeight: 9,
      geodesic: true,
      zIndex: 1,
      map,
    })
    const line = new google.maps.Polyline({
      strokeColor: TESLA_BLUE,
      strokeOpacity: 1,
      strokeWeight: 5,
      geodesic: true,
      zIndex: 2,
      map,
    })
    casingRef.current = casing
    lineRef.current = line

    const DURATION = 1400
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const slice = fullPath.slice(0, Math.max(2, Math.round(eased * fullPath.length)))
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
      casingRef.current?.setMap(null)
      lineRef.current?.setMap(null)
      casingRef.current = null
      lineRef.current = null
    }
  }, [map, geometryLib, directions?.overview_polyline])

  useEffect(() => {
    if (!map || !directions?.legs.length || !plan) return

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    infoWindowRef.current?.close()

    const infoWindow = new google.maps.InfoWindow({ disableAutoPan: false })
    infoWindowRef.current = infoWindow

    const legs = directions.legs
    const stopsData = [
      {
        label: 'A', name: plan.origin.name, address: plan.origin.address,
        type: 'Start', reason: undefined,
        position: legs[0].start_location,
      },
      ...legs.slice(0, -1).map((leg, i) => ({
        label: String.fromCharCode(66 + i),
        name: plan.waypoints[i]?.name ?? leg.end_address,
        address: plan.waypoints[i]?.address ?? leg.end_address,
        type: plan.waypoints[i]?.type ?? 'stop',
        reason: plan.waypoints[i]?.reason,
        position: leg.end_location,
      })),
      {
        label: String.fromCharCode(65 + legs.length),
        name: plan.destination.name, address: plan.destination.address,
        type: 'End', reason: undefined,
        position: legs[legs.length - 1].end_location,
      },
    ]

    allStopsRef.current = stopsData.map(s => ({
      position: s.position,
      infoContent: buildInfoWindowContent(s),
    }))

    map.addListener('click', () => {
      infoWindow.close()
      onHighlightClear()
    })

    markersRef.current = stopsData.map((stop, idx) => {
      const isEndpoint = stop.type === 'Start' || stop.type === 'End'
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <filter id="ds"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.6)"/></filter>
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z"
          fill="${TESLA_BLUE}" filter="url(#ds)"/>
        <circle cx="16" cy="15.5" r="10" fill="${isEndpoint ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)'}"/>
        <text x="16" y="20" text-anchor="middle" fill="#000"
          font-family="-apple-system,sans-serif" font-size="12" font-weight="700">${stop.label}</text>
      </svg>`

      const marker = new google.maps.Marker({
        position: stop.position,
        map,
        title: stop.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(32, 42),
          anchor: new google.maps.Point(16, 42),
        },
        zIndex: isEndpoint ? 20 : 10,
      })

      marker.addListener('click', () => {
        infoWindow.setContent(allStopsRef.current[idx].infoContent)
        infoWindow.open(map, marker)
      })

      return marker
    })

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      infoWindow.close()
      google.maps.event.clearListeners(map, 'click')
    }
  }, [map, directions?.legs, plan, onHighlightClear])

  useEffect(() => {
    if (highlightedStop == null || !map) return
    const marker = markersRef.current[highlightedStop]
    const stopData = allStopsRef.current[highlightedStop]
    if (marker && stopData && infoWindowRef.current) {
      infoWindowRef.current.setContent(stopData.infoContent)
      infoWindowRef.current.open(map, marker)
      map.panTo(marker.getPosition()!)
    }
  }, [highlightedStop, map])

  return null
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
  onHighlightClear: () => void
}

export function RouteMap({ plan, directions, isLoading, highlightedStop, onHighlightClear }: Props) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  return (
    <div className="w-full h-full relative">
      <Map
        defaultZoom={4}
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoomControl={true}
        styles={mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
        className="w-full h-full"
      >
        <MapTypeController mapType={mapType} />
        <MapOverlays
          plan={plan}
          directions={directions}
          highlightedStop={highlightedStop}
          onHighlightClear={onHighlightClear}
        />
      </Map>

      {/* Map type toggle — top right, clear of the left panel */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111215]/90 text-white/70 text-sm font-medium hover:bg-[#1A1B1F]/90 hover:text-white transition-colors shadow-float backdrop-blur-sm border border-white/10"
        >
          {mapType === 'roadmap'
            ? <><Layers className="w-4 h-4" /> Satellite</>
            : <><MapIcon className="w-4 h-4" /> Map</>
          }
        </button>
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
