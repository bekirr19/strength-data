export const WORKOUT_TYPE_META = {
  push: {
    label: 'Push Day',
    buttonClass: 'bg-orange-500/20 text-orange-200 border border-orange-400/40 font-semibold',
    dotClass: 'bg-orange-400',
  },
  pull: {
    label: 'Pull Day',
    buttonClass: 'bg-sky-500/20 text-sky-200 border border-sky-400/40 font-semibold',
    dotClass: 'bg-sky-400',
  },
  leg: {
    label: 'Leg Day',
    buttonClass: 'bg-lime-500/20 text-lime-200 border border-lime-400/40 font-semibold',
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
