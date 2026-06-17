import * as React from 'react';

export interface FabProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  /** Extended = pill with label; otherwise a circular FAB. @default false */
  extended?: boolean;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Floating action button — circular FAB or extended pill, carries the accent glow. */
export function Fab(props: FabProps): React.JSX.Element;
