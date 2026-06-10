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
    <div className="space-y-2.5 pt-1">
      <button
        className="w-full h-12 rounded-full bg-white text-black text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
        onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
      >
        <Navigation className="w-4 h-4" />
        Open in Google Maps
        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
      </button>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3.5 py-3 space-y-2.5">
        <p className="text-[12px] text-white/35 leading-snug">
          To send to your car:{' '}
          <span className="text-white/65">Share</span>
          <span className="text-white/20 mx-1">→</span>
          <span className="text-white/65">Tesla app</span>
          <span className="text-white/20 mx-1">→</span>
          <span className="text-white/65">Send to Car</span>
        </p>

        <button
          className="w-full h-9 rounded-full border border-white/10 text-white/45 text-[12px] font-medium hover:bg-white/5 hover:text-white/65 transition-colors flex items-center justify-center gap-2"
          onClick={handleCopy}
        >
          {copied ? (
            <><CheckCheck className="w-3.5 h-3.5 text-green-400" />Copied</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copy addresses</>
          )}
        </button>
      </div>
    </div>
  )
}
