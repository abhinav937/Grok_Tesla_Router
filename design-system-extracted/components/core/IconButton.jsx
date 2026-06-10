import React from 'react';

/**
 * IconButton — a square/circular control holding a single icon.
 * Used for map toggles, panel close, reopen tabs. Ghost by default.
 */
export function IconButton({
  size = 'md',
  variant = 'ghost',
  round = false,
  active = false,
  disabled = false,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const dims = { sm: 28, md: 36, lg: 44 };
  const d = dims[size];

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: d,
    height: d,
    flex: '0 0 auto',
    border: '1px solid transparent',
    borderRadius: round ? 'var(--radius-full)' : 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    color: active ? 'var(--text-primary)' : 'var(--text-subtle)',
    transition: 'background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
  };

  const variants = {
    ghost:  { background: active ? 'var(--surface-raised)' : 'transparent' },
    panel:  { background: 'rgba(17,18,21,0.9)', borderColor: 'var(--border-default)', backdropFilter: 'blur(var(--blur-sm))' },
    solid:  { background: 'var(--surface-card)', borderColor: 'var(--border-default)' },
  };

  return (
    <button
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = (variants[variant].background || 'transparent'); e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-subtle)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
