'use client'
import { useEffect, useRef, useState } from 'react'
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { Layers, Map as MapIcon } from 'lucide-react'
import type { TripPlan, DirectionsResult } from '@/lib/types'

// Light Google-style map: keep native colors, hide POI/transit clutter
const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

const ROUTE_BLUE = '#1a73e8'
const PIN_RED = '#ea4335'

function buildInfoWindowContent(stop: {
  label: string; name: string; address: string; type: string; reason?: string
}) {
  const isEndpoint = stop.type === 'Start' || stop.type === 'End'
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`

  return `
    <div style="color:#202124;min-width:220px;max-width:280px;
                font-family:Roboto,Arial,sans-serif;padding:2px 4px 4px;">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:6px;">
        <div style="background:${PIN_RED};color:white;border-radius:50%;
                    width:26px;height:26px;min-width:26px;
                    display:flex;align-items:center;justify-content:center;
                    font-weight:600;font-size:13px;margin-top:1px;">
          ${stop.label}
        </div>
        <div style="min-width:0;flex:1;">
          <p style="margin:0 0 3px;font-weight:500;font-size:15px;line-height:1.3;color:#202124;">
            ${stop.name}
          </p>
          ${isEndpoint
            ? `<span style="font-size:12px;color:#5f6368;">${stop.type}</span>`
            : `<span style="display:inline-block;padding:1px 8px;border-radius:99px;
                            background:#f1f3f4;font-size:11px;color:#5f6368;
                            text-transform:capitalize;">
                 ${stop.type}
               </span>`
          }
        </div>
      </div>
      <p style="margin:0 0 6px;font-size:13px;color:#5f6368;line-height:1.4;">
        ${stop.address}
      </p>
      ${stop.reason
        ? `<p style="margin:0 0 10px;font-size:13px;color:#3c4043;line-height:1.4;">
             ${stop.reason}
           </p>`
        : '<div style="margin-bottom:8px;"></div>'
      }
      <a href="${mapsLink}" target="_blank" rel="noopener noreferrer"
         style="color:${ROUTE_BLUE};font-size:13px;text-decoration:none;font-weight:500;">
        Directions
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

  // Animated route: white casing under a Google-blue line
  useEffect(() => {
    if (!map || !geometryLib || !directions?.overview_polyline) return

    cancelAnimationFrame(animFrameRef.current)
    casingRef.current?.setMap(null)
    lineRef.current?.setMap(null)

    const fullPath = geometryLib.encoding.decodePath(directions.overview_polyline)

    const casing = new google.maps.Polyline({
      strokeColor: '#ffffff',
      strokeOpacity: 1,
      strokeWeight: 9,
      geodesic: true,
      zIndex: 1,
      map,
    })
    const line = new google.maps.Polyline({
      strokeColor: ROUTE_BLUE,
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
    map.fitBounds(bounds, { top: 80, right: 60, bottom: 80, left: 60 })

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      casingRef.current?.setMap(null)
      lineRef.current?.setMap(null)
      casingRef.current = null
      lineRef.current = null
    }
  }, [map, geometryLib, directions?.overview_polyline])

  // Markers + info windows
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
      // Classic Google red teardrop pin with a white letter
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)"/></filter>
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z"
          fill="${PIN_RED}" filter="url(#s)"/>
        <circle cx="16" cy="15.5" r="11" fill="${isEndpoint ? '#c5221f' : 'rgba(0,0,0,0.12)'}"/>
        <text x="16" y="20" text-anchor="middle" fill="white"
          font-family="Roboto,Arial,sans-serif" font-size="13" font-weight="600">${stop.label}</text>
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

  // Trigger info window from sidebar "Map" button
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
        disableDefaultUI={false}
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={true}
        styles={mapType === 'roadmap' ? LIGHT_MAP_STYLES : undefined}
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

      {/* Map type toggle — Google control style */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#3c4043] text-sm font-medium hover:bg-gray-50 transition-colors shadow-google"
        >
          {mapType === 'roadmap'
            ? <><Layers className="w-4 h-4 text-[#5f6368]" /> Satellite</>
            : <><MapIcon className="w-4 h-4 text-[#5f6368]" /> Map</>
          }
        </button>
      </div>

      {/* Route calculating overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 px-5 py-4 rounded-xl bg-white shadow-google-lg">
            <div className="w-9 h-9 rounded-full border-[3px] border-[#1a73e8] border-t-transparent animate-spin" />
            <p className="text-sm text-[#5f6368]">Calculating route…</p>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!plan && !isLoading && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-4 py-2.5 rounded-full bg-white shadow-google text-sm text-[#5f6368] whitespace-nowrap">
            Enter your trip to see the route
          </div>
        </div>
      )}
    </div>
  )
}
