/* MapStage — the full-bleed premium nav display.
   An abstract dark map field (vignette, dot-grid, drifting glow blobs)
   with an animated cyan route polyline + stop markers in shared SVG space. */

// Catmull-Rom → cubic Bézier so the path passes through every point.
function smoothPath(pts) {
  if (pts.length < 2) return '';
  const d = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`);
  }
  return d.join(' ');
}

function MapStage({ stops, progress, showMarkers, highlighted, onHighlight, satellite }) {
  const lineRef = React.useRef(null);
  const [len, setLen] = React.useState(0);

  const pts = stops.map(s => s.pt);
  const d = React.useMemo(() => smoothPath(pts), [JSON.stringify(pts)]);

  React.useEffect(() => {
    if (lineRef.current) setLen(lineRef.current.getTotalLength());
  }, [d]);

  // cumulative fraction along route for each stop (marker reveal timing)
  const totalMiles = stops.reduce((s, x) => s + (x.legAfter ? x.legAfter.miles : 0), 0) || 1;
  let acc = 0;
  const fractions = stops.map((s) => {
    const f = acc / totalMiles;
    if (s.legAfter) acc += s.legAfter.miles;
    return f;
  });

  const drawn = progress;
  const dashOffset = len * (1 - drawn);

  return (
    <div className="map-stage" data-satellite={satellite ? 'on' : 'off'}>
      <div className="map-grid" />
      <div className="map-glow map-glow-1" />
      <div className="map-glow map-glow-2" />
      <div className="map-glow map-glow-3" />
      <div className="map-vignette" />

      <svg className="map-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-bright)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* faint full route preview so the field never looks empty */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />

        {/* glow underlay */}
        <path
          d={d} fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round"
          opacity="0.35" filter="url(#routeGlow)"
          strokeDasharray={len} strokeDashoffset={dashOffset}
        />
        {/* dark casing */}
        <path
          d={d} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={dashOffset}
        />
        {/* main line */}
        <path
          ref={lineRef} d={d} fill="none" stroke="url(#routeGrad)" strokeWidth="4.5" strokeLinecap="round"
          strokeDasharray={len} strokeDashoffset={dashOffset}
        />

        {/* markers */}
        {stops.map((s, i) => {
          const reveal = showMarkers && drawn >= fractions[i] - 0.001;
          const color = window.RAW_STOP_COLOR[s.type] || window.RAW_STOP_COLOR.endpoint;
          const isHot = highlighted === i;
          const r = s.isEndpoint ? 17 : 14;
          return (
            <g
              key={i}
              transform={`translate(${s.pt[0]} ${s.pt[1]})`}
              className="map-marker"
              data-reveal={reveal ? 'on' : 'off'}
              style={{ cursor: 'pointer' }}
              onClick={() => onHighlight && onHighlight(isHot ? null : i)}
            >
              {isHot && <circle r={r + 14} fill={color} opacity="0.16" className="marker-pulse" />}
              <circle r={r + 5} fill={color} opacity="0.22" />
              <circle r={r} fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
              <text textAnchor="middle" dy="5.5" fontFamily="var(--font-sans)" fontWeight="700"
                fontSize={s.isEndpoint ? 17 : 14} fill="#04201B">{s.label}</text>
              <text
                x="0" y={r + 22} textAnchor="middle"
                fontFamily="var(--font-sans)" fontWeight="600" fontSize="17"
                fill="rgba(255,255,255,0.92)" style={{ paintOrder: 'stroke' }}
                stroke="rgba(0,0,0,0.55)" strokeWidth="3.5"
              >{s.region.split(',')[0]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

Object.assign(window, { MapStage });
