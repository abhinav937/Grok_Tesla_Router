/* StopCard — premium card led by full-bleed photography with a gradient
   scrim + grain. Letter badge ties it to the map marker; type chip,
   reason, and the leg-after row complete it. Graceful colored fallback
   when the photo can't load. */

function StopCard({ stop, highlighted, onHighlight }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const meta = window.STOP_META[stop.type] || window.STOP_META.endpoint;
  const color = window.RAW_STOP_COLOR[stop.type] || window.RAW_STOP_COLOR.endpoint;
  const seed = stop.seed || stop.name.toLowerCase().replace(/[^a-z]/g, '');
  const photo = `https://picsum.photos/seed/${seed}ttp/560/280`;
  const chipLabel = stop.isEndpoint ? (stop.isOrigin ? 'Start' : 'End') : meta.label;

  return (
    <div
      className={`stop-card ${highlighted ? 'is-hot' : ''}`}
      onMouseEnter={() => onHighlight && onHighlight(stop.index)}
      onMouseLeave={() => onHighlight && onHighlight(null)}
    >
      <div className="stop-photo">
        {!error ? (
          <img
            src={photo} alt={stop.name}
            className={loaded ? 'loaded' : ''}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
          />
        ) : (
          <div className="stop-photo-fallback" style={{ background: `linear-gradient(150deg, ${color}26, var(--surface-card) 72%)` }} />
        )}
        {!loaded && !error && <span className="stop-photo-spin"><Spinner size={18} /></span>}
        <div className="stop-photo-scrim" />
        <div className="stop-grain" />

        <span className="stop-badge" style={{ background: color }}>{stop.label}</span>
        <span className="stop-chip" style={{ color, background: `${color}22`, borderColor: `${color}44` }}>
          <Icon name={meta.icon} size={11} />{chipLabel}
        </span>
        {stop.detour ? <span className="stop-detour mono">+{stop.detour}m</span> : null}
      </div>

      <div className="stop-body">
        <div className="stop-name">{stop.name}</div>
        <div className="stop-region">{stop.region}</div>
        {stop.reason && <p className="stop-reason">{stop.reason}</p>}

        {stop.legAfter && (
          <div className="stop-leg">
            <div className="stop-leg-stats mono">
              <span className="leg-strong">{stop.legAfter.dist}</span>
              <span className="leg-sep">·</span>
              <span>{stop.legAfter.time}</span>
              <span className="leg-sep">·</span>
              <span className="leg-via">{stop.legAfter.via}</span>
            </div>
            <button className="stop-map-btn" onClick={(e) => { e.stopPropagation(); onHighlight && onHighlight(stop.index); }}>
              <Icon name="Navigation" size={12} />Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { StopCard });
