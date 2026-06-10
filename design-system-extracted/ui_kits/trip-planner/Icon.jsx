/* Icon — self-contained inline SVG set (no external icon lib).
   Each entry is the inner markup of a 24×24 lucide-style glyph.
   Keeps the prototype dependency-free and animation-safe. */

const ICONS = {
  Zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  Sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18"/>',
  Brain: '<path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 5 2 3 3 0 0 0 5-2 3 3 0 0 0-2-5 3 3 0 0 0-3-3Z"/><path d="M12 5v14"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  ChevronUp: '<path d="m18 15-6-6-6 6"/>',
  ChevronDown: '<path d="m6 9 6 6 6-6"/>',
  Sunrise: '<path d="M12 2v6M5.6 10.6 4.2 9.2M18.4 10.6l1.4-1.4M2 18h20M3 22h18M8 18a4 4 0 0 1 8 0"/>',
  Route: '<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h6a3 3 0 0 0 3-3V9"/>',
  Clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  BatteryCharging: '<path d="M10 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2.5M14 7h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2.5"/><path d="M22 11v2"/><path d="m11 7-3 5h4l-3 5"/>',
  Mountain: '<path d="m8 3 4 8 5-5 5 14H2L8 3z"/>',
  Coffee: '<path d="M10 2v3M14 2v3M4 8h14v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z"/><path d="M18 8h2a2 2 0 0 1 0 6h-2"/>',
  Star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.6l6.2-.9z"/>',
  MapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  Navigation: '<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
  ExternalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  Info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  Layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  Crosshair: '<circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  Plus: '<path d="M12 5v14M5 12h14"/>',
  Minus: '<path d="M5 12h14"/>',
};

function Icon({ name, size = 20, strokeWidth = 2, fill = 'none', color, className = '', style = {}, ...rest }) {
  const inner = ICONS[name];
  if (!inner) return <span style={{ display: 'inline-block', width: size, height: size, ...style }} className={className} />;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color || 'currentColor'} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}
      style={{ flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: inner }}
      {...rest}
    />
  );
}

/* Local Spinner (no module export — safe under Babel script tags). */
function Spinner({ size = 20, stroke = 2, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-block', width: size, height: size, borderRadius: '50%',
        border: `${stroke}px solid color-mix(in srgb, var(--accent) 22%, transparent)`,
        borderTopColor: 'var(--accent)', animation: 'ttp-spin 0.7s linear infinite', ...style,
      }}
      {...rest}
    />
  );
}

Object.assign(window, { Icon, Spinner });
