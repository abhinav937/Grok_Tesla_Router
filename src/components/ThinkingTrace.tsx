'use client'
import { useRef, useEffect, useState } from 'react'
import { Brain, ChevronDown, ChevronUp, Zap } from 'lucide-react'
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
    <div className="trace">
      <button className="trace-head" onClick={() => setExpanded(e => !e)}>
        <span className={`trace-orb ${isThinking ? 'is-thinking' : 'is-done'}`}>
          <Brain className="w-3 h-3" style={{ color: isThinking ? 'var(--accent-fg)' : '#04210a' }} />
        </span>
        <span className="trace-title">
          {isThinking ? (
            <>Thinking
              <span className="trace-dots">
                <i style={{ animationDelay: '0ms' }} />
                <i style={{ animationDelay: '160ms' }} />
                <i style={{ animationDelay: '320ms' }} />
              </span>
            </>
          ) : 'Reasoning trace'}
        </span>
        <span className="trace-meta mono">
          {(usage?.total_tokens || 0).toLocaleString()} tokens · {((usage?.duration_ms || 0) / 1000).toFixed(1)}s
        </span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />
          : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />}
      </button>

      {expanded && (
        <div className="trace-body">
          {thinking && (
            <div ref={scrollRef} className="trace-stream mono">
              {thinking}
              {isThinking && <span className="trace-caret" />}
            </div>
          )}

          {toolCall && (
            <div className="trace-tool">
              <Zap className="w-3 h-3" style={{ color: 'var(--stop-attraction)' }} />
              <span>
                Called <b>plan_road_trip</b> · {toolCall.origin} → {toolCall.destination}
                <span className="trace-tool-dim"> ({toolCall.waypoint_count} stops)</span>
              </span>
            </div>
          )}

          {usage && (
            <div className="trace-usage mono">
              {usage.reasoning_tokens != null && (
                <span><b>{usage.reasoning_tokens.toLocaleString()}</b> reasoning</span>
              )}
              <span><b>{usage.prompt_tokens.toLocaleString()}</b> prompt</span>
              <span><b>{usage.completion_tokens.toLocaleString()}</b> completion</span>
              <span className="trace-usage-total"><b>{usage.total_tokens.toLocaleString()}</b> total</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
