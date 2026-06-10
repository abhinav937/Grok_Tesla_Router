export type StopType = 'food' | 'charging' | 'scenic' | 'rest' | 'attraction'

export interface TripStop {
  name: string
  address: string
  type: StopType
  reason: string
  detour_minutes: number
}

export interface TripEndpoint {
  name: string
  address: string
}

export interface TripPlan {
  origin: TripEndpoint
  destination: TripEndpoint
  waypoints: TripStop[]
  trip_notes: string[]
  total_estimated_hours: number
}

export interface RouteLeg {
  start_address: string
  end_address: string
  start_location: { lat: number; lng: number }
  end_location: { lat: number; lng: number }
  distance: { text: string; value: number }
  duration: { text: string; value: number }
  summary: string
}

export interface DirectionsResult {
  legs: RouteLeg[]
  overview_polyline: string
  total_distance_meters: number
  total_duration_seconds: number
  waypoint_order: number[]
}

export interface TripPlanUsage {
  prompt_tokens: number
  completion_tokens: number
  reasoning_tokens?: number
  total_tokens: number
  duration_ms: number
}

export interface TripPlanToolCall {
  origin: string
  destination: string
  waypoint_count: number
}

export interface TripPlanState {
  status: 'idle' | 'thinking' | 'success' | 'error'
  thinking: string
  toolCall: TripPlanToolCall | null
  plan: TripPlan | null
  usage: TripPlanUsage | null
  error: string | null
}
