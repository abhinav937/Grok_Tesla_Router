'use client'
import { useState, useEffect } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ChevronRight } from 'lucide-react'
import { NaturalLanguageInput } from './NaturalLanguageInput'
import { RouteMap } from './RouteMap'
import { RouteSidebar } from './RouteSidebar'
import { useTripPlan } from '@/hooks/useTripPlan'
import { useDirections } from '@/hooks/useDirections'
import { cn } from '@/lib/utils'

export function TripPlanner() {
  const trip = useTripPlan()
  const directionsQuery = useDirections(trip.plan)
  const [highlightedStop, setHighlightedStop] = useState<number | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (trip.status === 'thinking' || trip.status === 'success') {
      setPanelOpen(true)
    } else {
      setPanelOpen(false)
    }
  }, [trip.status])

  const handleReset = () => {
    trip.reset()
    setPanelOpen(false)
  }

  const showInput = trip.status === 'idle' || trip.status === 'error'
  const hasTrip = trip.status === 'thinking' || trip.status === 'success'

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="relative h-[100dvh] w-full overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
        {/* Full-screen map */}
        <div className="absolute inset-0">
          <RouteMap
            plan={trip.plan}
            directions={directionsQuery.data ?? null}
            isLoading={directionsQuery.isFetching}
            highlightedStop={highlightedStop}
            onHighlight={(index) => setHighlightedStop(index)}
          />
        </div>

        {/* Left overlay panel */}
        <div
          className={cn(
            'panel-wrap',
            'transition-transform duration-500 ease-panel',
            panelOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <RouteSidebar
            plan={trip.plan}
            thinking={trip.thinking}
            isThinking={trip.isPending}
            toolCall={trip.toolCall}
            usage={trip.usage}
            directions={directionsQuery.data ?? null}
            isLoading={directionsQuery.isFetching}
            highlightedStop={highlightedStop}
            onPreviewStop={setHighlightedStop}
            onHoverStop={setHighlightedStop}
            onNewTrip={handleReset}
          />
        </div>

        {/* Reopen panel tab */}
        {!panelOpen && hasTrip && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="panel-reopen"
            aria-label="Open trip panel"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Idle Composer — centered glass (design system) */}
        {showInput && (
          <NaturalLanguageInput
            onSubmit={trip.mutate}
            isLoading={false}
            error={trip.error ?? undefined}
            onReset={trip.status === 'error' ? handleReset : undefined}
          />
        )}
      </div>
    </APIProvider>
  )
}
