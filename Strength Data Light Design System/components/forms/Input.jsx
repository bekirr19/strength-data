import React from 'react';

/**
 * Input — text field with optional leading icon and trailing slot.
 * Light fill, hairline border, blue focus ring. Used across auth, search,
 * exercise editing, and body-weight entry.
 */
export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon = null,
  trailing = null,
  disabled = false,
  inputMode,
  ariaLabel,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 48,
        padding: '0 14px',
        background: 'var(--surface-card)',
        border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focused ? '0 0 0 3px var(--ring)' : 'var(--shadow-xs)',
        transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)', flexShrink: 0 }}>{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        aria-label={ariaLabel}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--text-primary)',
          ...inputStyle,
        }}
        {...rest}
      />
      {trailing && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{trailing}</span>}
    </div>
  );
}
