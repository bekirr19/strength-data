import React from 'react';

/**
 * Skeleton — shimmer placeholder for loading states. Render blocks/lines
 * with the .sd-shimmer sweep. `variant` picks a common shape.
 */
export function Skeleton({ variant = 'line', width = '100%', height, radius, style = {} }) {
  const presets = {
    line: { width, height: height || 12, radius: radius || 'var(--radius-sm)' },
    text: { width, height: height || 14, radius: radius || '4px' },
    title: { width: width || '60%', height: height || 20, radius: radius || 'var(--radius-sm)' },
    chip: { width: width || 64, height: height || 26, radius: radius || 'var(--radius-full)' },
    block: { width, height: height || 80, radius: radius || 'var(--radius-lg)' },
    card: { width, height: height || 120, radius: radius || 'var(--radius-2xl)' },
    avatar: { width: width || 40, height: height || 40, radius: radius || 'var(--radius-full)' },
  };
  const p = presets[variant] || presets.line;
  return (
    <div
      className="sd-shimmer"
      aria-hidden="true"
      style={{ width: p.width, height: p.height, borderRadius: p.radius, flexShrink: 0, ...style }}
    />
  );
}

/** SkeletonGroup — convenience stack of shimmer lines. */
export function SkeletonGroup({ lines = 3, gap = 10, lastWidth = '70%', style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? lastWidth : '100%'} />
      ))}
    </div>
  );
}
