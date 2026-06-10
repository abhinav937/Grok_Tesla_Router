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
  const [expanded, setExpanded] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    <div className="rounded-lg border border-border bg-card overflow-hidden text-xs">
      {/* Header row */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
            isThinking ? 'bg-[#CC0000]' : 'bg-green-900'
          )}
        >
          <Brain className="w-3 h-3 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {isThinking ? (
            <span className="font-medium text-[#CC0000] flex items-center gap-1">
              Thinking
              <span className="flex gap-px mt-px">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="inline-block w-1 h-1 rounded-full bg-[#CC0000] animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground font-medium">Reasoning trace</span>
          )}
        </div>

        {usage && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {usage.reasoning_tokens != null ? `${usage.reasoning_tokens} thinking` : `${usage.total_tokens} tokens`}
            {' · '}{(usage.duration_ms / 1000).toFixed(1)}s
          </span>
        )}

        {expanded ? (
          <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <>
          {/* Reasoning text */}
          {thinking && (
            <div
              ref={scrollRef}
              className="max-h-44 overflow-y-auto px-3 py-2.5 border-t border-border bg-black/20"
            >
              <p className="font-mono text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {thinking}
                {isThinking && (
                  <span className="inline-block w-1.5 h-[13px] bg-[#CC0000] animate-pulse ml-0.5 align-text-bottom" />
                )}
              </p>
            </div>
          )}

          {/* Tool call row */}
          {toolCall && (
            <div className="px-3 py-2 border-t border-border flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
              <span className="text-muted-foreground">
                Called{' '}
                <span className="font-medium text-foreground">plan_road_trip</span>
                {' → '}
                <span className="text-foreground">{toolCall.origin}</span>
                {' to '}
                <span className="text-foreground">{toolCall.destination}</span>
                {toolCall.waypoint_count > 0 && (
                  <span className="text-muted-foreground"> ({toolCall.waypoint_count} stops)</span>
                )}
              </span>
            </div>
          )}

          {/* Token / timing stats */}
          {usage && (
            <div className="px-3 py-2 border-t border-border flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
              {usage.reasoning_tokens != null && (
                <span><span className="text-foreground font-medium">{usage.reasoning_tokens}</span> reasoning</span>
              )}
              <span><span className="text-foreground font-medium">{usage.prompt_tokens}</span> prompt</span>
              <span><span className="text-foreground font-medium">{usage.completion_tokens}</span> completion</span>
              <span><span className="text-foreground font-medium">{usage.total_tokens}</span> total</span>
              <span className="ml-auto"><span className="text-foreground font-medium">{(usage.duration_ms / 1000).toFixed(1)}s</span></span>
            </div>
          )}

          {isDone && !usage && (
            <div className="px-3 py-2 border-t border-border flex items-center gap-1.5 text-[10px] text-green-400">
              <Sparkles className="w-3 h-3" />
              Route planned
            </div>
          )}
        </>
      )}
    </div>
  )
}
