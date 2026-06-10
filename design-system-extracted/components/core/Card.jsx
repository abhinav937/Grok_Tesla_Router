import React from 'react';

/**
 * Card — the core surface. Three elevation levels matched to the product:
 *  - "card"   solid #1A1B1F card on a panel (default)
 *  - "well"   inset 4%-white well used for summaries / metadata rows
 *  - "glass"  floating blurred panel over the map
 * `accent` wraps it in the faint blue trip-notes treatment.
 */
export function Card({
  elevation = 'card',
  accent = false,
  padding = 'md',
  className = '',
  style = {},
  children,
  ...rest
}) {
  const pads = { none: 0, sm: '12px', md: '16px', lg: '20px' };

  const elevations = {
    card: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
    },
    well: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'none',
    },
    glass: {
      background: 'rgba(17,18,21,0.95)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-float)',
      backdropFilter: 'blur(var(--blur-lg))',
    },
  };

  const accentStyle = accent ? {
    background: 'var(--tesla-blue-tint)',
    border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
    boxShadow: 'none',
  } : {};

  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: pads[padding],
        color: 'var(--text-secondary)',
        ...elevations[elevation],
        ...accentStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
