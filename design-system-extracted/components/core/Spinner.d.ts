import * as React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  stroke?: number;
}

/** Accent-ringed loading spinner — route calculation, image loads. */
export function Spinner(props: SpinnerProps): JSX.Element;
