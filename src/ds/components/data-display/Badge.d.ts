import * as React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'blue' | 'green' | 'gold' | 'cyan' | 'red';
  /** Filled instead of tinted. @default false */
  solid?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Small status/label pill. Use CategoryBadge for workout category tints. */
export function Badge(props: BadgeProps): React.JSX.Element;
