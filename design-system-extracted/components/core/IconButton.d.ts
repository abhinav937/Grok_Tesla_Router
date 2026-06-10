import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Square footprint: 28 / 36 / 44px. */
  size?: 'sm' | 'md' | 'lg';
  /** `ghost` (transparent), `panel` (glass over map), `solid` (carded). */
  variant?: 'ghost' | 'panel' | 'solid';
  /** Fully rounded vs. soft corners. */
  round?: boolean;
  /** Persistent active/selected state. */
  active?: boolean;
  disabled?: boolean;
  /** A single icon node. */
  children?: React.ReactNode;
}

/** Square/circular control holding one icon — map toggles, close, reopen tabs. */
export function IconButton(props: IconButtonProps): JSX.Element;
