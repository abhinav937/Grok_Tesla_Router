import React from 'react';

/** Spinner — accent-ringed loading indicator. */
export function Spinner({ size = 20, stroke = 2, className = '', style = {}, ...rest }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${stroke}px solid color-mix(in srgb, var(--accent) 22%, transparent)`,
        borderTopColor: 'var(--accent)',
        animation: 'ttp-spin 0.7s linear infinite',
        ...style,
      }}
      {...rest}
    >
      <style>{`@keyframes ttp-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
