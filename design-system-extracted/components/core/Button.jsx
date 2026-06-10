import React from 'react';

/**
 * Button — the Tesla Trip Planner action control.
 * Pill-shaped by default; the electric-blue `primary` fill carries the
 * main action, `white` is the high-emphasis CTA (e.g. "Open in Google Maps").
 */
export function Button({
  variant = 'primary',
  size = 'md',
  pill = true,
  icon = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
  children,
  ...rest
}) {
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };
  const pads = { sm: '0 14px', md: '0 18px', lg: '0 22px' };
  const fonts = { sm: 'var(--text-meta)', md: 'var(--text-sm)', lg: 'var(--text-body)' };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: heights[size],
    padding: pads[size],
    fontFamily: 'var(--font-sans)',
    fontSize: fonts[size],
    fontWeight: 'var(--weight-bold)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    border: '1px solid transparent',
    borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    transition: 'background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
    userSelect: 'none',
  };

  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--accent-fg)' },
    white:   { background: '#fff', color: '#000' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' },
    ghost:   { background: 'transparent', color: 'var(--text-subtle)' },
    outline: { background: 'transparent', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' },
    destructive: { background: 'var(--destructive)', color: 'var(--destructive-fg)' },
  };

  const hoverFor = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === 'primary') { el.style.background = on ? 'var(--accent-hover)' : 'var(--accent)'; el.style.color = on ? '#fff' : 'var(--accent-fg)'; }
    else if (variant === 'white') { el.style.background = on ? 'rgba(255,255,255,0.9)' : '#fff'; }
    else if (variant === 'secondary' || variant === 'outline') { el.style.background = on ? 'var(--surface-raised)' : (variant === 'secondary' ? 'var(--surface-card)' : 'transparent'); el.style.color = on ? 'var(--text-primary)' : 'var(--text-secondary)'; }
    else if (variant === 'ghost') { el.style.background = on ? 'var(--surface-raised)' : 'transparent'; el.style.color = on ? 'var(--text-primary)' : 'var(--text-subtle)'; }
    else if (variant === 'destructive') { el.style.background = on ? '#b81f1a' : 'var(--destructive)'; }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => hoverFor(e, true)}
      onMouseLeave={(e) => hoverFor(e, false)}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
