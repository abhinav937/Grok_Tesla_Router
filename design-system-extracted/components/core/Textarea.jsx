import React from 'react';

/**
 * Textarea — the natural-language trip input. Borderless inside its own
 * surface by default (the floating composer); pass framed to get a bordered well.
 */
export function Textarea({
  framed = false,
  rows = 3,
  className = '',
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  const base = {
    width: '100%',
    resize: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-body)',
    lineHeight: 'var(--leading-relaxed)',
    color: 'var(--text-primary)',
    background: framed ? 'var(--surface-raised)' : 'transparent',
    border: framed ? `1px solid ${focused ? 'var(--accent)' : 'var(--border-default)'}` : 'none',
    borderRadius: framed ? 'var(--radius-md)' : 0,
    padding: framed ? '12px 14px' : 0,
    outline: 'none',
    boxShadow: framed && focused ? 'var(--glow-accent)' : 'none',
    transition: 'border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)',
  };

  return (
    <textarea
      rows={rows}
      className={className}
      style={{ ...base, ...style }}
      onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
      {...rest}
    />
  );
}
