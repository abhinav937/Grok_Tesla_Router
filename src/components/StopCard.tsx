'use client'
import { Badge } from '@/components/ui/badge'
import { Utensils, Zap, Camera, Coffee, Star, MapPin, Eye } from 'lucide-react'
import type { TripStop, TripEndpoint, RouteLeg } from '@/lib/types'

type StopInfo = TripStop | (TripEndpoint & { type?: undefined; reason?: undefined; detour_minutes?: undefined })

const STOP_CONFIG = {
  food:       { icon: Utensils, label: 'Food',       className: 'bg-orange-950 text-orange-300 border-orange-800' },
  charging:   { icon: Zap,      label: 'Charging',   className: 'bg-green-950  text-green-300  border-green-800'  },
  scenic:     { icon: Camera,   label: 'Scenic',     className: 'bg-blue-950   text-blue-300   border-blue-800'   },
  rest:       { icon: Coffee,   label: 'Rest',       className: 'bg-purple-950 text-purple-300 border-purple-800' },
  attraction: { icon: Star,     label: 'Attraction', className: 'bg-yellow-950 text-yellow-300 border-yellow-800' },
  endpoint:   { icon: MapPin,   label: '',           className: 'bg-[#CC0000]/20 text-[#CC0000] border-[#CC0000]/30' },
} as const

interface Props {
  index: number
  stop: StopInfo
  legAfter: RouteLeg | null
  isLast: boolean
  onPreviewClick?: () => void
}

export function StopCard({ index, stop, legAfter, isLast, onPreviewClick }: Props) {
  const stopType = (stop as TripStop).type
  const config = stopType ? STOP_CONFIG[stopType] : STOP_CONFIG.endpoint
  const Icon = config.icon
  const label = String.fromCharCode(65 + Math.min(index, 25))
  const isEndpoint = !stopType
  const reason = (stop as TripStop).reason
  const detourMins = (stop as TripStop).detour_minutes

  return (
    <div className="relative flex gap-3 group">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-xs font-bold text-white z-10 shrink-0 ring-2 ring-[#CC0000]/20 group-hover:ring-[#CC0000]/50 transition-all">
          {label}
        </div>
        {!isLast && (
          <div className="w-[2px] flex-1 bg-gradient-to-b from-[#CC0000]/40 to-border my-1 min-h-[20px]" />
        )}
      </div>

      {/* Card content */}
      <div
        className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 mb-1 transition-colors cursor-default
          ${isLast ? '' : 'mb-2'}
          group-hover:bg-secondary/60`}
      >
        {/* Top row: name + badge */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{stop.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-1">
              {stop.address}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {detourMins != null && detourMins > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                +{detourMins}m
              </span>
            )}
            {isEndpoint ? (
              <Badge className={`text-[10px] px-2 border ${config.className}`}>
                {index === 0 ? 'Start' : 'End'}
              </Badge>
            ) : (
              <Badge className={`text-[10px] px-2 border ${config.className} flex items-center gap-1`}>
                <Icon className="w-2.5 h-2.5" />
                {config.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Reason — prominent */}
        {reason && (
          <p className="text-xs text-foreground/70 mt-1.5 leading-snug">{reason}</p>
        )}

        {/* Leg stats + preview button */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40">
          {legAfter ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/80">{legAfter.distance.text}</span>
              <span>·</span>
              <span>{legAfter.duration.text}</span>
              {legAfter.summary && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[120px]">via {legAfter.summary}</span>
                </>
              )}
            </div>
          ) : (
            <span />
          )}

          {onPreviewClick && (
            <button
              type="button"
              onClick={onPreviewClick}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-[#CC0000] transition-colors ml-2 shrink-0"
            >
              <Eye className="w-3 h-3" />
              Map
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
