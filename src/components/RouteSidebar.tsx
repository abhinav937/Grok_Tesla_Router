'use client'
import { Zap, X, Info, Sunrise } from 'lucide-react'
import { StopCard } from './StopCard'
import { TeslaShareButton } from './TeslaShareButton'
import { ThinkingTrace } from './ThinkingTrace'
import { buildGoogleMapsUrl } from '@/lib/maps'
import type { TripPlan, DirectionsResult, TripPlanUsage, TripPlanToolCall, RouteLeg } from '@/lib/types'

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

interface Props {
  plan: TripPlan | null
  thinking: string
  isThinking: boolean
  toolCall: TripPlanToolCall | null
  usage: TripPlanUsage | null
  directions: DirectionsResult | null
  isLoading: boolean
  onPreviewStop: (index: number) => void
  onNewTrip: () => void
  highlightedStop?: number | null
  // Optional hover for map pin preview (re-uses the same setter for simplicity)
  onHoverStop?: (index: number | null) => void
}

export function RouteSidebar({
  plan, thinking, isThinking, toolCall, usage,
  directions, isLoading, onPreviewStop, onNewTrip, highlightedStop, onHoverStop,
}: Props) {
  const showThinking = thinking || isThinking

  const allStops = plan ? [
    {
      stop: plan.origin,
      legAfter: directions?.legs[0] ?? null,
      location: directions?.legs[0]?.start_location,
    },
    ...plan.waypoints.map((wp, i) => ({
      stop: wp,
      legAfter: directions?.legs[i + 1] ?? null,
      location: directions?.legs[i]?.end_location,
    })),
    {
      stop: plan.destination,
      legAfter: null,
      location: directions ? directions.legs[directions.legs.length - 1]?.end_location : undefined,
    },
  ] : []

  // Compute cumulative distance/duration arriving at each stop (for richer cards)
  const cumulativeForStop: Array<{ dist: string; dur: string }> = []
  if (directions?.legs) {
    let cDist = 0
    let cSec = 0
    // Origin: 0
    cumulativeForStop.push({ dist: '0 mi', dur: '0m' })
    for (let i = 0; i < directions.legs.length; i++) {
      cDist += directions.legs[i].distance.value
      cSec += directions.legs[i].duration.value
      const distMi = Math.round(cDist / 1609.34)
      const h = Math.floor(cSec / 3600)
      const m = Math.round((cSec % 3600) / 60)
      const durStr = h > 0 ? `${h}h ${m}m` : `${m}m`
      cumulativeForStop.push({ dist: `${distMi.toLocaleString()} mi`, dur: durStr })
    }
  }

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
    <div className="h-full flex flex-col bg-tesla-panel border-r border-white/[0.08] shadow-panel">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-[60px] shrink-0 border-b border-white/[0.08]">
        <div className="w-7 h-7 rounded-full bg-[#4DA6FF] flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-black" fill="currentColor" />
        </div>
        <span className="text-[15px] font-semibold text-white">Trip Plan</span>
        <span className="text-[11px] text-white/20 ml-auto font-mono tracking-wide">GROK 3</span>
        <button
          onClick={onNewTrip}
          className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5 ml-1"
        >
          <X className="w-3.5 h-3.5" />
          New trip
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 space-y-3">

          {/* Thinking trace */}
          {showThinking && (
            <ThinkingTrace
              thinking={thinking}
              isThinking={isThinking}
              toolCall={toolCall}
              usage={usage}
            />
          )}

          {/* Loading skeletons */}
          {isLoading && !plan && !showThinking && (
            <div className="space-y-3">
              {[150, 180, 150, 120].map((h, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/[0.04] animate-pulse"
                  style={{ height: h }}
                />
              ))}
            </div>
          )}

          {plan && (
            <>
              {/* Trip summary */}
              {directions && (
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3.5">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-[24px] font-bold text-[#4DA6FF] tracking-tight">
                      {formatDuration(directions.total_duration_seconds)}
                    </span>
                    <span className="text-[14px] text-white/35">
                      ({Math.round(directions.total_distance_meters / 1609.34).toLocaleString()} mi)
                    </span>
                  </div>
                  <p className="text-[13px] text-white/55 leading-snug">
                    <span className="text-white font-medium">{plan.origin.name}</span>
                    <span className="text-white/25 mx-2">→</span>
                    <span className="text-white font-medium">{plan.destination.name}</span>
                    {plan.waypoints.length > 0 && (
                      <span className="text-white/35 ml-1.5">
                        · {plan.waypoints.length} stop{plan.waypoints.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Stop cards */}
              <div className="space-y-0">
                {allStops.map((item, i) => {
                  const dayBreak = showDayBreaks
                    ? dayBreaks.find(d => d.stopIndex === i)
                    : null

                  return (
                    <div key={i}>
                      {dayBreak && (
                        <div className="flex items-center gap-2 py-1.5">
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4DA6FF]/10 border border-[#4DA6FF]/20 text-[#4DA6FF]">
                            <Sunrise className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-semibold tracking-wider">
                              DAY {dayBreak.dayNum}
                            </span>
                            {dayBreak.dayDurationSeconds > 0 && (
                              <span className="text-[10px] text-[#4DA6FF]/50 tabular-nums">
                                ~{formatDuration(dayBreak.dayDurationSeconds)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                      )}
                      <div className={i < allStops.length - 1 ? 'mb-2.5' : ''}>
                        <StopCard
                          index={i}
                          stop={item.stop}
                          legAfter={item.legAfter}
                          isLast={i === allStops.length - 1}
                          location={item.location}
                          onPreviewClick={() => onPreviewStop(i)}
                          onHover={onHoverStop}
                          isHighlighted={highlightedStop === i}
                          cumulativeDistance={cumulativeForStop[i]?.dist}
                          cumulativeDuration={cumulativeForStop[i]?.dur}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Trip notes */}
              {plan.trip_notes.length > 0 && (
                <div className="bg-[#4DA6FF]/[0.06] border border-[#4DA6FF]/15 rounded-xl px-3.5 py-3 space-y-1.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Info className="w-3.5 h-3.5 text-[#4DA6FF] shrink-0" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#4DA6FF]/70">Trip Notes</p>
                  </div>
                  {plan.trip_notes.map((note, i) => (
                    <p key={i} className="text-[12px] text-white/45 leading-relaxed">
                      · {note}
                    </p>
                  ))}
                </div>
              )}

              <TeslaShareButton mapsUrl={mapsUrl} plan={plan} />
            </>
          )}

          <div className="pb-4" />
        </div>
      </div>
    </div>
  )
}
