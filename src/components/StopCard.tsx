'use client'
import { Badge } from '@/components/ui/badge'
import { Utensils, Zap, Camera, Coffee, Star, MapPin, ChevronRight } from 'lucide-react'
import type { TripStop, TripEndpoint, RouteLeg } from '@/lib/types'

type StopInfo = TripStop | (TripEndpoint & { type?: undefined; reason?: undefined; detour_minutes?: undefined })

const STOP_CONFIG = {
  food:       { icon: Utensils, label: 'Food',       className: 'bg-orange-50 text-orange-700 border-orange-200' },
  charging:   { icon: Zap,      label: 'Charging',   className: 'bg-green-50  text-green-700  border-green-200'  },
  scenic:     { icon: Camera,   label: 'Scenic',     className: 'bg-blue-50   text-blue-700   border-blue-200'   },
  rest:       { icon: Coffee,   label: 'Rest',       className: 'bg-purple-50 text-purple-700 border-purple-200' },
  attraction: { icon: Star,     label: 'Attraction', className: 'bg-amber-50  text-amber-700  border-amber-200'  },
  endpoint:   { icon: MapPin,   label: '',           className: 'bg-blue-50   text-[#1a73e8]  border-blue-200'   },
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
      {/* Timeline column — blue to match the route line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-7 h-7 rounded-full bg-[#1a73e8] flex items-center justify-center text-xs font-semibold text-white z-10 shrink-0 ring-4 ring-[#1a73e8]/10 group-hover:ring-[#1a73e8]/25 transition-all">
          {label}
        </div>
        {!isLast && (
          <div className="w-[3px] flex-1 bg-[#1a73e8]/30 my-1 min-h-[20px] rounded-full" />
        )}
      </div>

      {/* Card content */}
      <div
        className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 transition-colors cursor-default
          ${isLast ? '' : 'mb-2'}
          group-hover:bg-[#f1f3f4]`}
      >
        {/* Top row: name + badge */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate text-[#202124]">{stop.name}</p>
            <p className="text-[12px] text-[#5f6368] mt-0.5 leading-snug line-clamp-1">
              {stop.address}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {detourMins != null && detourMins > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368]">
                +{detourMins}m
              </span>
            )}
            {isEndpoint ? (
              <Badge className={`text-[10px] px-2 border font-medium ${config.className}`}>
                {index === 0 ? 'Start' : 'End'}
              </Badge>
            ) : (
              <Badge className={`text-[10px] px-2 border font-medium ${config.className} flex items-center gap-1`}>
                <Icon className="w-2.5 h-2.5" />
                {config.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Reason */}
        {reason && (
          <p className="text-[13px] text-[#3c4043] mt-1.5 leading-snug">{reason}</p>
        )}

        {/* Leg stats + preview button */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#e8eaed]">
          {legAfter ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 text-[12px] text-[#5f6368]">
              <span className="font-medium text-[#202124]">{legAfter.distance.text}</span>
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
              className="flex items-center gap-0.5 text-[12px] font-medium text-[#1a73e8] hover:text-[#1765cc] transition-colors ml-2 shrink-0"
            >
              View
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
