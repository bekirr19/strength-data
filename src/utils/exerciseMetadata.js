import { normalizeExerciseName } from './storage';

export const EXERCISE_CATEGORY_META = {
  push: {
    key: 'push',
    label: 'Push',
    subtitle: 'Göğüs, Omuz, Triceps',
    cardClass: 'bg-orange-500/10 border border-orange-400/20',
    badgeClass: 'bg-orange-500/20 text-orange-200',
  },
  pull: {
    key: 'pull',
    label: 'Pull',
    subtitle: 'Sırt, Biceps',
    cardClass: 'bg-sky-500/10 border border-sky-400/20',
    badgeClass: 'bg-sky-500/20 text-sky-100',
  },
  leg: {
    key: 'leg',
    label: 'Leg',
    subtitle: 'Bacak',
    cardClass: 'bg-lime-500/10 border border-lime-400/20',
    badgeClass: 'bg-lime-500/20 text-lime-100',
  },
  other: {
    key: 'other',
    label: 'Diğer',
    subtitle: 'Core & Destek',
    cardClass: 'bg-gray-800/60 border border-gray-700/40',
    badgeClass: 'bg-gray-700 text-gray-300',
  },
};

const MUSCLE_LABELS = {
  chest: 'Göğüs',
  shoulders: 'Omuz',
  triceps: 'Triceps',
  biceps: 'Biceps',
  back: 'Sırt',
  lats: 'Kanat',
  rearShoulders: 'Arka Omuz',
  legs: 'Bacak',
  quads: 'Quadriceps',
  hamstrings: 'Hamstring',
  glutes: 'Kalça',
  calves: 'Baldır',
  core: 'Core',
  abs: 'Karın',
  forearms: 'Ön Kol',
  hipFlexors: 'Kalça Bükücüler',
};

export const MUSCLE_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'chest', label: MUSCLE_LABELS.chest },
  { key: 'shoulders', label: MUSCLE_LABELS.shoulders },
  { key: 'back', label: MUSCLE_LABELS.back },
  { key: 'biceps', label: MUSCLE_LABELS.biceps },
  { key: 'triceps', label: MUSCLE_LABELS.triceps },
  { key: 'legs', label: MUSCLE_LABELS.legs },
  { key: 'core', label: MUSCLE_LABELS.core },
];

export const MUSCLE_OPTIONS = Object.entries(MUSCLE_LABELS).map(([key, label]) => ({
  key,
  label,
}));

