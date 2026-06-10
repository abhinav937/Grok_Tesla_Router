import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = electric-blue fill, `white` = high-emphasis CTA. */
  variant?: 'primary' | 'white' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Fully rounded pill (default) vs. soft 10px corners. */
  pill?: boolean;
  /** Leading icon node (e.g. a lucide icon). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Pill-shaped action button. Electric-blue `primary` carries the main action;
 * `white` is reserved for the single highest-emphasis CTA on a surface.
 *
 * @startingPoint section="Core" subtitle="Pill action button — primary, white, ghost" viewport="700x180"
 */
export function Button(props: ButtonProps): JSX.Element;
