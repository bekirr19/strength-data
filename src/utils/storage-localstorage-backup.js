const STORAGE = {
  EXERCISES: 'gym_exercises_v1',
  WORKOUTS: 'gym_workouts_v1',
  BODY_WEIGHT: 'gym_body_weight_v1',
};

const EXERCISE_SYNONYMS = {
  'shoulder press': 'Overhead Press',
  'overhead press': 'Overhead Press',
  'chest fly': 'Chest Fly',
  'fly': 'Chest Fly',
  'bench presss': 'Bench Press',
  'pull up': 'Pull Up',
  'barfix': 'Pull Up',
  'chin up': 'Chin Up',
  'incline dumbbell press': 'Incline Dumbbell Press',
  'incline bench press': 'Incline Dumbbell Press',
  'cable fly': 'Cable Chest Fly',
  'cable chest fly': 'Cable Chest Fly',
  'cable crossover': 'Cable Chest Fly',
  'push up': 'Push Up',
  'dip': 'Dip',
  'dips': 'Dip',
  'lateral raise': 'Lateral Raise',
  'face pull': 'Face Pull',
  'posterior deltoid(pec deck)': 'Face Pull',
  'posterior deltoid (pec deck)': 'Face Pull',
  'rear delt fly': 'Rear Delt Fly',
  'posterior deltoid(rope)': 'Rear Delt Fly',
  'posterior deltoid (rope)': 'Rear Delt Fly',
  'triceps pushdown': 'Triceps Pushdown',
  'cable skull crusher': 'Cable Skull Crusher',
  'one arm overhead triceps extension': 'One Arm Overhead Triceps Extension',
  'skull crusher': 'Skull Crusher',
  'barbell curl': 'Barbell Curl',
  'incline dumbbell curl': 'Incline Dumbbell Curl',
  'dumbbell curl': 'Dumbbell Curl',
  'hammer curl': 'Hammer Curl',
  'lat pulldown': 'Lat Pulldown',
  'cable pull': 'Cable Row',
  'cable row': 'Cable Row',
  'seated cable row': 'Cable Row',
  't-bar row': 'T-Bar Row',
  't bar row': 'T-Bar Row',
  'rope pullover': 'Rope Pullover',
  'romanian deadlift': 'Romanian Deadlift',
  'deadlift': 'Deadlift',
  'leg press': 'Leg Press',
  'leg curl': 'Leg Curl',
  'leg extension': 'Leg Extension',
  'calf raise': 'Calf Raise',
  'dumbbell squat': 'Dumbbell Squat',
  'bulgarian split squat': 'Bulgarian Split Squat',
  'single leg hip thrust': 'Single-Leg Hip Thrust',
  'single-leg hip thrust': 'Single-Leg Hip Thrust',
  'hip thrust': 'Hip Thrust',
};

export function normalizeExerciseName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  return EXERCISE_SYNONYMS[lower] || trimmed;
}

const BODY_WEIGHT_KEYWORDS = ['body weight', 'bodyweight', 'bw', 'vücut ağırlığı', 'vucut ağırlığı'];

function getBodyWeightMap() {
  const raw = localStorage.getItem(STORAGE.BODY_WEIGHT);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('Body weight parse error', err);
    return {};
  }
}

function setBodyWeightMap(map) {
  localStorage.setItem(STORAGE.BODY_WEIGHT, JSON.stringify(map));
}

export function getBodyWeightCollection() {
  return { ...getBodyWeightMap() };
}

