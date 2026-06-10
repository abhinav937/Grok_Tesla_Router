import type { RouteLeg, LegBatteryEstimate, TripBatteryPlan } from './types'

const WH_PER_MILE = 250
const BATTERY_KWH = 82
const STARTING_SOC = 0.80
const WARN_THRESHOLD = 0.20
const EMPTY_THRESHOLD = 0.10
const METERS_PER_MILE = 1609.34

export function calculateTripBattery(legs: RouteLeg[]): TripBatteryPlan {
  let currentSoc = STARTING_SOC
  const legEstimates: LegBatteryEstimate[] = []
  const chargingStopsRecommended: number[] = []

  for (let i = 0; i < legs.length; i++) {
    const distanceMiles = legs[i].distance.value / METERS_PER_MILE
    const estimatedKwh = distanceMiles * (WH_PER_MILE / 1000)
    const socDelta = estimatedKwh / BATTERY_KWH
    const socAfter = currentSoc - socDelta

    const needsCharging = socAfter < EMPTY_THRESHOLD
    const warnLow = socAfter < WARN_THRESHOLD

    if (needsCharging && i > 0) {
      chargingStopsRecommended.push(i)
    }

    legEstimates.push({
      distance_miles: Math.round(distanceMiles * 10) / 10,
      estimated_kwh: Math.round(estimatedKwh * 10) / 10,
      soc_delta_percent: Math.round(socDelta * 100),
      cumulative_soc_after: Math.round(socAfter * 100),
      needs_charging_before: needsCharging,
      warn_low_battery: warnLow,
    })

    currentSoc = Math.max(socAfter, 0)
  }

  const totalMiles = legs.reduce((sum, l) => sum + l.distance.value / METERS_PER_MILE, 0)

  return {
    legs: legEstimates,
    starting_soc: Math.round(STARTING_SOC * 100),
    ending_soc: Math.round(currentSoc * 100),
    total_distance_miles: Math.round(totalMiles),
    charging_stops_recommended: chargingStopsRecommended,
  }
}
