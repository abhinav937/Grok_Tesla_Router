'use client'
import { useState } from 'react'
import { Loader2, Zap, X, ArrowRight, Sparkles } from 'lucide-react'

const EXAMPLES = [
  'Madison WI to Austin TX, max 9 hours driving per day, BBQ stop in Kansas City, scenic through Texas Hill Country',
  'San Francisco to Portland OR, coastal Hwy 1, food stops only, avoid big cities',
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
    <form onSubmit={handleSubmit} className="composer-wrap">
      <div className="composer anim-rise-soft">
        {/* Brand row */}
        <div className="composer-brand">
          <span className="brand-orb">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-fg)' }} />
          </span>
          <span className="composer-brandname">Tesla Trip Planner</span>
          <span className="model-tag mono">GROK&nbsp;3</span>
        </div>

        <h1 className="composer-hero">Where to?</h1>
        <p className="composer-sub">Describe the trip in a sentence — Grok plans the route, stops, and charging.</p>

        {/* Field */}
        <div className="composer-field">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={EXAMPLES[placeholderIdx]}
            rows={2}
            className="w-full bg-transparent border-0 outline-none resize-none text-[14px] text-white placeholder:text-white/20 leading-relaxed"
            disabled={isLoading}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
          />
        </div>

        {/* Chips */}
        <div className="composer-chips">
          {EXAMPLES.map((p, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              onClick={() => setPrompt(p)}
              disabled={isLoading}
            >
              <Sparkles className="w-2.5 h-2.5" style={{ color: 'var(--accent)' }} />
              {p.length > 58 ? p.slice(0, 55) + '…' : p}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-2 text-[12px] text-red-400">
            <span>{error}</span>
            {onReset && (
              <button type="button" onClick={onReset} className="text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="composer-foot">
          <span className="composer-hint">
            Try <em>“max 9h/day”</em> · <em>“scenic route”</em> · <em>“food stops only”</em>
          </span>
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="btn-plan"
          >
            {isLoading ? (
              <>Planning… <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : (
              <>Plan route <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
