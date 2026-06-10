'use client'
import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import { NaturalLanguageInput } from './NaturalLanguageInput'
import { RouteMap } from './RouteMap'
import { RouteSidebar } from './RouteSidebar'
import { useTripPlan } from '@/hooks/useTripPlan'
import { useDirections } from '@/hooks/useDirections'
import { calculateTripBattery } from '@/lib/ev-estimates'
import type { TripPlan } from '@/lib/types'

export function TripPlanner() {
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null)

  const tripMutation = useTripPlan()
  const directionsQuery = useDirections(currentPlan)

  const batteryPlan =
    directionsQuery.data ? calculateTripBattery(directionsQuery.data.legs) : null

  const isLoading = tripMutation.isPending || directionsQuery.isFetching

  const handleSubmit = async (prompt: string) => {
    try {
      const result = await tripMutation.mutateAsync({ prompt })
      setCurrentPlan(result)
    } catch {
      // error is available via tripMutation.error
    }
  }

  const handleReset = () => {
    setCurrentPlan(null)
    tripMutation.reset()
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex flex-col md:flex-row h-[100dvh] bg-background overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[400px] md:min-w-[400px] flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-border md:h-full">
          <div className="p-4 border-b border-border shrink-0">
            <NaturalLanguageInput
              onSubmit={handleSubmit}
              isLoading={tripMutation.isPending}
              error={tripMutation.error?.message}
              onReset={currentPlan ? handleReset : undefined}
            />
          </div>

          {/* Sidebar content — hidden on mobile until plan is ready */}
          <div className={`flex-1 overflow-hidden ${!currentPlan && !isLoading ? 'hidden md:flex' : 'flex'} flex-col`}>
            <RouteSidebar
              plan={currentPlan}
              directions={directionsQuery.data ?? null}
              batteryPlan={batteryPlan}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px] md:min-h-0">
          <RouteMap
            plan={currentPlan}
            directions={directionsQuery.data ?? null}
            isLoading={directionsQuery.isFetching}
          />
        </div>
      </div>
    </APIProvider>
  )
}
