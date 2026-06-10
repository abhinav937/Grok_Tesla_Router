import { NextRequest } from 'next/server'
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
  trip_notes: z.array(z.string()),
  total_estimated_hours: z.number(),
})

const planTripTool = {
  type: 'function' as const,
  function: {
    name: 'plan_road_trip',
    description: 'Return a structured road trip plan with ordered stops.',
    parameters: {
      type: 'object',
      required: ['origin', 'destination', 'waypoints', 'trip_notes', 'total_estimated_hours'],
      properties: {
        origin: {
          type: 'object',
          required: ['name', 'address'],
          properties: { name: { type: 'string' }, address: { type: 'string' } },
        },
        destination: {
          type: 'object',
          required: ['name', 'address'],
          properties: { name: { type: 'string' }, address: { type: 'string' } },
        },
        waypoints: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'address', 'type', 'reason', 'detour_minutes'],
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              type: { type: 'string', enum: ['food', 'charging', 'scenic', 'rest', 'attraction'] },
              reason: { type: 'string' },
              detour_minutes: { type: 'number' },
            },
          },
        },
        trip_notes: { type: 'array', items: { type: 'string' } },
        total_estimated_hours: { type: 'number' },
      },
    },
  },
}

const SYSTEM_PROMPT = `You are an expert road trip planner. Parse the user's trip request and call plan_road_trip.

Rules:
- Provide full, geocodable US addresses ("City, State" minimum, full street address for specific venues)
- Order waypoints geographically to minimize backtracking
- Include 2-6 stops that genuinely add value (food, attractions, scenery, rest)
- detour_minutes is the extra time for detouring to this stop (0 if on the main route)
- trip_notes: 2-4 practical tips about timing, traffic, highlights, or must-sees along the way`

type StreamEvent =
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; origin: string; destination: string; waypoint_count: number }
  | { type: 'result'; data: z.infer<typeof TripPlanSchema> }
  | { type: 'usage'; data: { prompt_tokens: number; completion_tokens: number; reasoning_tokens?: number; total_tokens: number; duration_ms: number } }
  | { type: 'error'; error: string }

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      }

      const startMs = Date.now()

      try {
        const { prompt } = await req.json()

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
          send({ type: 'error', error: 'A trip description is required' })
          controller.close()
          return
        }

        const grok = getGrokClient()

        // reasoning_effort is an xAI extension, not in the OpenAI SDK types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grokStream = await (grok.chat.completions.create as any)({
          model: process.env.XAI_MODEL ?? 'grok-3-mini',
          reasoning_effort: 'high',
          stream: true,
          stream_options: { include_usage: true },
          temperature: 0.3,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt.trim() },
          ],
          tools: [planTripTool],
          tool_choice: { type: 'function', function: { name: 'plan_road_trip' } },
        })

        let toolArgsBuffer = ''
        let usageData: Record<string, number> | null = null

        for await (const chunk of grokStream) {
          // xAI-specific delta fields
          const delta = (chunk.choices?.[0]?.delta ?? {}) as {
            reasoning_content?: string
            tool_calls?: Array<{ index: number; function?: { arguments?: string } }>
          }

          if (delta.reasoning_content) {
            send({ type: 'thinking', text: delta.reasoning_content })
          }

          if (delta.tool_calls?.[0]?.function?.arguments) {
            toolArgsBuffer += delta.tool_calls[0].function.arguments
          }

          if (chunk.usage) {
            usageData = chunk.usage as Record<string, number>
          }
        }

        if (!toolArgsBuffer) {
          send({ type: 'error', error: 'Model did not return a plan. Try rephrasing.' })
          controller.close()
          return
        }

        let rawArgs: unknown
        try {
          rawArgs = JSON.parse(toolArgsBuffer)
        } catch {
          send({ type: 'error', error: 'AI returned malformed data' })
          controller.close()
          return
        }

        const parsed = TripPlanSchema.safeParse(rawArgs)
        if (!parsed.success) {
          send({ type: 'error', error: 'Plan validation failed — try again' })
          controller.close()
          return
        }

        send({
          type: 'tool_call',
          origin: parsed.data.origin.name,
          destination: parsed.data.destination.name,
          waypoint_count: parsed.data.waypoints.length,
        })

        send({ type: 'result', data: parsed.data })

        if (usageData) {
          send({
            type: 'usage',
            data: {
              prompt_tokens: usageData.prompt_tokens ?? 0,
              completion_tokens: usageData.completion_tokens ?? 0,
              reasoning_tokens: usageData.reasoning_tokens,
              total_tokens: usageData.total_tokens ?? 0,
              duration_ms: Date.now() - startMs,
            },
          })
        }
      } catch (err) {
        console.error('[plan-trip]', err)
        send({ type: 'error', error: err instanceof Error ? err.message : 'Internal server error' })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
