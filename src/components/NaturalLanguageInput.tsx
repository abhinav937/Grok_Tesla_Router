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
          <div className="w-7 h-7 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Tesla Trip Planner</h1>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            New trip
          </button>
        )}
      </div>

      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={EXAMPLES[placeholderIdx]}
        className="min-h-[96px] bg-secondary border-border resize-none text-sm"
        disabled={isLoading}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit(e as unknown as React.FormEvent)
          }
        }}
      />

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          {error}
          {onReset && (
            <button type="button" onClick={onReset} className="underline hover:no-underline">
              Try again
            </button>
          )}
        </p>
      )}

      <Button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full h-11 bg-[#CC0000] hover:bg-[#8B0000] text-white text-sm font-semibold"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Planning Route…</>
        ) : (
          <><Navigation className="w-4 h-4 mr-2" />Plan My Trip</>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground leading-snug">
        Add constraints like <span className="text-foreground/70">"max 9h/day"</span>,{' '}
        <span className="text-foreground/70">"only food stops"</span>,{' '}
        <span className="text-foreground/70">"scenic route"</span>, or{' '}
        <span className="text-foreground/70">"avoid highways"</span>.
        Press <kbd className="px-1 py-px bg-secondary rounded text-[10px]">⌘↵</kbd> to submit.
      </p>
    </form>
  )
}
