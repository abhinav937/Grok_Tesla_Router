import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Fill treatment (ignored when `stop` is set). */
  variant?: 'solid' | 'subtle' | 'outline';
  /** Semantic color (ignored when `stop` is set). */
  tone?: 'accent' | 'neutral' | 'success' | 'danger';
  /** Stop-type chip: tinted text + 16% bg + 32% border, matching map markers. */
  stop?: 'food' | 'charging' | 'scenic' | 'rest' | 'attraction';
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Uppercase + wide tracking (section labels like "DAY 1", "TRIP NOTES"). */
  uppercase?: boolean;
  children?: React.ReactNode;
}

/** Pill label. Use `stop` for route-stop type chips, `tone`+`variant` otherwise. */
export function Badge(props: BadgeProps): JSX.Element;
