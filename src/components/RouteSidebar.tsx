'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StopCard } from './StopCard'
import { TeslaShareButton } from './TeslaShareButton'
import { buildGoogleMapsUrl } from '@/lib/maps'
import type { TripPlan, DirectionsResult, TripBatteryPlan } from '@/lib/types'
import { Clock, RouteIcon, Battery, AlertTriangle } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface Props {
  plan: TripPlan | null
  directions: DirectionsResult | null
  batteryPlan: TripBatteryPlan | null
  isLoading: boolean
}

export function RouteSidebar({ plan, directions, batteryPlan, isLoading }: Props) {
  if (isLoading && !plan) {
    return (
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!plan) return null

  const mapsUrl = buildGoogleMapsUrl(
    plan.origin.address,
    plan.destination.address,
    plan.waypoints.map(w => w.address)
  )

  const allStops: Array<{
    stop: TripPlan['origin'] | TripPlan['waypoints'][0]
    legAfter: DirectionsResult['legs'][0] | null
    battery: TripBatteryPlan['legs'][0] | null
  }> = [
    {
      stop: plan.origin,
      legAfter: directions?.legs[0] ?? null,
      battery: batteryPlan?.legs[0] ?? null,
    },
    ...plan.waypoints.map((wp, i) => ({
      stop: wp,
      legAfter: directions?.legs[i + 1] ?? null,
      battery: batteryPlan?.legs[i + 1] ?? null,
    })),
    {
      stop: plan.destination,
      legAfter: null,
      battery: null,
    },
  ]

  const endSoc = batteryPlan?.ending_soc ?? null
  const lowEndSoc = endSoc !== null && endSoc < 20

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 py-4 space-y-4">
        {/* Trip summary stats */}
        {directions && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary rounded-lg p-2 text-center">
              <RouteIcon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Distance</p>
              <p className="text-sm font-semibold">
                {Math.round(directions.total_distance_meters / 1609.34)} mi
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Drive</p>
              <p className="text-sm font-semibold">
                {formatDuration(directions.total_duration_seconds)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-2 text-center">
              <Battery className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">End SOC</p>
              <p className={`text-sm font-semibold ${lowEndSoc ? 'text-red-400' : 'text-green-400'}`}>
                {endSoc !== null ? `${endSoc}%` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Stops list */}
        <div>
          {allStops.map((item, i) => (
            <StopCard
              key={i}
              index={i}
              stop={item.stop}
              legAfter={item.legAfter}
              battery={item.battery}
              totalStops={allStops.length}
              isLast={i === allStops.length - 1}
            />
          ))}
        </div>

        {/* EV notes */}
        {plan.ev_notes.length > 0 && (
          <div className="bg-secondary rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-wide text-yellow-400">
                EV Planning Notes
              </p>
            </div>
            {plan.ev_notes.map((note, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-snug">
                • {note}
              </p>
            ))}
          </div>
        )}

        {/* Tesla share button */}
        <TeslaShareButton mapsUrl={mapsUrl} plan={plan} />

        <div className="pb-2" />
      </div>
    </ScrollArea>
  )
}
