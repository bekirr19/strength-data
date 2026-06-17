import * as React from 'react';

/**
 * @startingPoint section="Buttons" subtitle="Primary, secondary, ghost & danger actions" viewport="700x200"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon node (e.g. a Lucide <Plus/>). */
  icon?: React.ReactNode;
  /** Trailing icon node (e.g. <ArrowRight/>). */
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Primary action button — blue primary, white secondary, ghost, and danger variants. */
export function Button(props: ButtonProps): React.JSX.Element;
