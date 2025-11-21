export const WORKOUT_TYPE_META = {
  push: {
    label: 'PUSH',
    badgeLabel: 'Push Day',
    buttonClass: 'bg-orange-500/25 text-orange-100 border border-orange-400/40 font-semibold',
    badgeClass: 'bg-orange-500/15 text-orange-100 border border-orange-500/40 font-semibold',
    dotClass: 'bg-orange-400',
  },
  pull: {
    label: 'PULL',
    badgeLabel: 'Pull Day',
    buttonClass: 'bg-sky-500/25 text-sky-100 border border-sky-400/40 font-semibold',
    badgeClass: 'bg-sky-500/15 text-sky-100 border border-sky-500/40 font-semibold',
    dotClass: 'bg-sky-400',
  },
  leg: {
    label: 'LEG',
    badgeLabel: 'Leg Day',
    buttonClass: 'bg-lime-500/25 text-lime-100 border border-lime-400/40 font-semibold',
    badgeClass: 'bg-lime-500/15 text-lime-100 border border-lime-500/40 font-semibold',
    dotClass: 'bg-lime-400',
  },
};

export function detectWorkoutType(workout) {
  if (!workout) return null;
  const name = (workout.workoutName || '').toLowerCase();
  const focus = Array.isArray(workout.workoutFocus)
    ? workout.workoutFocus.join(' ').toLowerCase()
    : '';
  const combined = `${name} ${focus}`;

  if (combined.includes('push')) return 'push';
  if (combined.includes('pull')) return 'pull';
  if (combined.includes('leg') || combined.includes('bacak')) return 'leg';
  return null;
}
