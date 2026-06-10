'use client'
import { useMutation } from '@tanstack/react-query'
import type { TripPlan } from '@/lib/types'

interface PlanTripInput {
  prompt: string
  preferences?: {
    max_driving_hours_per_day?: number
    stop_types?: string[]
  }
}

async function fetchTripPlan(input: PlanTripInput): Promise<TripPlan> {
  const res = await fetch('/api/plan-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to plan trip')
  }
  return res.json()
}

export function useTripPlan() {
  return useMutation<TripPlan, Error, PlanTripInput>({
    mutationFn: fetchTripPlan,
  })
}
