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
      <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0D0E11]">
        {/* Full-screen map */}
        <div className="absolute inset-0">
          <RouteMap
            plan={trip.plan}
            directions={directionsQuery.data ?? null}
            isLoading={directionsQuery.isFetching}
            highlightedStop={highlightedStop}
            onHighlightClear={() => setHighlightedStop(null)}
          />
        </div>

        {/* Left overlay panel */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-[420px] z-20',
            'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
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
            onPreviewStop={setHighlightedStop}
            onNewTrip={handleReset}
          />
        </div>

        {/* Reopen panel tab */}
        {!panelOpen && hasTrip && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-14 bg-[#111215]/90 border border-white/10 border-l-0 rounded-r-lg text-white/50 hover:text-white hover:bg-[#1A1B1F]/90 transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom floating input */}
        {showInput && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-[620px] px-4">
            <NaturalLanguageInput
              onSubmit={trip.mutate}
              isLoading={false}
              error={trip.error ?? undefined}
              onReset={trip.status === 'error' ? handleReset : undefined}
            />
          </div>
        )}
      </div>
    </APIProvider>
  )
}
