'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StopCard } from './StopCard'
import { TeslaShareButton } from './TeslaShareButton'
import { ThinkingTrace } from './ThinkingTrace'
import { buildGoogleMapsUrl } from '@/lib/maps'
import type { TripPlan, DirectionsResult, TripPlanUsage, TripPlanToolCall } from '@/lib/types'
import { Clock, RouteIcon, Info } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface Props {
  plan: TripPlan | null
  thinking: string
  isThinking: boolean
  toolCall: TripPlanToolCall | null
  usage: TripPlanUsage | null
  directions: DirectionsResult | null
  isLoading: boolean
}

export function RouteSidebar({ plan, thinking, isThinking, toolCall, usage, directions, isLoading }: Props) {
  const showThinking = thinking || isThinking

  if (isLoading && !plan && !showThinking) {
    return (
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // Build stop list with locations from directions legs
  const allStops = plan
    ? [
        {
          stop: plan.origin,
          legAfter: directions?.legs[0] ?? null,
          location: directions?.legs[0]?.start_location ?? null,
        },
        ...plan.waypoints.map((wp, i) => ({
          stop: wp,
          legAfter: directions?.legs[i + 1] ?? null,
          location: directions?.legs[i]?.end_location ?? null,
        })),
        {
          stop: plan.destination,
          legAfter: null,
          location: directions?.legs[directions.legs.length - 1]?.end_location ?? null,
        },
      ]
    : []

  const mapsUrl = plan
    ? buildGoogleMapsUrl(
        plan.origin.address,
        plan.destination.address,
        plan.waypoints.map(w => w.address)
      )
    : ''

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 py-4 space-y-4">
        {/* Grok thinking trace */}
        {showThinking && (
          <ThinkingTrace
            thinking={thinking}
            isThinking={isThinking}
            toolCall={toolCall}
            usage={usage}
          />
        )}

        {plan && (
          <>
            {/* Trip summary stats */}
            {directions && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <RouteIcon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Distance</p>
                  <p className="text-base font-semibold">
                    {Math.round(directions.total_distance_meters / 1609.34).toLocaleString()} mi
                  </p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Drive Time</p>
                  <p className="text-base font-semibold">
                    {formatDuration(directions.total_duration_seconds)}
                  </p>
                </div>
              </div>
            )}

            {/* Stops */}
            <div>
              {allStops.map((item, i) => (
                <StopCard
                  key={i}
                  index={i}
                  stop={item.stop}
                  legAfter={item.legAfter}
                  location={item.location}
                  isLast={i === allStops.length - 1}
                />
              ))}
            </div>

            {/* Trip notes */}
            {plan.trip_notes.length > 0 && (
              <div className="bg-secondary rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                    Trip Notes
                  </p>
                </div>
                {plan.trip_notes.map((note, i) => (
                  <p key={i} className="text-xs text-muted-foreground leading-snug">
                    • {note}
                  </p>
                ))}
              </div>
            )}

            <TeslaShareButton mapsUrl={mapsUrl} plan={plan} />
          </>
        )}

        <div className="pb-2" />
      </div>
    </ScrollArea>
  )
}
