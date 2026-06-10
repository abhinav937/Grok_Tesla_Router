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
    <div className="panel h-full"> {/* design system glass panel */}
      {/* Header — design system */}
      <header className="panel-head">
        <span className="brand-orb">
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-fg)' }} />
        </span>
        <span className="panel-title">Trip Plan</span>
        <span className="model-tag mono">GROK&nbsp;3</span>
        <button className="newtrip-btn" onClick={onNewTrip}>
          <X className="w-3 h-3" /> New trip
        </button>
      </header>

      {/* Scrollable content — design system panel-scroll */}
      <div className="panel-scroll">
        <div className="space-y-3">

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
                  className="rounded-xl animate-pulse"
                  style={{ height: h, background: 'var(--surface-raised)' }}
                />
              ))}
            </div>
          )}

          {plan && (
            <>
              {/* Summary — design system .summary */}
              {directions && (
                <div className="summary anim-rise">
                  <div className="summary-top">
                    <div className="summary-metric">
                      <span className="summary-time">{formatDuration(directions.total_duration_seconds)}</span>
                      <span className="summary-dist mono">({Math.round(directions.total_distance_meters / 1609.34).toLocaleString()} mi)</span>
                    </div>
                  </div>
                  <div className="summary-route">
                    <b>{plan.origin.name}</b>
                    <span style={{ color: 'var(--text-subtle)' }}>→</span>
                    <b>{plan.destination.name}</b>
                    {plan.waypoints.length > 0 && (
                      <span className="summary-stops">· {plan.waypoints.length} stops</span>
                    )}
                  </div>
                </div>
              )}

              {/* Stop list — design system */}
              <div className="stop-list">
                {allStops.map((item, i) => {
                  const dayBreak = showDayBreaks
                    ? dayBreaks.find(d => d.stopIndex === i)
                    : null

                  return (
                    <div key={i}>
                      {dayBreak && (
                        <div className="flex items-center gap-2 py-1.5">
                          <div className="summary-days">
                            <Sunrise className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-semibold tracking-wider">DAY {dayBreak.dayNum}</span>
                            {dayBreak.dayDurationSeconds > 0 && (
                              <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                                ~{formatDuration(dayBreak.dayDurationSeconds)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
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

              {/* Trip notes — design system */}
              {plan.trip_notes.length > 0 && (
                <section className="notes anim-rise">
                  <div className="notes-head">
                    <Info className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                    <span>Trip notes</span>
                  </div>
                  {plan.trip_notes.map((note, i) => (
                    <p key={i} className="note">{note}</p>
                  ))}
                </section>
              )}

              {/* Handoff — design system */}
              <section className="handoff anim-rise">
                <TeslaShareButton mapsUrl={mapsUrl} plan={plan} />
              </section>
            </>
          )}

          <div className="pb-4" />
        </div>
      </div>
    </div>
  )
}
