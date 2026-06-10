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
      toast.success('Addresses copied')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Primary CTA — Google blue */}
      <Button
        className="w-full h-12 rounded-full bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-medium gap-2 shadow-google"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <Navigation className="w-4 h-4" />
        Open in Google Maps
        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
      </Button>

      {/* Send-to-Tesla instructions + copy */}
      <div className="rounded-xl bg-[#f1f3f4] px-3.5 py-3 space-y-2.5">
        <p className="text-[13px] text-[#5f6368] leading-snug">
          To send to your car:{' '}
          <span className="text-[#202124] font-medium">Share</span>
          {' → '}
          <span className="text-[#202124] font-medium">Tesla app</span>
          {' → '}
          <span className="text-[#202124] font-medium">Send to Car</span>
        </p>

        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 gap-2 text-[13px] rounded-full bg-white border-[#dadce0] text-[#1a73e8] hover:bg-[#f8f9fa] hover:text-[#1765cc]"
          onClick={handleCopy}
        >
          {copied ? (
            <><CheckCheck className="w-3.5 h-3.5 text-[#1e8e3e]" />Copied</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copy addresses</>
          )}
        </Button>
      </div>
    </div>
  )
}
