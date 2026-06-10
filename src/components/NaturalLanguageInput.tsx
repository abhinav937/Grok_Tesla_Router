'use client'
import { useState } from 'react'
import { Loader2, Zap, X } from 'lucide-react'

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
    <form onSubmit={handleSubmit}>
      <div className="bg-[#111215]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-float overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div className="w-7 h-7 rounded-full bg-[#4DA6FF] flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-black" fill="currentColor" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">Tesla Trip Planner</span>
          <span className="ml-auto text-[11px] text-white/25 font-mono tracking-wide">GROK 3</span>
        </div>

        <div className="h-px bg-white/[0.06] mx-0" />

        {/* Textarea */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={EXAMPLES[placeholderIdx]}
            rows={3}
            className="w-full bg-transparent border-0 outline-none resize-none text-[14px] text-white placeholder:text-white/20 leading-relaxed"
            disabled={isLoading}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-2">
            <p className="text-[12px] text-red-400 leading-snug">{error}</p>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-white/30 hover:text-white/60 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 flex items-center gap-3">
          <p className="text-[11px] text-white/20 flex-1 leading-snug">
            Try{' '}
            <span className="text-white/35">&ldquo;max 9h/day&rdquo;</span>
            {' · '}
            <span className="text-white/35">&ldquo;scenic route&rdquo;</span>
            {' · '}
            <span className="text-white/35">&ldquo;food stops only&rdquo;</span>
          </p>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="flex items-center gap-2 px-5 h-9 rounded-full bg-[#4DA6FF] text-black text-[13px] font-bold hover:bg-[#2B7FDB] hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Planning…</>
            ) : (
              <>Plan route</>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
