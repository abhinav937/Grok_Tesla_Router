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
  ev_notes: string[]
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

export interface LegBatteryEstimate {
  distance_miles: number
  estimated_kwh: number
  soc_delta_percent: number
  cumulative_soc_after: number
  needs_charging_before: boolean
  warn_low_battery: boolean
}

export interface TripBatteryPlan {
  legs: LegBatteryEstimate[]
  starting_soc: number
  ending_soc: number
  total_distance_miles: number
  charging_stops_recommended: number[]
}
