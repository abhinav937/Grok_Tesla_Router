/* ThinkingTrace — the live Grok reasoning panel.
   Presentational: App streams `text` in and ticks `tokens`. Shows a
   pulsing brain while thinking, a mono reasoning stream with caret,
   the tool-call handoff, and a final usage row. */

function ThinkingTrace({ text, isThinking, tokens, elapsed, usage, toolCall }) {
  const scrollRef = React.useRef(null);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (isThinking && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [text, isThinking]);

  React.useEffect(() => {
    if (!isThinking && toolCall) {
      const t = setTimeout(() => setOpen(false), 2600);
      return () => clearTimeout(t);
    }
  }, [isThinking, toolCall]);

  return (
    <div className="trace">
      <button className="trace-head" onClick={() => setOpen(o => !o)}>
        <span className={`trace-orb ${isThinking ? 'is-thinking' : 'is-done'}`}>
          <Icon name={isThinking ? 'Brain' : 'Check'} size={12} color={isThinking ? 'var(--accent-fg)' : '#04210a'} strokeWidth={2.5} />
        </span>
        <span className="trace-title">
          {isThinking ? (
            <>Thinking
              <span className="trace-dots">
                <i style={{ animationDelay: '0ms' }} /><i style={{ animationDelay: '160ms' }} /><i style={{ animationDelay: '320ms' }} />
              </span>
            </>
          ) : 'Reasoning trace'}
        </span>
        <span className="trace-meta mono">
          {(tokens || 0).toLocaleString()} tokens · {(elapsed || 0).toFixed(1)}s
        </span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} color="var(--text-subtle)" />
      </button>

      {open && (
        <div className="trace-body">
          <div className="trace-stream mono" ref={scrollRef}>
            {text}
            {isThinking && <span className="trace-caret" />}
          </div>

          {toolCall && (
            <div className="trace-tool">
              <Icon name="Zap" size={12} color="var(--stop-attraction)" fill="var(--stop-attraction)" />
              <span>Called <b>plan_road_trip</b> · {toolCall.origin} → {toolCall.destination}
                <span className="trace-tool-dim"> ({toolCall.stops} stops)</span>
              </span>
            </div>
          )}

          {usage && (
            <div className="trace-usage mono">
              <span><b>{usage.reasoning_tokens.toLocaleString()}</b> reasoning</span>
              <span><b>{usage.prompt_tokens.toLocaleString()}</b> prompt</span>
              <span><b>{usage.completion_tokens.toLocaleString()}</b> completion</span>
              <span className="trace-usage-total"><b>{usage.total_tokens.toLocaleString()}</b> total</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ThinkingTrace });
