/* App — orchestrates the full flow:
   idle → thinking (Grok stream) → routing (route draws) → done (cards stagger).
   Owns timers; children are presentational. */

const RAF = (cb) => requestAnimationFrame(cb);

function App() {
  const trip = window.TRIP;
  const allStops = React.useMemo(() => window.buildStops(trip), []);

  const [phase, setPhase] = React.useState('idle'); // idle | thinking | routing | done
  const [prompt, setPrompt] = React.useState(trip.prompt);
  const [traceText, setTraceText] = React.useState('');
  const [tokens, setTokens] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [routeProgress, setRouteProgress] = React.useState(0);
  const [showMarkers, setShowMarkers] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(null);
  const [satellite, setSatellite] = React.useState(false);

  const timers = React.useRef([]);
  const addT = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  React.useEffect(() => () => clearAll(), []);

  const start = (text) => {
    setPrompt(text);
    setPhase('thinking');
    setTraceText('');
    setTokens(0);
    setElapsed(0);
    setRouteProgress(0);
    setShowMarkers(false);
    setHighlighted(null);

    // Stream the reasoning chunks word-by-word for a believable typewriter feel.
    const full = trip.reasoning.join('');
    const words = full.split(/(\s+)/); // keep whitespace tokens
    let wi = 0;
    const startTs = performance.now();

    const tick = () => {
      if (wi >= words.length) {
        // thinking finished → brief pause → route draws
        setElapsed((performance.now() - startTs) / 1000);
        addT(() => beginRouting(startTs), 650);
        return;
      }
      wi += 1;
      setTraceText(words.slice(0, wi).join(''));
      setTokens(Math.round((wi / words.length) * trip.usage.reasoning_tokens));
      setElapsed((performance.now() - startTs) / 1000);
      addT(tick, 18 + Math.random() * 34);
    };
    addT(tick, 400);
  };

  const beginRouting = (startTs) => {
    setPhase('routing');
    setTokens(trip.usage.reasoning_tokens);
    // animate the polyline draw
    const dur = 1350;
    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      setRouteProgress(ease(p));
      if (p < 1) RAF(step);
      else {
        setShowMarkers(true);
        addT(() => setPhase('done'), 480);
      }
    };
    RAF(step);
  };

  const newTrip = () => {
    clearAll();
    setPhase('idle');
    setPrompt(trip.prompt);
    setTraceText('');
    setTokens(0);
    setRouteProgress(0);
    setShowMarkers(false);
    setHighlighted(null);
  };

  const trace = {
    text: traceText,
    isThinking: phase === 'thinking',
    tokens,
    elapsed,
    usage: phase === 'done' ? trip.usage : null,
    toolCall: (phase === 'routing' || phase === 'done')
      ? { origin: trip.origin.name, destination: trip.destination.name, stops: trip.waypoints.length }
      : null,
  };

  const showPanel = phase !== 'idle';

  return (
    <div className="app">
      <MapStage
        stops={allStops}
        progress={routeProgress}
        showMarkers={showMarkers}
        highlighted={highlighted}
        onHighlight={setHighlighted}
        satellite={satellite}
      />

      {/* top-right map controls */}
      <div className="map-controls">
        <button className={`mapctl ${satellite ? 'on' : ''}`} onClick={() => setSatellite(s => !s)} title="Map style">
          <Icon name="Layers" size={16} />
        </button>
        <button className="mapctl" title="Recenter"><Icon name="Crosshair" size={16} /></button>
        <div className="mapctl-stack">
          <button className="mapctl" title="Zoom in"><Icon name="Plus" size={16} /></button>
          <button className="mapctl" title="Zoom out"><Icon name="Minus" size={16} /></button>
        </div>
      </div>

      {/* routing flash badge */}
      {phase === 'routing' && (
        <div className="route-flash">
          <Spinner size={14} /> Calculating route…
        </div>
      )}

      {/* idle composer */}
      {phase === 'idle' && (
        <div className="composer-wrap">
          <Composer value={prompt} onChange={setPrompt} onSubmit={() => start(prompt || window.EXAMPLE_PROMPTS[0])} />
        </div>
      )}

      {/* left panel — mounts (and slides in) only when a trip is active */}
      {showPanel && (
        <div className="panel-wrap">
          <TripPanel
            phase={phase}
            stops={allStops}
            trace={trace}
            highlighted={highlighted}
            onHighlight={setHighlighted}
            onNewTrip={newTrip}
          />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { App });
