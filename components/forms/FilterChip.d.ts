import * as React from 'react';

export interface FilterChipProps {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  /** Active fill colour (defaults to accent; pass a category token). */
  accent?: string | null;
  icon?: React.ReactNode;
  /** Trailing count. */
  count?: number | null;
  /** @default "md" */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** Pill toggle for category filters and multi-selects — active = accent fill. */
export function FilterChip(props: FilterChipProps): React.JSX.Element;
