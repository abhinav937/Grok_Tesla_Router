'use client'
import { useRef, useEffect, useState } from 'react'
import { Brain, ChevronDown, ChevronUp, Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TripPlanUsage, TripPlanToolCall } from '@/lib/types'

interface Props {
  thinking: string
  isThinking: boolean
  toolCall: TripPlanToolCall | null
  usage: TripPlanUsage | null
}

export function ThinkingTrace({ thinking, isThinking, toolCall, usage }: Props) {
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-expand while thinking
  useEffect(() => {
    if (isThinking) setExpanded(true)
  }, [isThinking])

  // Auto-collapse 2s after planning completes
  useEffect(() => {
    if (!isThinking && toolCall) {
      const t = setTimeout(() => setExpanded(false), 2000)
      return () => clearTimeout(t)
    }
  }, [isThinking, toolCall])

  // Keep scroll pinned to bottom while streaming
  useEffect(() => {
    if (isThinking && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thinking, isThinking])

  if (!thinking && !isThinking) return null

  const isDone = !isThinking && (toolCall || usage)

  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] overflow-hidden text-xs">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
            isThinking ? 'bg-[#4DA6FF]' : 'bg-green-500/80'
          )}
        >
          <Brain className="w-3 h-3 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {isThinking ? (
            <span className="font-semibold text-[#4DA6FF] flex items-center gap-1.5">
              Thinking
              <span className="flex gap-px mt-px">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="inline-block w-1 h-1 rounded-full bg-[#4DA6FF] animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </span>
          ) : (
            <span className="text-white/35 font-medium">Reasoning trace</span>
          )}
        </div>

        {usage && (
          <span className="text-[10px] text-white/20 shrink-0">
            {usage.reasoning_tokens != null
              ? `${usage.reasoning_tokens.toLocaleString()} thinking`
              : `${usage.total_tokens.toLocaleString()} tokens`}
            {' · '}{(usage.duration_ms / 1000).toFixed(1)}s
          </span>
        )}

        {expanded
          ? <ChevronUp className="w-3 h-3 text-white/25 shrink-0" />
          : <ChevronDown className="w-3 h-3 text-white/25 shrink-0" />
        }
      </button>

      {expanded && (
        <>
          {thinking && (
            <div
              ref={scrollRef}
              className="max-h-44 overflow-y-auto px-3 py-2.5 border-t border-white/[0.06] bg-black/20"
            >
              <p className="font-mono text-[11px] text-white/25 leading-relaxed whitespace-pre-wrap">
                {thinking}
                {isThinking && (
                  <span className="inline-block w-1.5 h-[13px] bg-[#4DA6FF] animate-pulse ml-0.5 align-text-bottom" />
                )}
              </p>
            </div>
          )}

          {toolCall && (
            <div className="px-3 py-2 border-t border-white/[0.06] flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
              <span className="text-white/35">
                Called{' '}
                <span className="font-semibold text-white/55">plan_road_trip</span>
                {' → '}
                <span className="text-white/55">{toolCall.origin}</span>
                {' to '}
                <span className="text-white/55">{toolCall.destination}</span>
                {toolCall.waypoint_count > 0 && (
                  <span className="text-white/25"> ({toolCall.waypoint_count} stops)</span>
                )}
              </span>
            </div>
          )}

          {usage && (
            <div className="px-3 py-2 border-t border-white/[0.06] flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-white/20">
              {usage.reasoning_tokens != null && (
                <span><span className="text-white/45 font-medium">{usage.reasoning_tokens.toLocaleString()}</span> reasoning</span>
              )}
              <span><span className="text-white/45 font-medium">{usage.prompt_tokens.toLocaleString()}</span> prompt</span>
              <span><span className="text-white/45 font-medium">{usage.completion_tokens.toLocaleString()}</span> completion</span>
              <span><span className="text-white/45 font-medium">{usage.total_tokens.toLocaleString()}</span> total</span>
              <span className="ml-auto">
                <span className="text-white/45 font-medium">{(usage.duration_ms / 1000).toFixed(1)}s</span>
              </span>
            </div>
          )}

          {isDone && !usage && (
            <div className="px-3 py-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-green-400/70">
              <Sparkles className="w-3 h-3" />
              Route planned
            </div>
          )}
        </>
      )}
    </div>
  )
}
