export const WORKOUT_TYPE_META = {
  push: {
    label: 'PUSH',
    badgeLabel: 'Push Day',
    buttonClass: 'bg-orange-600/30 text-orange-100 border border-orange-500/50 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    badgeClass: 'bg-orange-500/20 text-orange-100 border border-orange-500/40 font-bold',
    dotClass: 'bg-orange-500',
  },
  pull: {
    label: 'PULL',
    badgeLabel: 'Pull Day',
    buttonClass: 'bg-blue-600/30 text-blue-100 border border-blue-500/50 font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    badgeClass: 'bg-blue-500/20 text-blue-100 border border-blue-500/40 font-bold',
    dotClass: 'bg-blue-500',
  },
  leg: {
    label: 'LEG',
    badgeLabel: 'Leg Day',
    buttonClass: 'bg-emerald-600/30 text-emerald-100 border border-emerald-500/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    badgeClass: 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40 font-bold',
    dotClass: 'bg-emerald-500',
  },
  // Combinations
  'pull-push': {
    label: 'UPPER',
    badgeLabel: 'Upper Body',
    buttonClass: 'bg-purple-600/30 text-purple-100 border border-purple-500/50 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    badgeClass: 'bg-purple-500/20 text-purple-100 border border-purple-500/40 font-bold',
    dotClass: 'bg-purple-500',
  },
  'leg-push': {
    label: 'LEG+PUSH',
    badgeLabel: 'Leg + Push',
    buttonClass: 'bg-yellow-500/30 text-yellow-100 border border-yellow-500/50 font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    badgeClass: 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/40 font-bold',
    dotClass: 'bg-yellow-500',
  },
  'leg-pull': {
    label: 'LEG+PULL',
    badgeLabel: 'Leg + Pull',
    buttonClass: 'bg-cyan-600/30 text-cyan-100 border border-cyan-500/50 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    badgeClass: 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 font-bold',
    dotClass: 'bg-cyan-400',
  },
  'leg-pull-push': {
    label: 'FULL',
    badgeLabel: 'Full Body',
    buttonClass: 'bg-fuchsia-600/30 text-fuchsia-100 border border-fuchsia-500/50 font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)]',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-500/40 font-bold',
    dotClass: 'bg-fuchsia-500',
  },
};

export function detectWorkoutType(workout) {
  if (!workout) return null;

  let types = [];
  
  // 1. Try to get from workoutFocus
  if (Array.isArray(workout.workoutFocus) && workout.workoutFocus.length > 0) {
    types = workout.workoutFocus.map(f => f.toLowerCase());
  } else {
    // 2. Fallback to name parsing
    const name = (workout.workoutName || '').toLowerCase();
    if (name.includes('push')) types.push('push');
    if (name.includes('pull')) types.push('pull');
    if (name.includes('leg') || name.includes('bacak')) types.push('leg');
  }

  // Normalize and filter known types
  const normalized = types.map(t => {
    if (t.includes('push')) return 'push';
    if (t.includes('pull')) return 'pull';
    if (t.includes('leg') || t.includes('bacak')) return 'leg';
    return null;
  }).filter(Boolean);

  // Unique and Sort (alphabetical: leg, pull, push)
  const uniqueSorted = [...new Set(normalized)].sort();

  if (uniqueSorted.length === 0) return null;
  return uniqueSorted.join('-');
}
