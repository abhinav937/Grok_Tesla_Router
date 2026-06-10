'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Navigation, RotateCcw } from 'lucide-react'

const EXAMPLES = [
  'Madison WI to Austin TX, max 9 hours driving per day, BBQ stop in Kansas City, scenic through Texas Hill Country',
  'San Francisco to Portland OR, coastal Hwy 1, quick food stops only, avoid big cities',
  'Chicago to Nashville, only roadside BBQ joints, keep total drive under 8 hours',
]

interface Props {
  onSubmit: (prompt: string) => void
  isLoading: boolean
  error?: string
  onReset?: () => void
}

export function NaturalLanguageInput({ onSubmit, isLoading, error, onReset }: Props) {
  const [prompt, setPrompt] = useState('')
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * EXAMPLES.length))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-[18px] font-medium tracking-tight text-[#202124]">Tesla Trip Planner</h1>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[13px] text-[#1a73e8] font-medium hover:text-[#1765cc] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New trip
          </button>
        )}
      </div>

      {/* Search-card styled textarea */}
      <div className="rounded-xl bg-white shadow-google focus-within:shadow-google-lg transition-shadow">
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={EXAMPLES[placeholderIdx]}
          className="min-h-[92px] bg-transparent border-0 shadow-none resize-none text-sm rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 text-[#202124] placeholder:text-[#80868b]"
          disabled={isLoading}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
        />
      </div>

      {error && (
        <p className="text-[13px] text-[#d93025] flex items-center gap-1.5">
          {error}
          {onReset && (
            <button type="button" onClick={onReset} className="underline hover:no-underline font-medium">
              Try again
            </button>
          )}
        </p>
      )}

      <Button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full h-11 rounded-full bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-medium shadow-google disabled:shadow-none"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Planning route…</>
        ) : (
          <><Navigation className="w-4 h-4 mr-2" />Plan my trip</>
        )}
      </Button>

      <p className="text-[12px] text-[#5f6368] leading-snug">
        Add constraints like <span className="text-[#202124]">“max 9h/day”</span>,{' '}
        <span className="text-[#202124]">“only food stops”</span>,{' '}
        <span className="text-[#202124]">“scenic route”</span>, or{' '}
        <span className="text-[#202124]">“avoid highways”</span>.
        Press <kbd className="px-1 py-px bg-[#f1f3f4] rounded text-[10px] text-[#5f6368]">⌘↵</kbd> to submit.
      </p>
    </form>
  )
}
