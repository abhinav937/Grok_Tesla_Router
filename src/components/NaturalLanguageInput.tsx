'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Navigation } from 'lucide-react'

const EXAMPLES = [
  'Madison WI to Austin TX, BBQ stop in Kansas City, scenic through Texas Hill Country',
  'San Francisco to Portland OR, coastal Hwy 1, wine country near Napa',
  'Chicago to Denver, stop in Omaha for food, keep drive under 10 hours total',
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
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
          <Navigation className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">Tesla Trip Planner</h1>
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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="flex-1 bg-[#CC0000] hover:bg-[#8B0000] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Planning Route…
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Plan My Trip
            </>
          )}
        </Button>
        {onReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="shrink-0"
          >
            Reset
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Describe your trip naturally. Include preferences like food stops, scenic routes, or charging needs.
        Press <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px]">⌘↵</kbd> to submit.
      </p>
    </form>
  )
}
