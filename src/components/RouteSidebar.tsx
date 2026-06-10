'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { StopCard } from './StopCard'
import { TeslaShareButton } from './TeslaShareButton'
import { ThinkingTrace } from './ThinkingTrace'
import { buildGoogleMapsUrl } from '@/lib/maps'
import type { TripPlan, DirectionsResult, TripPlanUsage, TripPlanToolCall, RouteLeg } from '@/lib/types'
import { Info, Sunrise } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface DayBreak {
  dayNum: number
  stopIndex: number
  dayDurationSeconds: number
}

function computeDayBreaks(legs: RouteLeg[]): DayBreak[] {
  const MAX = 9 * 3600
  const breaks: DayBreak[] = [{ dayNum: 1, stopIndex: 0, dayDurationSeconds: 0 }]
  let dayDrive = 0
  let dayStartLeg = 0

  for (let i = 0; i < legs.length; i++) {
    dayDrive += legs[i].duration.value
    if (dayDrive > MAX && i < legs.length - 1) {
      breaks[breaks.length - 1].dayDurationSeconds = legs
        .slice(dayStartLeg, i + 1)
        .reduce((s, l) => s + l.duration.value, 0)
      breaks.push({ dayNum: breaks.length + 1, stopIndex: i + 1, dayDurationSeconds: 0 })
      dayDrive = 0
      dayStartLeg = i + 1
    }
  }

  breaks[breaks.length - 1].dayDurationSeconds = legs
    .slice(dayStartLeg)
    .reduce((s, l) => s + l.duration.value, 0)

  return breaks
}

function TripSummaryHeader({ plan, directions }: { plan: TripPlan; directions: DirectionsResult }) {
  const miles = Math.round(directions.total_distance_meters / 1609.34).toLocaleString()
  const driveTime = formatDuration(directions.total_duration_seconds)
  const stopCount = plan.waypoints.length

  return (
    <div className="rounded-xl bg-white shadow-google px-4 py-3.5">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[22px] font-medium tracking-tight text-[#1a73e8]">{driveTime}</span>
        <span className="text-[15px] text-[#5f6368]">({miles} mi)</span>
      </div>
      <p className="text-[13px] text-[#5f6368] leading-snug">
        <span className="text-[#202124] font-medium">{plan.origin.name}</span>
        {' → '}
        <span className="text-[#202124] font-medium">{plan.destination.name}</span>
        {stopCount > 0 && (
          <span> · {stopCount} stop{stopCount !== 1 ? 's' : ''}</span>
        )}
      </p>
    </div>
  )
}

interface Props {
  plan: TripPlan | null
  thinking: string
  isThinking: boolean
  toolCall: TripPlanToolCall | null
  usage: TripPlanUsage | null
  directions: DirectionsResult | null
  isLoading: boolean
  onPreviewStop: (index: number) => void
}

export function RouteSidebar({
  plan, thinking, isThinking, toolCall, usage,
  directions, isLoading, onPreviewStop,
}: Props) {
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

  const allStops = plan
    ? [
        { stop: plan.origin,      legAfter: directions?.legs[0] ?? null },
        ...plan.waypoints.map((wp, i) => ({
          stop: wp,
          legAfter: directions?.legs[i + 1] ?? null,
        })),
        { stop: plan.destination, legAfter: null },
      ]
    : []

  const totalDriveHours = (directions?.total_duration_seconds ?? 0) / 3600
  const dayBreaks = directions && totalDriveHours > 10
    ? computeDayBreaks(directions.legs)
    : [{ dayNum: 1, stopIndex: 0, dayDurationSeconds: 0 }]
  const showDayBreaks = totalDriveHours > 10 && dayBreaks.length > 1

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
        {/* Live thinking trace */}
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
            {/* Trip summary header */}
            {directions && (
              <TripSummaryHeader plan={plan} directions={directions} />
            )}

            {/* Stops with optional day breaks */}
            <div>
              {allStops.map((item, i) => {
                const dayBreak = showDayBreaks
                  ? dayBreaks.find(d => d.stopIndex === i)
                  : null

                return (
                  <div key={i}>
                    {dayBreak && (
                      <div className="flex items-center gap-2 py-2 mb-1">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe]">
                          <Sunrise className="w-3 h-3 text-[#1a73e8] shrink-0" />
                          <span className="text-[11px] font-medium text-[#1a73e8]">
                            Day {dayBreak.dayNum}
                          </span>
                          {dayBreak.dayDurationSeconds > 0 && (
                            <span className="text-[11px] text-[#1a73e8]/80">
                              · ~{formatDuration(dayBreak.dayDurationSeconds)} driving
                            </span>
                          )}
                        </div>
                        <div className="flex-1 h-px bg-[#dadce0]" />
                      </div>
                    )}
                    <StopCard
                      index={i}
                      stop={item.stop}
                      legAfter={item.legAfter}
                      isLast={i === allStops.length - 1}
                      onPreviewClick={() => onPreviewStop(i)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Trip notes */}
            {plan.trip_notes.length > 0 && (
              <div className="bg-[#e8f0fe] rounded-xl px-3.5 py-3 space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#1a73e8]">
                    Trip Notes
                  </p>
                </div>
                {plan.trip_notes.map((note, i) => (
                  <p key={i} className="text-[13px] text-[#3c4043] leading-snug">
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
