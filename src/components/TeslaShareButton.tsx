'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, CheckCheck, Navigation } from 'lucide-react'
import type { TripPlan } from '@/lib/types'

interface Props {
  mapsUrl: string
  plan: TripPlan
}

export function TeslaShareButton({ mapsUrl, plan }: Props) {
  const [copied, setCopied] = useState(false)

  const addressList = [
    plan.origin.address,
    ...plan.waypoints.map(w => w.address),
    plan.destination.address,
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(addressList)
      setCopied(true)
      toast.success('Addresses copied!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Primary CTA */}
      <Button
        className="w-full h-12 bg-[#CC0000] hover:bg-[#8B0000] text-white text-sm font-semibold gap-2 shadow-lg shadow-[#CC0000]/20"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <Navigation className="w-4 h-4" />
        Open in Google Maps
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </Button>

      {/* Instructions + copy */}
      <div className="rounded-lg bg-secondary border border-border px-3 py-3 space-y-2.5">
        <p className="text-xs text-muted-foreground leading-snug">
          In Google Maps →{' '}
          <span className="text-foreground font-medium">Share</span>
          {' → '}
          <span className="text-foreground font-medium">Tesla app</span>
          {' → '}
          <span className="text-foreground font-medium">Send to Car</span>
        </p>

        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 gap-2 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <><CheckCheck className="w-3.5 h-3.5 text-green-400" />Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copy Addresses</>
          )}
        </Button>
      </div>
    </div>
  )
}
