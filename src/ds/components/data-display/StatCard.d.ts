import * as React from 'react';

/**
 * @startingPoint section="Data" subtitle="Labelled metric / PR stat tile" viewport="360x140"
 */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  /** @default "default" */
  tone?: 'default' | 'gold';
  /** Colours the value green/red for positive/negative change. */
  trend?: 'up' | 'down' | null;
  style?: React.CSSProperties;
}

/** Labelled metric tile (Best weight, Strength change, totals). */
export function StatCard(props: StatCardProps): React.JSX.Element;
