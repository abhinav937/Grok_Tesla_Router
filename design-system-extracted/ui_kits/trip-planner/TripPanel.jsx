/* TripPanel — the left glass panel. Header + reasoning trace while planning;
   trip summary metric, staggered stop cards, trip notes, and the Tesla
   handoff CTA once the route is ready. */

function TripPanel({ phase, stops, trace, highlighted, onHighlight, onNewTrip }) {
  const trip = window.TRIP;
  const done = phase === 'done';
  const planning = phase === 'thinking' || phase === 'routing';

  return (
    <aside className="panel">
      <header className="panel-head">
        <span className="brand-orb"><Icon name="Zap" size={15} color="var(--accent-fg)" fill="var(--accent-fg)" /></span>
        <span className="panel-title">Trip Plan</span>
        <span className="model-tag mono">GROK&nbsp;3</span>
        <button className="newtrip-btn" onClick={onNewTrip}>
          <Icon name="X" size={13} />New trip
        </button>
      </header>

      <div className="panel-scroll">
        {(planning || done) && <ThinkingTrace {...trace} />}

        {done && (
          <>
            <section className="summary anim-rise">
              <div className="summary-top">
                <div className="summary-metric">
                  <span className="summary-time">{trip.total.time}</span>
                  <span className="summary-dist mono">{trip.total.dist}</span>
                </div>
                <div className="summary-days">
                  <Icon name="Sunrise" size={13} color="var(--accent)" />
                  <span>{trip.total.days} days</span>
                </div>
              </div>
              <div className="summary-route">
                <b>{trip.origin.name}</b>
                <Icon name="ArrowRight" size={13} color="var(--text-subtle)" />
                <b>{trip.destination.name}</b>
                <span className="summary-stops">· {trip.waypoints.length} stops</span>
              </div>
              <div className="summary-stats mono">
                <span><Icon name="Route" size={12} color="var(--text-subtle)" /> {trip.total.dist}</span>
                <span><Icon name="BatteryCharging" size={12} color="var(--stop-charging)" /> {trip.total.kwh}</span>
                <span><Icon name="Clock" size={12} color="var(--text-subtle)" /> {trip.total.time}</span>
              </div>
            </section>

            <div className="stop-list">
              {stops.map((s, i) => (
                <div key={i} className="anim-rise" style={{ animationDelay: `${120 + i * 80}ms` }}>
                  <StopCard stop={s} highlighted={highlighted === s.index} onHighlight={onHighlight} />
                </div>
              ))}
            </div>

            <section className="notes anim-rise" style={{ animationDelay: `${120 + stops.length * 80}ms` }}>
              <div className="notes-head">
                <Icon name="Info" size={13} color="var(--accent)" />
                <span>Trip notes</span>
              </div>
              {trip.notes.map((n, i) => <p key={i} className="note">{n}</p>)}
            </section>

            <section className="handoff anim-rise" style={{ animationDelay: `${180 + stops.length * 80}ms` }}>
              <button className="btn-tesla">
                <Icon name="Navigation" size={16} />Open in Google Maps
                <Icon name="ExternalLink" size={13} style={{ opacity: 0.5 }} />
              </button>
              <div className="handoff-hint">
                To send to your car: <b>Share</b> <span className="dim">→</span> <b>Tesla app</b> <span className="dim">→</span> <b>Send to Car</b>
              </div>
            </section>
          </>
        )}

        <div style={{ height: 16 }} />
      </div>
    </aside>
  );
}

Object.assign(window, { TripPanel });