export function getBodyWeight(dateISO) {
  const map = getBodyWeightMap();
  if (Object.prototype.hasOwnProperty.call(map, dateISO)) {
    const raw = map[dateISO];
    const value = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function findLatestWeightBefore(dateISO) {
  const map = getBodyWeightMap();
  const keys = Object.keys(map).sort();
  let latest = null;
  keys.forEach((key) => {
    if (key <= dateISO) {
      latest = key;
    }
  });
  if (!latest) return null;
  const raw = map[latest];
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(value) ? { value, dateISO: latest } : null;
}

export function getBodyWeightInfo(dateISO) {
  const exact = getBodyWeight(dateISO);
  if (exact !== null) {
    return { value: exact, sourceDate: dateISO, isFallback: false };
  }
  const fallback = findLatestWeightBefore(dateISO);
  if (fallback) {
    return { value: fallback.value, sourceDate: fallback.dateISO, isFallback: true };
  }
  return { value: null, sourceDate: null, isFallback: false };
}

export function getBodyWeightWithFallback(dateISO) {
  const info = getBodyWeightInfo(dateISO);
  return info.value;
}

export function saveBodyWeight(dateISO, weight) {
  if (!dateISO) return;
  const value = Number(weight);
  if (!Number.isFinite(value) || value <= 0) {
    clearBodyWeight(dateISO);
    return;
  }
  const map = getBodyWeightMap();
  map[dateISO] = Number(value.toFixed(1));
  setBodyWeightMap(map);
}

export function clearBodyWeight(dateISO) {
  const map = getBodyWeightMap();
  if (Object.prototype.hasOwnProperty.call(map, dateISO)) {
    delete map[dateISO];
    setBodyWeightMap(map);
  }
}

function mergeExerciseStats(target, source) {
  target.pr = Math.max(target.pr || 0, source.pr || 0);
  target.prReps = Math.max(target.prReps || 0, source.prReps || 0);
  target.used = Math.max(target.used || 0, source.used || 0);
  const sourceCreated = source.createdAt || Date.now();
  target.createdAt = Math.min(target.createdAt || sourceCreated, sourceCreated);
  if (source.lastUsed) {
    target.lastUsed = Math.max(target.lastUsed || 0, source.lastUsed);
  }
  if (!target.customCategory && source.customCategory) {
    target.customCategory = source.customCategory;
  }
  if ((!Array.isArray(target.customMuscles) || target.customMuscles.length === 0) && Array.isArray(source.customMuscles) && source.customMuscles.length > 0) {
    target.customMuscles = source.customMuscles;
  }
  if (!target.displayName && source.displayName) {
    target.displayName = source.displayName;
  }
}

function normalizeExerciseList(list) {
  const map = {};
  (list || []).forEach((item) => {
    if (!item || (!item.name && !item.displayName)) return;

    const rawName = typeof item.displayName === 'string' && item.displayName.trim().length > 0
      ? item.displayName.trim()
      : typeof item.name === 'string'
        ? item.name.trim()
        : '';

    if (!rawName) return;

    const canonical = normalizeExerciseName(rawName);
    if (!canonical) return;

    const key = canonical.toLowerCase();
    const base = map[key];

    const merged = {
      ...item,
      name: rawName,
      displayName: rawName,
      canonicalName: canonical,
      pr: item.pr || 0,
      prReps: item.prReps || 0,
      used: item.used || 0,
    };

    if (!base) {
      map[key] = merged;
    } else {
      mergeExerciseStats(base, merged);
      if (merged.displayName && merged.displayName !== base.displayName) {
        base.displayName = merged.displayName;
        base.name = merged.displayName;
      }
    }
  });

  return Object.values(map).map((entry) => ({
    ...entry,
    name: entry.displayName || entry.name || entry.canonicalName,
    displayName: entry.displayName || entry.name || entry.canonicalName,
    canonicalName: entry.canonicalName || normalizeExerciseName(entry.displayName || entry.name || ''),
  }));
}

function normalizeWorkoutItems(items) {
  const map = {};
  (items || []).forEach((item) => {
    if (!item || (!item.name && !item.displayName)) return;

    const rawName = typeof item.displayName === 'string' && item.displayName.trim().length > 0
      ? item.displayName.trim()
      : typeof item.name === 'string'
        ? item.name.trim()
        : '';

    if (!rawName) return;

    const canonical = normalizeExerciseName(rawName);
    if (!canonical) return;

    const key = canonical.toLowerCase();
    const normalizedSets = (item.sets || []).map((set) => {
      const rawWeight = set?.wDisplay ?? set?.weightDisplay ?? set?.w ?? '';
      const { value, display } = resolveWeightValue(rawWeight, rawName, item.dateISO || item.dateIso || item.date || null);
      return {
        w: value,
        wDisplay: display,
        r: Number(set?.r || 0),
        note: set?.note || '',
      };
    }).filter((set) => Number.isFinite(set.w) && set.w > 0 && Number.isFinite(set.r) && set.r > 0);

    if (normalizedSets.length === 0) return;

    const { dateISO: _ignoreDateISO, dateIso: _ignoreDateIso, date: _ignoreDate, ...restItem } = item;
    const cleanedItem = {
      ...restItem,
      name: rawName,
      displayName: rawName,
      canonicalName: canonical,
      sets: normalizedSets,
    };

    if (!map[key]) {
      map[key] = cleanedItem;
    } else {
      map[key].sets = map[key].sets.concat(normalizedSets);
    }
  });
  return Object.values(map);
}

function normalizeWorkoutCollection(collection) {
  const normalized = {};
  Object.keys(collection || {}).forEach((iso) => {
    const entry = collection[iso];
    if (!entry) return;

    const normalizedItems = normalizeWorkoutItems((entry.items || []).map((it) => ({ ...it, dateISO: entry.dateISO || iso }))); 
    const dateISO = entry.dateISO || iso;

    normalized[dateISO] = {
      ...entry,
      dateISO,
      workoutName: entry.workoutName || '',
      workoutFocus: Array.isArray(entry.workoutFocus) ? entry.workoutFocus : [],
      workoutFuel: entry.workoutFuel || '',
      notes: typeof entry.notes === 'string' ? entry.notes : '',
      items: normalizedItems,
    };
  });
  return normalized;
}

// Egzersizler
export function getExercises() {
  const raw = localStorage.getItem(STORAGE.EXERCISES);
  if (raw) {
    const parsed = JSON.parse(raw);
    const normalized = normalizeExerciseList(parsed);
    localStorage.setItem(STORAGE.EXERCISES, JSON.stringify(normalized));
    return normalized;
  }

  const seed = [
    { name: 'Bench Press', displayName: 'Bench Press', canonicalName: 'Bench Press', createdAt: Date.now(), used: 0, pr: 100 },
    { name: 'Squat', displayName: 'Squat', canonicalName: 'Squat', createdAt: Date.now(), used: 0, pr: 120 },
    { name: 'Deadlift', displayName: 'Deadlift', canonicalName: 'Deadlift', createdAt: Date.now(), used: 0, pr: 150 },
    { name: 'Overhead Press', displayName: 'Overhead Press', canonicalName: 'Overhead Press', createdAt: Date.now(), used: 0, pr: 60 },
    { name: 'Pull Up', displayName: 'Pull Up', canonicalName: 'Pull Up', createdAt: Date.now(), used: 0, pr: 0, prReps: 12 },
  ];
  localStorage.setItem(STORAGE.EXERCISES, JSON.stringify(seed));
  return seed;
}

export function saveExercises(list) {
  const normalized = normalizeExerciseList(list);
  localStorage.setItem(STORAGE.EXERCISES, JSON.stringify(normalized));
}

export function renameExerciseEverywhere(oldName, newDisplayName, newCanonicalName) {
  const oldCanonical = normalizeExerciseName(oldName);
  const nextDisplay = (newDisplayName || '').trim() || oldCanonical;
  const nextCanonical = normalizeExerciseName(newCanonicalName || newDisplayName || oldName);

  if (!nextCanonical) {
    return;
  }

  const all = getWorkouts();
  let hasChanges = false;

  Object.keys(all).forEach((iso) => {
    const workout = all[iso];
    if (!workout || !Array.isArray(workout.items)) return;

    let workoutChanged = false;
    const updatedItems = workout.items.map((item) => {
      if (!item) return item;
      const itemCanonical = item.canonicalName || normalizeExerciseName(item.name);
      if (itemCanonical && itemCanonical.toLowerCase() === oldCanonical.toLowerCase()) {
        if (
          item.name === nextDisplay &&
          (item.displayName || item.name) === nextDisplay &&
          itemCanonical === nextCanonical
        ) {
          return item;
        }

        workoutChanged = true;
        return {
          ...item,
          name: nextDisplay,
          displayName: nextDisplay,
          canonicalName: nextCanonical,
        };
      }
      return item;
    });

    if (workoutChanged) {
      hasChanges = true;
      workout.items = updatedItems;
    }
  });

  if (hasChanges) {
    localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(all));
  }
}

export function ensureExercise(name) {
  const canonical = normalizeExerciseName(name);
  if (!canonical) return;

  const list = getExercises();
  if (!list.some((e) => e.name.toLowerCase() === canonical.toLowerCase())) {
    list.push({ name: canonical, createdAt: Date.now(), used: 0 });
    saveExercises(list);
  }
}

export function updateExercisePR(name, prWeight, prReps) {
  const canonical = normalizeExerciseName(name);
  if (!canonical) return;

  const list = getExercises();
  const item = list.find((e) => e.name.toLowerCase() === canonical.toLowerCase());
  if (item) {
    if (typeof prWeight === 'number' && prWeight > (item.pr || 0)) item.pr = prWeight;
    if (typeof prReps === 'number' && prReps > (item.prReps || 0)) item.prReps = prReps;
    item.used = (item.used || 0) + 1;
    saveExercises(list);
  }
}

// Antrenmanlar
export function getWorkouts() {
  const raw = localStorage.getItem(STORAGE.WORKOUTS);
  if (raw) {
    const parsed = JSON.parse(raw);
    const normalized = normalizeWorkoutCollection(parsed);
    localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(normalized));
    return normalized;
  }

  // Örnek veri
  const today = new Date();
  const yday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const data = {};
  data[toISODate(yday)] = {
    dateISO: toISODate(yday),
    workoutName: 'Pull Day',
    workoutFocus: ['Sırt', 'Biceps'],
    workoutFuel: '2 Yumurta, Kahve',
    notes: 'Sıkı bir sırt & biceps günü!',
    items: [
      { name: 'Barbell Row', sets: [{ w: 60, r: 12 }, { w: 70, r: 10 }, { w: 70, r: 8 }] },
      { name: 'Lat Pulldown', sets: [{ w: 50, r: 12 }, { w: 55, r: 10 }, { w: 55, r: 8 }] },
      { name: 'Dumbbell Curl', sets: [{ w: 12, r: 15 }, { w: 12, r: 15 }, { w: 12, r: 12 }] },
    ],
  };
  const normalizedSeed = normalizeWorkoutCollection(data);
  localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(normalizedSeed));
  return normalizedSeed;
}

