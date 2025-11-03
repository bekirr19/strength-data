import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';

// !!ÖNEMLİ!!
// Bu fonksiyon, Firebase Authentication'ı entegre ettikten sonra
// mevcut giriş yapmış kullanıcının kimliğini döndürmelidir.
// Şimdilik, tüm kullanıcılar için paylaşılan bir 'test-user' kimliği kullanıyoruz.
const getCurrentUserId = () => 'test-user';

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

async function getBodyWeightMap() {
  const userId = getCurrentUserId();
  const docRef = doc(db, 'body_weights', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().weights || {};
  }
  return {};
}

async function setBodyWeightMap(map) {
  const userId = getCurrentUserId();
  const docRef = doc(db, 'body_weights', userId);
  await setDoc(docRef, { weights: map });
}

export async function getBodyWeightCollection() {
  return getBodyWeightMap();
}

export async function getBodyWeight(dateISO) {
  const map = await getBodyWeightMap();
  if (Object.prototype.hasOwnProperty.call(map, dateISO)) {
    const raw = map[dateISO];
    const value = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

async function findLatestWeightBefore(dateISO) {
  const map = await getBodyWeightMap();
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

export async function getBodyWeightInfo(dateISO) {
  const exact = await getBodyWeight(dateISO);
  if (exact !== null) {
    return { value: exact, sourceDate: dateISO, isFallback: false };
  }
  const fallback = await findLatestWeightBefore(dateISO);
  if (fallback) {
    return { value: fallback.value, sourceDate: fallback.dateISO, isFallback: true };
  }
  return { value: null, sourceDate: null, isFallback: false };
}

export async function getBodyWeightWithFallback(dateISO) {
  const info = await getBodyWeightInfo(dateISO);
  return info.value;
}

export async function saveBodyWeight(dateISO, weight) {
  if (!dateISO) return;
  const value = Number(weight);
  if (!Number.isFinite(value) || value <= 0) {
    await clearBodyWeight(dateISO);
    return;
  }
  const map = await getBodyWeightMap();
  map[dateISO] = Number(value.toFixed(1));
  await setBodyWeightMap(map);
}

export async function clearBodyWeight(dateISO) {
  const map = await getBodyWeightMap();
  if (Object.prototype.hasOwnProperty.call(map, dateISO)) {
    delete map[dateISO];
    await setBodyWeightMap(map);
  }
}

// Exercises
export async function getExercises() {
  const userId = getCurrentUserId();
  const q = query(collection(db, 'exercises'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const exercises = [];
  querySnapshot.forEach((doc) => {
    exercises.push({ id: doc.id, ...doc.data() });
  });

  if (exercises.length > 0) {
    return exercises;
  }

  // Seed data for new user
  const seed = [
    { name: 'Bench Press', displayName: 'Bench Press', canonicalName: 'Bench Press', createdAt: Date.now(), used: 0, pr: 100 },
    { name: 'Squat', displayName: 'Squat', canonicalName: 'Squat', createdAt: Date.now(), used: 0, pr: 120 },
    { name: 'Deadlift', displayName: 'Deadlift', canonicalName: 'Deadlift', createdAt: Date.now(), used: 0, pr: 150 },
    { name: 'Overhead Press', displayName: 'Overhead Press', canonicalName: 'Overhead Press', createdAt: Date.now(), used: 0, pr: 60 },
    { name: 'Pull Up', displayName: 'Pull Up', canonicalName: 'Pull Up', createdAt: Date.now(), used: 0, pr: 0, prReps: 12 },
  ];

  const batch = writeBatch(db);
  seed.forEach(exercise => {
      const docRef = doc(collection(db, 'exercises')); // auto-generate ID
      batch.set(docRef, { ...exercise, userId });
  });
  await batch.commit();

  return seed;
}

export async function saveExercises(list) {
  const userId = getCurrentUserId();
  const batch = writeBatch(db);
  
  list.forEach(exercise => {
      const { id, ...data } = exercise;
      const docRef = id ? doc(db, 'exercises', id) : doc(collection(db, 'exercises'));
      batch.set(docRef, { ...data, userId });
  });

  await batch.commit();
}

export async function renameExerciseEverywhere(oldName, newDisplayName, newCanonicalName) {
  const oldCanonical = normalizeExerciseName(oldName);
  const nextDisplay = (newDisplayName || '').trim() || oldCanonical;
  const nextCanonical = normalizeExerciseName(newCanonicalName || newDisplayName || oldName);

  if (!nextCanonical) return;

  const allWorkouts = await getWorkouts(); 
  const batch = writeBatch(db);

  Object.values(allWorkouts).forEach(workout => {
      let workoutChanged = false;
      const updatedItems = workout.items.map(item => {
          const itemCanonical = item.canonicalName || normalizeExerciseName(item.name);
          if (itemCanonical && itemCanonical.toLowerCase() === oldCanonical.toLowerCase()) {
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
          const docRef = doc(db, 'workouts', workout.dateISO);
          batch.update(docRef, { items: updatedItems });
      }
  });

  await batch.commit();
}


export async function ensureExercise(name) {
    const canonical = normalizeExerciseName(name);
    if (!canonical) return;

    const list = await getExercises();
    const existing = list.find(e => (e.canonicalName || e.name).toLowerCase() === canonical.toLowerCase());

    if (!existing) {
        const newExercise = { 
            name: canonical, 
            canonicalName: canonical, 
            displayName: canonical, 
            createdAt: Date.now(), 
            used: 0,
            pr: 0,
            prReps: 0,
            userId: getCurrentUserId()
        };
        const docRef = doc(collection(db, 'exercises'));
        await setDoc(docRef, newExercise);
    }
}

export async function updateExercisePR(name, prWeight, prReps) {
    const canonical = normalizeExerciseName(name);
    if (!canonical) return;

    const list = await getExercises();
    const item = list.find(e => (e.canonicalName || e.name).toLowerCase() === canonical.toLowerCase());

    if (item && item.id) {
        const docRef = doc(db, 'exercises', item.id);
        const updateData = {
            used: (item.used || 0) + 1,
            lastUsed: Date.now()
        };
        if (typeof prWeight === 'number' && prWeight > (item.pr || 0)) {
            updateData.pr = prWeight;
        }
        if (typeof prReps === 'number' && prReps > (item.prReps || 0)) {
            updateData.prReps = prReps;
        }
        await setDoc(docRef, updateData, { merge: true });
    }
}

// Workouts
export async function getWorkouts() {
    const userId = getCurrentUserId();
    const q = query(collection(db, 'workouts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const workouts = {};
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.dateISO) {
            workouts[data.dateISO] = { ...data, dateISO: data.dateISO };
        }
    });
    return workouts;
}

export async function getWorkoutByDate(dateISO) {
    const userId = getCurrentUserId();
    const docId = `${dateISO}_${userId}`;
    const docRef = doc(db, 'workouts', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { ...data, dateISO: data.dateISO || dateISO };
    }
    return null;
}

export async function saveWorkout(workout) {
    if (!workout || !workout.dateISO) return;
    const userId = getCurrentUserId();
    
    const workoutData = {
        ...workout,
        userId,
    };

    const docId = `${workout.dateISO}_${userId}`
    const docRef = doc(db, 'workouts', docId);
    await setDoc(docRef, workoutData);

    // Update exercise stats
    for (const item of workout.items) {
        const canonical = normalizeExerciseName(item.name);
        await ensureExercise(canonical);
        const maxW = item.sets.reduce((m, s) => Math.max(m, Number(s.w || 0)), 0);
        const maxR = item.sets.reduce((m, s) => Math.max(m, Number(s.r || 0)), 0);
        await updateExercisePR(canonical, maxW, maxR);
    }
}

export async function deleteWorkout(dateISO) {
    const userId = getCurrentUserId();
    const docId = `${dateISO}_${userId}`;
    const docRef = doc(db, 'workouts', docId);
    await deleteDoc(docRef);
}

// ... (The rest of the utility functions like date helpers, normalizeExerciseName etc. remain the same)

export async function resolveWeightValue(weightInput, exerciseName, dateISO) {
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
    const bodyWeight = await getBodyWeight(dateISO);
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

export async function exportAllData() {
    const userId = getCurrentUserId();
    const exercises = await getExercises();
    const workouts = await getWorkouts();
    const bodyWeight = await getBodyWeightMap();

    const payload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        exercises,
        workouts,
        bodyWeight,
    };

    return payload;
}

export async function importAllData(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Geçersiz veri paketi.');
    }

    const { exercises, workouts, bodyWeight } = payload;

    if (exercises) {
        await saveExercises(exercises);
    }
    if (workouts) {
        const batch = writeBatch(db);
        const userId = getCurrentUserId();
        Object.values(workouts).forEach(workout => {
            const docId = `${workout.dateISO}_${userId}`;
            const docRef = doc(db, 'workouts', docId);
            batch.set(docRef, { ...workout, userId });
        });
        await batch.commit();
    }
    if (bodyWeight) {
        await setBodyWeightMap(bodyWeight);
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
