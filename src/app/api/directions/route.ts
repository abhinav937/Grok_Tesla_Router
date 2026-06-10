import { NextRequest, NextResponse } from 'next/server'
import type { DirectionsResult, RouteLeg } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, waypoints } = await req.json()

    if (!origin || !destination) {
      return NextResponse.json({ error: 'origin and destination are required' }, { status: 400 })
    }

    if (waypoints && waypoints.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 waypoints supported' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Maps API not configured' }, { status: 500 })
    }

    const params = new URLSearchParams({
      origin,
      destination,
      mode: 'driving',
      units: 'imperial',
      key: apiKey,
    })

    if (waypoints && waypoints.length > 0) {
      params.set('waypoints', (waypoints as string[]).join('|'))
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    const gRes = await fetch(url)
    const gData = await gRes.json()

    if (gData.status !== 'OK') {
      return NextResponse.json(
        { error: `Directions API: ${gData.status}`, details: gData.error_message },
        { status: 502 }
      )
    }

    const route = gData.routes[0]

    const legs: RouteLeg[] = route.legs.map((leg: {
      start_address: string
      end_address: string
      start_location: { lat: number; lng: number }
      end_location: { lat: number; lng: number }
      distance: { text: string; value: number }
      duration: { text: string; value: number }
    }) => ({
      start_address: leg.start_address,
      end_address: leg.end_address,
      start_location: leg.start_location,
      end_location: leg.end_location,
      distance: leg.distance,
      duration: leg.duration,
      summary: route.summary ?? '',
    }))

    const result: DirectionsResult = {
      legs,
      overview_polyline: route.overview_polyline.points,
      total_distance_meters: legs.reduce((s, l) => s + l.distance.value, 0),
      total_duration_seconds: legs.reduce((s, l) => s + l.duration.value, 0),
      waypoint_order: route.waypoint_order ?? [],
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[directions]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