export function getWorkoutByDate(dateISO) {
  const all = getWorkouts();
  return all[dateISO];
}

export function saveWorkout(workout) {
  if (!workout || !workout.dateISO) return;

  const normalizedWorkout = {
    ...workout,
    dateISO: workout.dateISO,
    workoutName: workout.workoutName || '',
    workoutFocus: Array.isArray(workout.workoutFocus) ? workout.workoutFocus : [],
    workoutFuel: workout.workoutFuel || '',
    notes: typeof workout.notes === 'string' ? workout.notes : '',
    items: normalizeWorkoutItems((workout.items || []).map((it) => ({ ...it, dateISO: workout.dateISO }))),
  };

  const all = getWorkouts();
  all[normalizedWorkout.dateISO] = normalizedWorkout;
  localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(all));

  normalizedWorkout.items.forEach((it) => {
    const canonical = it.canonicalName || normalizeExerciseName(it.name);
    ensureExercise(canonical);
    const maxW = it.sets.reduce((m, s) => Math.max(m, Number(s.w || 0)), 0);
    const maxR = it.sets.reduce((m, s) => Math.max(m, Number(s.r || 0)), 0);
    updateExercisePR(canonical, maxW, maxR);
  });
}

export function resolveWeightValue(weightInput, exerciseName, dateISO) {
  let display = '';
  let value = 0;

  const formatNumber = (num) => {
    if (!Number.isFinite(num)) return '';
    const rounded = Number(num.toFixed(1));
    return Number.isInteger(rounded) ? String(Number(rounded)) : String(rounded);
  };

  if (typeof weightInput === 'number') {
    if (Number.isFinite(weightInput) && weightInput > 0) {
      value = weightInput;
      display = `${Number(weightInput.toFixed(1))}`;
    }
    return { value, display };
  }

  const raw = typeof weightInput === 'string' ? weightInput.trim() : '';
  if (!raw) {
    return { value, display };
  }

  const normalizedName = normalizeExerciseName(exerciseName || '');
  const lower = raw.toLowerCase();
  const isBodyWeightKeyword = BODY_WEIGHT_KEYWORDS.some((keyword) => lower.startsWith(keyword));
  const isBodyWeightExercise = normalizedName.toLowerCase() === 'pull up';

  if (isBodyWeightKeyword || isBodyWeightExercise || lower.startsWith('+')) {
    const bodyWeight = getBodyWeight(dateISO);
    const hasBodyWeight = Number.isFinite(bodyWeight) && bodyWeight > 0;
    const baseWeight = hasBodyWeight ? bodyWeight : 0;
    const plusIndex = raw.indexOf('+');
    let additional = 0;

    if (plusIndex !== -1) {
      const extraPart = raw.slice(plusIndex + 1).replace(',', '.').trim();
      const parsedExtra = parseFloat(extraPart);
      if (Number.isFinite(parsedExtra)) {
        additional = parsedExtra;
      }
    }

    const total = baseWeight + additional;
    if (hasBodyWeight || additional > 0) {
      value = Number(total.toFixed(1));
    }

    if (hasBodyWeight) {
      const baseLabel = formatNumber(bodyWeight);
      if (additional > 0) {
        display = `${baseLabel}+${formatNumber(additional)}`;
      } else {
        display = baseLabel;
      }
    } else {
      if (additional > 0) {
        display = `BW+${formatNumber(additional)}`;
      } else {
        display = 'Body Weight';
      }
    }
    return { value, display };
  }

  const sanitized = raw.replace(',', '.');
  const match = sanitized.match(/-?\d+(\.\d+)?/);
  if (match) {
    const parsed = parseFloat(match[0]);
    if (Number.isFinite(parsed) && parsed > 0) {
      value = Number(parsed.toFixed(1));
      display = `${value}`;
    }
  }

  return { value, display: display || raw };
}

