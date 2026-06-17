import React from 'react';

/**
 * WorkoutTypeBadge — workout focus label covering single focuses
 * (push / pull / leg / other) AND combinations with their own calm light
 * tints: upper (Push+Pull), legPush (Leg+Push), legPull (Leg+Pull),
 * full (Full Body). Derive the type from a focus array with workoutTypeOf().
 */
export const WORKOUT_TYPE_COLORS = {
  push: { tint: 'var(--push-tint)', fg: 'var(--push-700)', dot: 'var(--push-500)', label: 'Push' },
  pull: { tint: 'var(--pull-tint)', fg: 'var(--pull-700)', dot: 'var(--pull-500)', label: 'Pull' },
  leg: { tint: 'var(--leg-tint)', fg: 'var(--leg-700)', dot: 'var(--leg-500)', label: 'Leg' },
  other: { tint: 'var(--other-tint)', fg: 'var(--other-700)', dot: 'var(--other-500)', label: 'Other' },
  upper: { tint: 'var(--upper-tint)', fg: 'var(--upper-700)', dot: 'var(--upper-500)', label: 'Upper' },
  legPush: { tint: 'var(--legpush-tint)', fg: 'var(--legpush-700)', dot: 'var(--legpush-500)', label: 'Leg + Push' },
  legPull: { tint: 'var(--legpull-tint)', fg: 'var(--legpull-700)', dot: 'var(--legpull-500)', label: 'Leg + Pull' },
  full: { tint: 'var(--full-tint)', fg: 'var(--full-700)', dot: 'var(--full-500)', label: 'Full Body' },
};

/** Map a focus array (subset of push/pull/leg) to a workout-type key. */
export function workoutTypeOf(focus = []) {
  const f = new Set(focus);
  const has = (x) => f.has(x);
  if (has('push') && has('pull') && has('leg')) return 'full';
  if (has('push') && has('pull')) return 'upper';
  if (has('leg') && has('push')) return 'legPush';
  if (has('leg') && has('pull')) return 'legPull';
  if (has('push')) return 'push';
  if (has('pull')) return 'pull';
  if (has('leg')) return 'leg';
  return 'other';
}

export function WorkoutTypeBadge({ type, focus, label, dot = false, size = 'md', onClick, style = {} }) {
  const key = type || (focus ? workoutTypeOf(focus) : 'other');
  const c = WORKOUT_TYPE_COLORS[key] || WORKOUT_TYPE_COLORS.other;
  const sizes = { sm: { h: 20, font: 'var(--text-3xs)', pad: '0 8px' }, md: { h: 24, font: 'var(--text-2xs)', pad: '0 10px' } };
  const s = sizes[size] || sizes.md;
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: s.h,
        padding: s.pad,
        border: 'none',
        borderRadius: 'var(--radius-full)',
        background: c.tint,
        color: c.fg,
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--weight-bold)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: onClick ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {label || c.label}
    </Tag>
  );
}
