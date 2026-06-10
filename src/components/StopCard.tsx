'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Utensils, Zap, Camera, Coffee, Star, MapPin, ImageOff } from 'lucide-react'
import type { TripStop, TripEndpoint, RouteLeg } from '@/lib/types'

type StopInfo = TripStop | (TripEndpoint & { type?: undefined; reason?: undefined; detour_minutes?: undefined })

const STOP_CONFIG = {
  food: { icon: Utensils, label: 'Food', className: 'bg-orange-950 text-orange-300 border-orange-800' },
  charging: { icon: Zap, label: 'Charging', className: 'bg-green-950 text-green-300 border-green-800' },
  scenic: { icon: Camera, label: 'Scenic', className: 'bg-blue-950 text-blue-300 border-blue-800' },
  rest: { icon: Coffee, label: 'Rest', className: 'bg-purple-950 text-purple-300 border-purple-800' },
  attraction: { icon: Star, label: 'Attraction', className: 'bg-yellow-950 text-yellow-300 border-yellow-800' },
  endpoint: { icon: MapPin, label: '', className: 'bg-[#CC0000]/20 text-[#CC0000] border-[#CC0000]/30' },
} as const

function StreetView({ lat, lng }: { lat: number; lng: number }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const src = `/api/streetview?lat=${lat}&lng=${lng}&size=600x200`

  return (
    <div className="mt-2 rounded-md overflow-hidden bg-secondary aspect-[3/1] relative">
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-muted-foreground">
          <ImageOff className="w-4 h-4" />
          <span className="text-xs">No street view</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Street view"
        className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

interface Props {
  index: number
  stop: StopInfo
  legAfter: RouteLeg | null
  location: { lat: number; lng: number } | null
  isLast: boolean
}

export function StopCard({ index, stop, legAfter, location, isLast }: Props) {
  const stopType = (stop as TripStop).type
  const config = stopType ? STOP_CONFIG[stopType] : STOP_CONFIG.endpoint
  const Icon = config.icon
  const label = String.fromCharCode(65 + Math.min(index, 25))
  const isEndpoint = !stopType

  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-xs font-bold text-white z-10 shrink-0">
          {label}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{stop.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{stop.address}</p>
          </div>
          {isEndpoint ? (
            <Badge className={`text-xs shrink-0 border ${config.className}`}>
              {index === 0 ? 'Start' : 'End'}
            </Badge>
          ) : (
            <Badge className={`text-xs shrink-0 border ${config.className}`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          )}
        </div>

        {(stop as TripStop).reason && (
          <p className="text-xs text-muted-foreground italic mt-0.5 leading-snug">
            {(stop as TripStop).reason}
          </p>
        )}

        {(stop as TripStop).detour_minutes != null && (stop as TripStop).detour_minutes > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            +{(stop as TripStop).detour_minutes} min detour
          </p>
        )}

        {/* Street View preview */}
        {location && <StreetView lat={location.lat} lng={location.lng} />}

        {legAfter && (
          <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{legAfter.distance.text}</span>
            <span>·</span>
            <span>{legAfter.duration.text}</span>
            {legAfter.summary && (
              <>
                <span>·</span>
                <span className="truncate max-w-[140px]">via {legAfter.summary}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
