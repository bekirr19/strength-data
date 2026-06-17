import * as React from 'react';

export interface SkeletonProps {
  /** @default "line" */
  variant?: 'line' | 'text' | 'title' | 'chip' | 'block' | 'card' | 'avatar';
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
}

/** Shimmer placeholder block for loading states. */
export function Skeleton(props: SkeletonProps): React.JSX.Element;

export interface SkeletonGroupProps {
  /** @default 3 */
  lines?: number;
  gap?: number;
  /** Width of the last line. @default "70%" */
  lastWidth?: string;
  style?: React.CSSProperties;
}

/** Stack of shimmer text lines. */
export function SkeletonGroup(props: SkeletonGroupProps): React.JSX.Element;
