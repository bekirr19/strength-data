import * as React from 'react';

/**
 * @startingPoint section="Layout" subtitle="Rounded white surface container" viewport="420x200"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Inner padding. @default "lg" */
  pad?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Adds hover lift for tappable rows. @default false */
  interactive?: boolean;
  /** Subtle accent panel instead of white (fuel/notes/highlight). */
  tint?: 'accent' | 'sunken' | 'gold' | null;
  as?: keyof React.JSX.IntrinsicElements;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** White rounded surface (rounded-3xl) with a soft shadow — the base container. */
export function Card(props: CardProps): React.JSX.Element;
