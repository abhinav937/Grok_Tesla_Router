'use client'
import { useState } from 'react'
import { Utensils, Zap, Camera, Coffee, Star, MapPin, Navigation2 } from 'lucide-react'
import type { TripStop, TripEndpoint, RouteLeg } from '@/lib/types'

type StopInfo = TripStop | (TripEndpoint & { type?: undefined; reason?: undefined; detour_minutes?: undefined })

const STOP_META: Record<string, { icon: any; label: string; color: string }> = {
  food:       { icon: Utensils, label: 'Food',       color: '#FF9F43' },
  charging:   { icon: Zap,      label: 'Charging',   color: '#7CF35E' },
  scenic:     { icon: Camera,   label: 'Scenic',     color: '#4FA8FF' },
  rest:       { icon: Coffee,   label: 'Rest',       color: '#B79CFF' },
  attraction: { icon: Star,     label: 'Attraction', color: '#FFD25A' },
  endpoint:   { icon: MapPin,   label: '',           color: '#3CE0C4' },
}

interface Props {
  index: number
  stop: StopInfo
  legAfter: RouteLeg | null
  isLast: boolean
  location?: { lat: number; lng: number }
  onPreviewClick?: () => void
  onHover?: (index: number | null) => void
  isHighlighted?: boolean
  cumulativeDistance?: string
  cumulativeDuration?: string
}

export function StopCard({
  index,
  stop,
  legAfter,
  isLast,
  location,
  onPreviewClick,
  onHover,
  isHighlighted,
  cumulativeDistance,
  cumulativeDuration,
}: Props) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const stopType = (stop as TripStop).type as string | undefined
  const meta = stopType ? STOP_META[stopType] : STOP_META.endpoint
  const color = meta.color
  const Icon = meta.icon
  const label = String.fromCharCode(65 + Math.min(index, 25))
  const isEndpoint = !stopType
  const reason = (stop as TripStop).reason
  const detourMins = (stop as TripStop).detour_minutes

  const streetViewUrl = location
    ? `/api/streetview?lat=${location.lat}&lng=${location.lng}&size=560x280`
    : null

  const showPhoto = streetViewUrl && !imgError

  const handleMouseEnter = () => onHover?.(index)
  const handleMouseLeave = () => onHover?.(null)

  // Simple seed for fallback picsum (or use real Street View)
  const seed = (stop as any).name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'stop' + index

  return (
    <div
      className={`stop-card ${isHighlighted ? 'is-hot' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Photo header with grain + scrim (design system) */}
      <div className="stop-photo">
        {showPhoto ? (
          <img
            src={streetViewUrl!}
            alt={stop.name}
            className={imgLoaded ? 'loaded' : ''}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="stop-photo-fallback"
            style={{ background: `linear-gradient(150deg, ${color}26, var(--surface-card) 72%)` }}
          />
        )}

        {!imgLoaded && showPhoto && (
          <div className="stop-photo-spin">
            <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
          </div>
        )}

        <div className="stop-photo-scrim" />
        <div className="stop-grain" />

        {/* Letter badge */}
        <span className="stop-badge" style={{ background: color }}>{label}</span>

        {/* Type chip */}
        <span
          className="stop-chip"
          style={{ color, background: `${color}22`, borderColor: `${color}44` }}
        >
          <Icon className="w-2.5 h-2.5" />
          {isEndpoint ? (index === 0 ? 'Start' : 'End') : meta.label}
        </span>

        {/* Detour */}
        {detourMins != null && detourMins > 0 && (
          <span className="stop-detour mono">+{detourMins}m</span>
        )}
      </div>

      {/* Body */}
      <div className="stop-body">
        <div className="stop-name">{stop.name}</div>
        <div className="stop-region">{stop.address}</div>

        {reason && <p className="stop-reason">{reason}</p>}

        {legAfter && (
          <div className="stop-leg">
            <div className="stop-leg-stats mono">
              <span className="leg-strong">{legAfter.distance.text}</span>
              <span className="leg-sep">·</span>
              <span>{legAfter.duration.text}</span>
              {legAfter.summary && (
                <>
                  <span className="leg-sep">·</span>
                  <span className="leg-via">{legAfter.summary}</span>
                </>
              )}
            </div>

            {onPreviewClick && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPreviewClick(); }}
                className="stop-map-btn"
              >
                <Navigation2 className="w-3 h-3" /> Map
              </button>
            )}
          </div>
        )}

        {/* Cumulatives (subtle) */}
        {(cumulativeDistance || cumulativeDuration) && (
          <div className="text-[10px] text-white/25 tabular-nums mt-1 mono">
            from start: {cumulativeDistance} {cumulativeDuration ? `· ${cumulativeDuration}` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
