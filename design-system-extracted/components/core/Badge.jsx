import React from 'react';

/* Stop-type palette — mirrors the route markers + sidebar cards. */
const STOP_COLORS = {
  food: 'var(--stop-food)',
  charging: 'var(--stop-charging)',
  scenic: 'var(--stop-scenic)',
  rest: 'var(--stop-rest)',
  attraction: 'var(--stop-attraction)',
};

/**
 * Badge — pill label. Three flavours:
 *  - variant="solid|subtle|outline"  with tone "accent|neutral|success|danger"
 *  - stop="food|charging|scenic|rest|attraction"  → tinted stop-type chip
 */
export function Badge({
  variant = 'subtle',
  tone = 'neutral',
  stop = null,
  icon = null,
  uppercase = false,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 9px',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-micro)',
    fontWeight: 'var(--weight-semibold)',
    lineHeight: 1.4,
    letterSpacing: uppercase ? 'var(--tracking-widest)' : 'var(--tracking-normal)',
    textTransform: uppercase ? 'uppercase' : 'none',
    borderRadius: 'var(--radius-full)',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
  };

  // Stop-type tinted chip (color + 18% bg + 30% border)
  if (stop) {
    const c = STOP_COLORS[stop] || 'var(--accent)';
    return (
      <span className={className} style={{
        ...base,
        color: c,
        background: `color-mix(in srgb, ${c} 16%, transparent)`,
        borderColor: `color-mix(in srgb, ${c} 32%, transparent)`,
        ...style,
      }} {...rest}>
        {icon}{children}
      </span>
    );
  }

  const tones = {
    accent:  'var(--accent)',
    neutral: 'var(--text-secondary)',
    success: 'var(--success)',
    danger:  'var(--danger)',
  };
  const c = tones[tone] || tones.neutral;

  const styles = {
    solid:   { background: c, color: tone === 'neutral' ? 'var(--surface-bg)' : '#000', borderColor: 'transparent' },
    subtle:  { background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c, borderColor: `color-mix(in srgb, ${c} 22%, transparent)` },
    outline: { background: 'transparent', color: c, borderColor: 'var(--border-default)' },
  };

  return (
    <span className={className} style={{ ...base, ...styles[variant], ...style }} {...rest}>
      {icon}{children}
    </span>
  );
}
