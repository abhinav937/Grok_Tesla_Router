'use client'
import { useState } from 'react'
import { Utensils, Zap, Camera, Coffee, Star, MapPin, Navigation2 } from 'lucide-react'
import type { TripStop, TripEndpoint, RouteLeg } from '@/lib/types'

type StopInfo = TripStop | (TripEndpoint & { type?: undefined; reason?: undefined; detour_minutes?: undefined })

const STOP_CONFIG = {
  food:       { icon: Utensils, label: 'Food',       color: '#FB923C' },
  charging:   { icon: Zap,      label: 'Charging',   color: '#4ADE80' },
  scenic:     { icon: Camera,   label: 'Scenic',     color: '#38BDF8' },
  rest:       { icon: Coffee,   label: 'Rest',       color: '#A78BFA' },
  attraction: { icon: Star,     label: 'Attraction', color: '#FBBF24' },
  endpoint:   { icon: MapPin,   label: '',           color: '#4DA6FF' },
} as const

interface Props {
  index: number
  stop: StopInfo
  legAfter: RouteLeg | null
  isLast: boolean
  location?: { lat: number; lng: number }
  onPreviewClick?: () => void
}

export function StopCard({ index, stop, legAfter, isLast, location, onPreviewClick }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const stopType = (stop as TripStop).type
  const config = stopType ? STOP_CONFIG[stopType] : STOP_CONFIG.endpoint
  const Icon = config.icon
  const label = String.fromCharCode(65 + Math.min(index, 25))
  const isEndpoint = !stopType
  const reason = (stop as TripStop).reason
  const detourMins = (stop as TripStop).detour_minutes

  const streetViewUrl = location
    ? `/api/streetview?lat=${location.lat}&lng=${location.lng}&size=420x160`
    : null

  const showPhoto = streetViewUrl && !imgError

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#1A1B1F]">
      {/* Street View photo */}
      {showPhoto && (
        <div className="w-full h-36 bg-[#111215] relative overflow-hidden">
          <img
            src={streetViewUrl}
            alt={stop.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111215]">
              <div className="w-5 h-5 rounded-full border-2 border-[#4DA6FF]/20 border-t-[#4DA6FF]/60 animate-spin" />
            </div>
          )}
          {/* Label overlay on photo */}
          <div
            className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-lg"
            style={{ background: config.color, color: '#000' }}
          >
            {label}
          </div>
          {/* Gradient fade at bottom for readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#1A1B1F] to-transparent" />
        </div>
      )}

      {/* Card content */}
      <div className="px-3.5 pt-3 pb-3">
        {/* No photo: show label inline */}
        {!showPhoto && (
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
              style={{ background: config.color, color: '#000' }}
            >
              {label}
            </div>
          </div>
        )}

        {/* Name + badge row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white leading-snug">{stop.name}</p>
            <p className="text-[11px] text-white/35 mt-0.5 leading-snug line-clamp-1">{stop.address}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {detourMins != null && detourMins > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/35">
                +{detourMins}m
              </span>
            )}
            <span
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: config.color,
                background: `${config.color}18`,
                border: `1px solid ${config.color}30`,
              }}
            >
              <Icon className="w-2.5 h-2.5" />
              {isEndpoint ? (index === 0 ? 'Start' : 'End') : config.label}
            </span>
          </div>
        </div>

        {reason && (
          <p className="text-[12px] text-white/50 mt-2 leading-relaxed">{reason}</p>
        )}

        {legAfter && (
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[12px] text-white/35 flex-wrap">
              <span className="font-semibold text-white/60">{legAfter.distance.text}</span>
              <span>·</span>
              <span>{legAfter.duration.text}</span>
              {legAfter.summary && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[110px]">via {legAfter.summary}</span>
                </>
              )}
            </div>

            {onPreviewClick && (
              <button
                type="button"
                onClick={onPreviewClick}
                className="flex items-center gap-1 text-[12px] font-medium text-[#4DA6FF] hover:text-[#2B7FDB] transition-colors shrink-0"
              >
                <Navigation2 className="w-3 h-3" />
                Map
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
