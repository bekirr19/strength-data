import * as React from 'react';

export interface NavItem {
  key: string;
  label?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Render this item as the central circular FAB instead of a tab. */
  fab?: boolean;
}

export interface BottomNavPrimary {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/**
 * @startingPoint section="Navigation" subtitle="Floating mobile bottom nav pill" viewport="440x80"
 */
export interface BottomNavProps {
  items: NavItem[];
  primary?: BottomNavPrimary | null;
  activeKey?: string;
  onSelect?: (key: string) => void;
  style?: React.CSSProperties;
}

/** Floating pill bottom navigation — icon tabs plus a prominent primary action. */
export function BottomNav(props: BottomNavProps): React.JSX.Element;
