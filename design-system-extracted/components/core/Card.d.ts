import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface level: solid `card`, inset `well`, floating blurred `glass`. */
  elevation?: 'card' | 'well' | 'glass';
  /** Faint blue trip-notes treatment. */
  accent?: boolean;
  /** Inner padding. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/**
 * Core surface with 12px corners. `card` for content cards, `well` for inset
 * summary rows, `glass` for panels floating over the map.
 *
 * @startingPoint section="Core" subtitle="Surface — card / well / glass elevations" viewport="700x200"
 */
export function Card(props: CardProps): JSX.Element;
