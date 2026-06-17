import * as React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Icon tile tone. @default "neutral" */
  tone?: 'neutral' | 'accent';
  style?: React.CSSProperties;
}

/**
 * Centered icon tile + title + subtitle + optional action for empty/zero states.
 *
 * @startingPoint section="Feedback" subtitle="Empty / zero state placeholder" viewport="420x300"
 */
export function EmptyState(props: EmptyStateProps): React.JSX.Element;
