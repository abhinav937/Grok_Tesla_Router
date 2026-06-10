'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Copy, CheckCheck, Navigation } from 'lucide-react'
import type { TripPlan } from '@/lib/types'

interface Props {
  mapsUrl: string
  plan: TripPlan
}

export function TeslaShareButton({ mapsUrl, plan }: Props) {
  const [copied, setCopied] = useState(false)

  const stopList = [
    `Start: ${plan.origin.name} — ${plan.origin.address}`,
    ...plan.waypoints.map((w, i) => `Stop ${i + 1}: ${w.name} — ${w.address}`),
    `End: ${plan.destination.name} — ${plan.destination.address}`,
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stopList)
      setCopied(true)
      toast.success('Stop list copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy — try manually selecting the text')
    }
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full bg-[#CC0000] hover:bg-[#8B0000] text-white gap-2"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <Navigation className="w-4 h-4" />
        Open in Google Maps
        <ExternalLink className="w-3 h-3 opacity-70" />
      </Button>

      <Card className="bg-secondary border-border">
        <CardContent className="px-3 py-3">
          <p className="text-xs text-muted-foreground mb-2 leading-snug">
            <span className="font-semibold text-foreground">Send to Tesla:</span>{' '}
            In Google Maps → tap{' '}
            <span className="font-medium text-foreground">Share</span> → select{' '}
            <span className="font-medium text-foreground">Tesla app</span> → Send to Car
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckCheck className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied!' : 'Copy Stop List'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
