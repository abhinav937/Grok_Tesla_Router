import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')
  const size = req.nextUrl.searchParams.get('size') ?? '600x300'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  const url =
    `https://maps.googleapis.com/maps/api/streetview` +
    `?size=${size}&location=${lat},${lng}&key=${apiKey}` +
    `&return_error_codes=true&source=outdoor`

  const res = await fetch(url)

  // When no Street View is available, the API returns a 404 or error JSON
  if (!res.ok) {
    return NextResponse.json({ error: 'no_street_view' }, { status: 404 })
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('json')) {
    return NextResponse.json({ error: 'no_street_view' }, { status: 404 })
  }

  const imageBuffer = await res.arrayBuffer()
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
