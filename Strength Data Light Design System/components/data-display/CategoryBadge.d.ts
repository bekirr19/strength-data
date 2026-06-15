import * as React from 'react';

export type Category = 'push' | 'pull' | 'leg' | 'other';

export interface CategoryBadgeProps {
  /** @default "other" */
  category?: Category;
  /** Override text (e.g. "Upper", "Full") while keeping the colour. */
  label?: string;
  /** Show a leading colour dot. @default false */
  dot?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Makes it a button (e.g. tap to jump to previous same-type day). */
  onClick?: () => void;
  style?: React.CSSProperties;
}

export declare const CATEGORY_COLORS: Record<Category, { tint: string; fg: string; dot: string; label: string }>;

/** Workout/exercise category tint: push=orange, pull=blue, leg=indigo, other=gray. */
export function CategoryBadge(props: CategoryBadgeProps): React.JSX.Element;
