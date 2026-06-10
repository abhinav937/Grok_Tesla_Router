'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
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
    <>
      <button
        type="button"
        className="btn-tesla"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <Navigation className="w-4 h-4" />
        Open in Google Maps
        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
      </button>

      <p className="handoff-hint">
        To send to your car: <b>Share</b> <span className="dim">→</span> <b>Tesla app</b> <span className="dim">→</span> <b>Send to Car</b>
      </p>

      <button
        type="button"
        className="newtrip-btn w-full justify-center"
        onClick={handleCopy}
      >
        {copied ? (
          <><CheckCheck className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />Copied</>
        ) : (
          <><Copy className="w-3.5 h-3.5" />Copy addresses</>
        )}
      </button>
    </>
  )
}
