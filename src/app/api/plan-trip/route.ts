import { NextRequest, NextResponse } from 'next/server'
import { getGrokClient } from '@/lib/grok'
import { z } from 'zod'

const TripPlanSchema = z.object({
  origin: z.object({ name: z.string(), address: z.string() }),
  destination: z.object({ name: z.string(), address: z.string() }),
  waypoints: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      type: z.enum(['food', 'charging', 'scenic', 'rest', 'attraction']),
      reason: z.string(),
      detour_minutes: z.number(),
    })
  ),
  ev_notes: z.array(z.string()),
  total_estimated_hours: z.number(),
})

const planTripTool = {
  type: 'function' as const,
  function: {
    name: 'plan_road_trip',
    description: 'Return a structured road trip plan with ordered stops for a Tesla EV.',
    parameters: {
      type: 'object',
      required: ['origin', 'destination', 'waypoints', 'ev_notes', 'total_estimated_hours'],
      properties: {
        origin: {
          type: 'object',
          required: ['name', 'address'],
          properties: {
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        destination: {
          type: 'object',
          required: ['name', 'address'],
          properties: {
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        waypoints: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'address', 'type', 'reason', 'detour_minutes'],
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              type: {
                type: 'string',
                enum: ['food', 'charging', 'scenic', 'rest', 'attraction'],
              },
              reason: { type: 'string' },
              detour_minutes: { type: 'number' },
            },
          },
        },
        ev_notes: { type: 'array', items: { type: 'string' } },
        total_estimated_hours: { type: 'number' },
      },
    },
  },
}

const SYSTEM_PROMPT = `You are an expert EV road trip planner specializing in Tesla Model 3 Long Range (82 kWh usable, ~300 mile range at 80% charge).
Parse the user's trip request and call plan_road_trip with a structured plan.

Rules:
- Provide full, geocodable US addresses (minimum "City, State" format, full street address preferred for specific venues)
- Order waypoints geographically to minimize backtracking
- For trips where any single leg exceeds 220 miles, add a charging stop (type: "charging") before that leg
- Include 3-8 stops for long trips, keeping each drive segment under 3 hours
- ev_notes should include practical Tesla tips: charging strategy, optimal departure time, supercharger locations
- detour_minutes is the extra time added by detouring to this stop (0 if it's on the main route)`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, preferences } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'A trip description is required' }, { status: 400 })
    }

    const systemContent = preferences
      ? `${SYSTEM_PROMPT}\n\nUser preferences: ${JSON.stringify(preferences)}`
      : SYSTEM_PROMPT

    const grok = getGrokClient()
    const response = await grok.chat.completions.create({
      model: process.env.XAI_MODEL ?? 'grok-3-mini',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: prompt.trim() },
      ],
      tools: [planTripTool],
      tool_choice: { type: 'function', function: { name: 'plan_road_trip' } },
      temperature: 0.3,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.function.name !== 'plan_road_trip') {
      return NextResponse.json(
        { error: 'AI did not return a structured plan. Please try rephrasing your request.' },
        { status: 502 }
      )
    }

    let rawArgs: unknown
    try {
      rawArgs = JSON.parse(toolCall.function.arguments)
    } catch {
      return NextResponse.json({ error: 'AI returned malformed data' }, { status: 502 })
    }

    const parsed = TripPlanSchema.safeParse(rawArgs)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'AI response failed validation', details: parsed.error.flatten() },
        { status: 502 }
      )
    }

    return NextResponse.json(parsed.data)
  } catch (err) {
    console.error('[plan-trip]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
