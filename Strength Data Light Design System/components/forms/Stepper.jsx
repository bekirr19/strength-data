import React from 'react';

/**
 * Stepper — weight/reps editor with -/＋ buttons around a centered value.
 * Bodyweight-aware: the value can read "BW" or "BW+5" as well as a number.
 * Used in the Quick-Edit and Workout Detail set editors.
 */
export function Stepper({
  value,
  onDecrement,
  onIncrement,
  onChange,
  label,
  editable = true,
  width = '100%',
  style = {},
}) {
  return (
    <div style={{ width, ...style }}>
      {label && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-3xs)',
            fontWeight: 'var(--weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--text-tertiary)',
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <StepBtn onClick={onDecrement} ariaLabel="Decrease">−</StepBtn>
        <div
          style={{
            flex: 1,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <input
            value={value}
            onChange={onChange}
            readOnly={!editable}
            inputMode="decimal"
            onFocus={(e) => e.target.select()}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <StepBtn onClick={onIncrement} ariaLabel="Increase">+</StepBtn>
      </div>
    </div>
  );
}

function StepBtn({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="sd-focus-ring"
      style={{
        width: 34,
        height: 40,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-bold)',
        lineHeight: 1,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
