'use client'
import { useState, useCallback } from 'react'
import type { TripPlan, TripPlanState, TripPlanUsage, TripPlanToolCall } from '@/lib/types'

const INITIAL: TripPlanState = {
  status: 'idle',
  thinking: '',
  toolCall: null,
  plan: null,
  usage: null,
  error: null,
}

type StreamEvent =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; origin: string; destination: string; waypoint_count: number }
  | { type: 'result'; data: TripPlan }
  | { type: 'usage'; data: TripPlanUsage }
  | { type: 'error'; error: string }

export function useTripPlan() {
  const [state, setState] = useState<TripPlanState>(INITIAL)

  const mutate = useCallback(async (prompt: string) => {
    setState({ ...INITIAL, status: 'thinking' })

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        setState(prev => ({ ...prev, status: 'error', error: err.error ?? 'Request failed' }))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line) as StreamEvent
            switch (event.type) {
              case 'thinking':
                setState(prev => ({ ...prev, thinking: prev.thinking + event.text }))
                break
              case 'tool_call':
                setState(prev => ({
                  ...prev,
                  toolCall: {
                    origin: event.origin,
                    destination: event.destination,
                    waypoint_count: event.waypoint_count,
                  } as TripPlanToolCall,
                }))
                break
              case 'result':
                setState(prev => ({ ...prev, status: 'success', plan: event.data }))
                break
              case 'usage':
                setState(prev => ({ ...prev, usage: event.data }))
                break
              case 'error':
                setState(prev => ({ ...prev, status: 'error', error: event.error }))
                break
            }
          } catch {
            // skip malformed line
          }
        }
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Network error',
      }))
    }
  }, [])

  const reset = useCallback(() => setState(INITIAL), [])

  return {
    ...state,
    mutate,
    reset,
    isPending: state.status === 'thinking',
  }
}
