import React from 'react';

/** Switch — compact toggle. Accent-blue track when on. */
export function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={className}
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        position: 'relative',
        width: 38,
        height: 22,
        flex: '0 0 auto',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: checked ? 'var(--accent)' : 'var(--surface-raised)',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1px var(--border-default)',
        transition: 'background var(--duration-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: checked ? 19 : 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: checked ? '#000' : '#fff',
        boxShadow: 'var(--shadow-marker)',
        transition: 'left var(--duration-base) var(--ease-out)',
      }} />
    </button>
  );
}
