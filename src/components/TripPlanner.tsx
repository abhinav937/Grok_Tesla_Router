'use client'
import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
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

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="flex flex-col md:flex-row h-[100dvh] bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[400px] md:min-w-[400px] flex flex-col overflow-hidden bg-white border-b md:border-b-0 md:border-r border-[#e8eaed] md:h-full z-10 md:shadow-google">
          <div className="p-4 border-b border-[#e8eaed] shrink-0">
            <NaturalLanguageInput
              onSubmit={trip.mutate}
              isLoading={trip.isPending}
              error={trip.error ?? undefined}
              onReset={trip.plan || trip.status === 'error' ? trip.reset : undefined}
            />
          </div>

          <div
            className={cn(
              'flex-1 overflow-hidden flex flex-col',
              !trip.thinking && !trip.plan ? 'hidden md:flex' : 'flex'
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
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px] md:min-h-0">
          <RouteMap
            plan={trip.plan}
            directions={directionsQuery.data ?? null}
            isLoading={directionsQuery.isFetching}
            highlightedStop={highlightedStop}
            onHighlightClear={() => setHighlightedStop(null)}
          />
        </div>
      </div>
    </APIProvider>
  )
}