const EXERCISE_LIBRARY = [
  // Push - Chest
  { name: 'Bench Press', category: 'push', muscles: ['chest', 'shoulders', 'triceps'] },
  { name: 'Incline Dumbbell Press', category: 'push', muscles: ['chest', 'shoulders', 'triceps'] },
  { name: 'Chest Fly', category: 'push', muscles: ['chest'] },
  { name: 'Cable Chest Fly', category: 'push', muscles: ['chest'] },
  { name: 'Dip', category: 'push', muscles: ['chest', 'triceps', 'shoulders'] },
  { name: 'Push Up', category: 'push', muscles: ['chest', 'shoulders', 'triceps', 'core'] },
  // Push - Shoulders
  { name: 'Overhead Press', category: 'push', muscles: ['shoulders', 'triceps'] },
  { name: 'Front Shoulder', category: 'push', muscles: ['shoulders'] },
  { name: 'Lateral Raise', category: 'push', muscles: ['shoulders'] },
  { name: 'Face Pull', category: 'push', muscles: ['shoulders', 'rearShoulders', 'back'] },
  { name: 'Rear Delt Fly', category: 'push', muscles: ['rearShoulders', 'shoulders'] },
  // Push - Triceps
  { name: 'Triceps Pushdown', category: 'push', muscles: ['triceps'] },
  { name: 'Rope Pushdown', category: 'push', muscles: ['triceps'] },
  { name: 'Cable Skull Crusher', category: 'push', muscles: ['triceps'] },
  { name: 'Skull Crusher', category: 'push', muscles: ['triceps'] },
  { name: 'One Arm Overhead Triceps Extension', category: 'push', muscles: ['triceps'] },

  // Pull - Back
  { name: 'Pull Up', category: 'pull', muscles: ['back', 'lats', 'biceps', 'forearms'] },
  { name: 'Chin Up', category: 'pull', muscles: ['back', 'biceps', 'forearms'] },
  { name: 'Lat Pulldown', category: 'pull', muscles: ['back', 'lats', 'biceps'] },
  { name: 'Cable Row', category: 'pull', muscles: ['back', 'biceps'] },
  { name: 'T-Bar Row', category: 'pull', muscles: ['back', 'biceps'] },
  { name: 'Barbell Row', category: 'pull', muscles: ['back', 'biceps'] },
  { name: 'Rope Pullover', category: 'pull', muscles: ['back', 'lats'] },
  { name: 'Romanian Deadlift', category: 'pull', muscles: ['hamstrings', 'glutes', 'back'] },

  // Pull - Biceps
  { name: 'Barbell Curl', category: 'pull', muscles: ['biceps'] },
  { name: 'Incline Dumbbell Curl', category: 'pull', muscles: ['biceps'] },
  { name: 'Dumbbell Curl', category: 'pull', muscles: ['biceps'] },
  { name: 'Hammer Curl', category: 'pull', muscles: ['biceps', 'forearms'] },

  // Leg Day
  { name: 'Leg Press', category: 'leg', muscles: ['legs', 'glutes'] },
  { name: 'Leg Curl', category: 'leg', muscles: ['hamstrings'] },
  { name: 'Calf Raise', category: 'leg', muscles: ['calves'] },
  { name: 'Dumbbell Squat', category: 'leg', muscles: ['legs', 'quads', 'glutes', 'core'] },
  { name: 'Leg Extension', category: 'leg', muscles: ['quads'] },
  { name: 'Bulgarian Split Squat', category: 'leg', muscles: ['quads', 'glutes', 'core'] },
  { name: 'Single-Leg Hip Thrust', category: 'leg', muscles: ['glutes', 'hamstrings'] },
  { name: 'Hip Thrust', category: 'leg', muscles: ['glutes', 'hamstrings'] },
  { name: 'Deadlift', category: 'leg', muscles: ['legs', 'glutes', 'hamstrings', 'back'] },

  // Others (core, accessory)
  { name: 'Ab Wheel', category: 'other', muscles: ['core'] },
  { name: 'Plank', category: 'other', muscles: ['core'] },
  { name: 'Hanging Leg Raise', category: 'other', muscles: ['core', 'hipFlexors'] },
];

const EXERCISE_INDEX = EXERCISE_LIBRARY.reduce((acc, entry) => {
  const key = normalizeExerciseName(entry.name).toLowerCase();
  if (!acc[key]) {
    acc[key] = entry;
  }
  return acc;
}, {});

export function getExerciseInfo(name, overrides = {}) {
  const normalized = overrides.canonicalName || normalizeExerciseName(name);
  const key = normalized.toLowerCase();
  const entry = EXERCISE_INDEX[key];
  const category = overrides.customCategory || entry?.category || 'other';
  const categoryMeta = EXERCISE_CATEGORY_META[category] || EXERCISE_CATEGORY_META.other;
  const muscles = Array.isArray(overrides.customMuscles) && overrides.customMuscles.length > 0
    ? overrides.customMuscles
    : entry?.muscles || [];

  return {
    category,
    categoryMeta,
    muscles,
    muscleLabels: muscles.map((m) => MUSCLE_LABELS[m] || m),
    displayName: (overrides.displayName || overrides.name || normalized),
  };
}

export const SUGGESTED_EXERCISES = EXERCISE_LIBRARY.map((entry) => ({
  name: entry.name,
  category: entry.category,
  muscles: entry.muscles,
}));

export function exerciseMatchesMuscle(info, muscleKey) {
  if (!info || !muscleKey || muscleKey === 'all') return true;
  return info.muscles.some((m) => m === muscleKey);
}
