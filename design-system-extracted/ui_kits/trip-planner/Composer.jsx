/* Composer — the idle hero. A floating glass card with the brand row,
   a "Where to?" prompt, the natural-language textarea, example chips,
   and the Plan route CTA. */

function Composer({ value, onChange, onSubmit }) {
  const ta = React.useRef(null);
  const canSubmit = value.trim().length > 0;

  const submit = () => { if (canSubmit) onSubmit(); };

  return (
    <div className="composer anim-rise-soft">
      <div className="composer-brand">
        <span className="brand-orb"><Icon name="Zap" size={15} color="var(--accent-fg)" fill="var(--accent-fg)" /></span>
        <span className="composer-brandname">Tesla Trip Planner</span>
        <span className="model-tag mono">GROK&nbsp;3</span>
      </div>

      <h1 className="composer-hero">Where to?</h1>
      <p className="composer-sub">Describe the trip in a sentence — Grok plans the route, stops, and charging.</p>

      <div className="composer-field">
        <textarea
          ref={ta}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Madison WI to Austin TX, BBQ stop in Kansas City, scenic through the Hill Country…"
          rows={2}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(); }}
        />
      </div>

      <div className="composer-chips">
        {window.EXAMPLE_PROMPTS.map((p, i) => (
          <button key={i} className="chip" onClick={() => onChange(p)}>
            <Icon name="Sparkles" size={11} color="var(--accent)" />
            {p}
          </button>
        ))}
      </div>

      <div className="composer-foot">
        <span className="composer-hint">Try <em>“max 9h/day”</em> · <em>“scenic route”</em> · <em>“food stops only”</em></span>
        <button className="btn-plan" disabled={!canSubmit} onClick={submit}>
          Plan route<Icon name="ArrowRight" size={15} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Composer });
