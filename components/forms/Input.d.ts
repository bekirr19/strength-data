import * as React from 'react';

/**
 * @startingPoint section="Forms" subtitle="Text field with icon & focus ring" viewport="700x120"
 */
export interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** Leading icon node (e.g. Lucide <Mail/>, <Search/>). */
  icon?: React.ReactNode;
  /** Trailing slot — e.g. a show/hide-password IconButton or a unit. */
  trailing?: React.ReactNode;
  disabled?: boolean;
  inputMode?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

/** Text field with optional leading icon and trailing slot, blue focus ring. */
export function Input(props: InputProps): React.JSX.Element;
