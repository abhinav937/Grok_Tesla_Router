'use client'
import { useQuery } from '@tanstack/react-query'
import type { TripPlan, DirectionsResult } from '@/lib/types'

async function fetchDirections(plan: TripPlan): Promise<DirectionsResult> {
  const res = await fetch('/api/directions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: plan.origin.address,
      destination: plan.destination.address,
      waypoints: plan.waypoints.map(w => w.address),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to fetch directions')
  }
  return res.json()
}

export function useDirections(plan: TripPlan | null) {
  return useQuery<DirectionsResult, Error>({
    queryKey: [
      'directions',
      plan?.origin.address,
      plan?.destination.address,
      plan?.waypoints.map(w => w.address),
    ],
    queryFn: () => fetchDirections(plan!),
    enabled: !!plan,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })
}