export function deleteWorkout(dateISO) {
  const all = getWorkouts();
  delete all[dateISO];
  localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(all));
}

export function exportAllData() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const exercisesRaw = window.localStorage.getItem(STORAGE.EXERCISES);
    const workoutsRaw = window.localStorage.getItem(STORAGE.WORKOUTS);
    const bodyWeightRaw = window.localStorage.getItem(STORAGE.BODY_WEIGHT);

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises: exercisesRaw ? JSON.parse(exercisesRaw) : [],
      workouts: workoutsRaw ? JSON.parse(workoutsRaw) : {},
      bodyWeight: bodyWeightRaw ? JSON.parse(bodyWeightRaw) : {},
    };

    return payload;
  } catch (err) {
    console.error('Export error', err);
    return null;
  }
}

export function importAllData(payload) {
  if (typeof window === 'undefined') {
    throw new Error('Bu işlem tarayıcı ortamında yapılmalı.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Geçersiz veri paketi.');
  }

  const { exercises, workouts, bodyWeight } = payload;

  if (exercises !== undefined) {
    if (!Array.isArray(exercises)) {
      throw new Error('Exercises listesi geçersiz.');
    }
    saveExercises(exercises);
  }

  if (workouts !== undefined) {
    if (!workouts || typeof workouts !== 'object') {
      throw new Error('Workouts verisi geçersiz.');
    }
    const normalized = normalizeWorkoutCollection(workouts);
    window.localStorage.setItem(STORAGE.WORKOUTS, JSON.stringify(normalized));
  }

  if (bodyWeight !== undefined) {
    if (!bodyWeight || typeof bodyWeight !== 'object') {
      throw new Error('Body weight verisi geçersiz.');
    }
    setBodyWeightMap(bodyWeight);
  }
}

// Tarih yardımcıları
const pad = (n) => String(n).padStart(2, '0');

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(iso) {
  const [y, m, da] = iso.split('-').map(Number);
  return new Date(y, m - 1, da);
}

export const turkishWeekdaysShort = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export const turkishWeekdays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const turkishMonths = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function formatDateTRFull(date) {
  const d = typeof date === 'string' ? fromISO(date) : date;
  const day = d.getDate();
  const month = turkishMonths[d.getMonth()];
  const weekday = turkishWeekdays[d.getDay()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}, ${weekday}`;
}

export function formatDateTRShort(date) {
  const d = typeof date === 'string' ? fromISO(date) : date;
  const day = d.getDate();
  const month = turkishMonths[d.getMonth()];
  return `${day} ${month}`;
}