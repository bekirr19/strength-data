import { database } from '../firebase';
import { ref, set, get, update, remove, onValue } from 'firebase/database';

const STORAGE = {
  EXERCISES: 'gym_exercises_v1',
  WORKOUTS: 'gym_workouts_v1',
  BODY_WEIGHT: 'gym_body_weight_v1',
  IMPROVEMENTS: 'gym_improvements_v1',
};

const EXERCISE_SYNONYMS = {
  'shoulder press': 'Overhead Press',
  'overhead press': 'Overhead Press',
  'chest fly': 'Chest Fly',
  'fly': 'Chest Fly',
  'bench presss': 'Bench Press',
  'pull up': 'Pull Up',
  'pull-up': 'Pull Up',
  'pullup': 'Pull Up',
  'pull ups': 'Pull Up',
  'pull-ups': 'Pull Up',
  'pullups': 'Pull Up',
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
  'rope pushdown': 'Rope Pushdown',
  'rope push down': 'Rope Pushdown',
  'rope triceps pushdown': 'Rope Pushdown',
  'front shoulder': 'Front Shoulder',
  'ön omuz': 'Front Shoulder',
  'on omuz': 'Front Shoulder',
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

// =====================================================================
// FIREBASE HELPER FUNCTIONS
// =====================================================================

// Cache mekanizması - gereksiz firebase çağrılarını azaltmak için
let cachedData = {
  exercises: null,
  workouts: null,
  bodyWeight: null,
  improvements: null,
  lastFetch: {
    exercises: 0,
    workouts: 0,
    bodyWeight: 0,
    improvements: 0,
  }
};

const CACHE_DURATION = 5000; // 5 saniye cache

// Firebase'den veri okuma helper fonksiyonu
async function getFirebaseData(path) {
  try {
    console.log(`Firebase'den okunuyor: ${path}`);
    const dataRef = ref(database, path);
    const snapshot = await get(dataRef);
    const exists = snapshot.exists();
    const data = exists ? snapshot.val() : null;
    console.log(`Firebase okuma sonucu (${path}): exists=${exists}, data=`, data);
    return data;
  } catch (error) {
    console.error(`Firebase'den veri okunurken hata (${path}):`, error);
    // Fallback: LocalStorage'dan oku
    return getFallbackFromLocalStorage(path);
  }
}

// Firebase'e veri yazma helper fonksiyonu
async function setFirebaseData(path, data) {
  try {
    console.log(`Firebase'e yazılıyor: ${path}`, data);
    const dataRef = ref(database, path);
    await set(dataRef, data);
    console.log(`Firebase yazma başarılı: ${path}`);
    // Cache'i güncelle
    updateCache(path, data);
    console.log(`Cache güncellendi: ${path}`);
  } catch (error) {
    console.error(`Firebase'e veri yazılırken hata (${path}):`, error);
    // Fallback: LocalStorage'a yaz
    setFallbackToLocalStorage(path, data);
  }
}

// Firebase'den veri silme
async function removeFirebaseData(path) {
  try {
    const dataRef = ref(database, path);
    await remove(dataRef);
  } catch (error) {
    console.error(`Firebase'den veri silinirken hata (${path}):`, error);
  }
}

// Cache güncelleme
function updateCache(path, data) {
  const now = Date.now();
  if (path.includes(STORAGE.EXERCISES)) {
    cachedData.exercises = data;
    cachedData.lastFetch.exercises = now;
  } else if (path.includes(STORAGE.WORKOUTS)) {
    cachedData.workouts = data;
    cachedData.lastFetch.workouts = now;
  } else if (path.includes(STORAGE.BODY_WEIGHT)) {
    cachedData.bodyWeight = data;
    cachedData.lastFetch.bodyWeight = now;
  } else if (path.includes(STORAGE.IMPROVEMENTS)) {
    cachedData.improvements = data;
    cachedData.lastFetch.improvements = now;
  }
}

// Cache kontrolü
function isCacheValid(type) {
  const now = Date.now();
  return (now - cachedData.lastFetch[type]) < CACHE_DURATION;
}

// Cache temizleme
export function clearCache() {
  console.log('Cache temizleniyor...');
  cachedData.exercises = null;
  cachedData.workouts = null;
  cachedData.bodyWeight = null;
  cachedData.improvements = null;
  cachedData.lastFetch = {
    exercises: 0,
    workouts: 0,
    bodyWeight: 0,
    improvements: 0,
  };
  console.log('Cache temizlendi');
}

// LocalStorage fallback - offline çalışma için
function getFallbackFromLocalStorage(path) {
  try {
    const data = localStorage.getItem(path);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn('LocalStorage fallback okuma hatası:', err);
    return null;
  }
}

function setFallbackToLocalStorage(path, data) {
  try {
    localStorage.setItem(path, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage fallback yazma hatası:', err);
  }
}

// =====================================================================
// BODY WEIGHT FUNCTIONS
// =====================================================================

async function getBodyWeightMap() {
  // Cache kontrolü
  if (cachedData.bodyWeight && isCacheValid('bodyWeight')) {
    return cachedData.bodyWeight;
  }

  const data = await getFirebaseData(STORAGE.BODY_WEIGHT);
  const map = data && typeof data === 'object' ? data : {};
  updateCache(STORAGE.BODY_WEIGHT, map);
  return map;
}

async function setBodyWeightMap(map) {
  await setFirebaseData(STORAGE.BODY_WEIGHT, map);
}

export async function getBodyWeightCollection() {
  const map = await getBodyWeightMap();
  return { ...map };
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

// =====================================================================
// IMPROVEMENTS FUNCTIONS
// =====================================================================

function generateImprovementId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `imp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getImprovementsMap() {
  if (cachedData.improvements && isCacheValid('improvements')) {
    return cachedData.improvements;
  }

  const data = await getFirebaseData(STORAGE.IMPROVEMENTS);
  const map = data && typeof data === 'object' ? data : {};
  updateCache(STORAGE.IMPROVEMENTS, map);
  return map;
}

async function setImprovementsMap(map) {
  await setFirebaseData(STORAGE.IMPROVEMENTS, map);
}

export async function getImprovements() {
  const map = await getImprovementsMap();
  return Object.values(map)
    .filter((item) => item && typeof item === 'object' && item.id)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getImprovementById(id) {
  if (!id) return null;
  const map = await getImprovementsMap();
  return map[id] || null;
}

export async function saveImprovement(note) {
  if (!note || typeof note !== 'object') return null;

  const map = await getImprovementsMap();
  const now = Date.now();
  const id = typeof note.id === 'string' && note.id.trim().length > 0
    ? note.id.trim()
    : generateImprovementId();
  const existing = map[id] || null;

  const record = {
    id,
    title: typeof note.title === 'string' ? note.title.trim() : '',
    content: typeof note.content === 'string' ? note.content.trim() : '',
    isCompleted: typeof note.isCompleted === 'boolean' ? note.isCompleted : (existing?.isCompleted || false),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  map[id] = record;
  await setImprovementsMap(map);
  return record;
}

export async function deleteImprovement(id) {
  if (!id) return;
  const map = await getImprovementsMap();
  if (Object.prototype.hasOwnProperty.call(map, id)) {
    delete map[id];
    await setImprovementsMap(map);
  }
}

export const updateImprovement = saveImprovement;

// =====================================================================
// EXERCISE NORMALIZATION
// =====================================================================

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
    
    console.log(`normalizeWorkoutItems: İşleniyor - ${rawName}, sets: ${(item.sets || []).length}`);
    
    const normalizedSets = (item.sets || []).map((set) => {
      const rawWeight = set?.wDisplay ?? set?.weightDisplay ?? set?.w ?? '';
      const { value, display } = resolveWeightValue(rawWeight, rawName, item.dateISO || item.dateIso || item.date || null);
      return {
        w: value,
        wDisplay: display,
        r: Number(set?.r || 0),
        note: set?.note || '',
      };
    }).filter((set) => {
      // Tekrar kontrolü
      if (!Number.isFinite(set.r) || set.r <= 0) {
        console.warn(`Set filtrelendi (geçersiz tekrar): ${rawName}`, set);
        return false;
      }
      
      // Ağırlık kontrolü - Body Weight veya geçerli sayı olmalı
      const isBodyWeight = set.wDisplay && (set.wDisplay === 'Body Weight' || set.wDisplay.startsWith('BW'));
      const hasValidWeight = Number.isFinite(set.w) && set.w > 0;
      
      if (!isBodyWeight && !hasValidWeight) {
        console.warn(`Set filtrelendi (geçersiz ağırlık): ${rawName}`, set);
        return false;
      }
      
      return true;
    });

    console.log(`normalizeWorkoutItems: ${rawName} - ${normalizedSets.length} set kabul edildi`);

    const { dateISO: _ignoreDateISO, dateIso: _ignoreDateIso, date: _ignoreDate, ...restItem } = item;
    const cleanedItem = {
      ...restItem,
      name: rawName,
      displayName: rawName,
      canonicalName: canonical,
      // Egzersiz seti olmasa bile (örn. planlandı ama yapılmadı) kayıtta tutuyoruz.
      sets: normalizedSets,
    };

    if (!map[key]) {
      map[key] = cleanedItem;
    } else {
      const existing = map[key];
      const mergedSets = [...(existing.sets || []), ...normalizedSets];
      map[key] = {
        ...existing,
        ...cleanedItem,
        sets: mergedSets,
      };
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

// =====================================================================
// EXERCISES FUNCTIONS
// =====================================================================

export async function getExercises() {
  // Cache kontrolü
  if (cachedData.exercises && isCacheValid('exercises')) {
    return cachedData.exercises;
  }

  const data = await getFirebaseData(STORAGE.EXERCISES);
  
  if (data && Array.isArray(data)) {
    const normalized = normalizeExerciseList(data);
    updateCache(STORAGE.EXERCISES, normalized);
    return normalized;
  }

  // İlk kez çalıştırılıyorsa seed data ekle
  const seed = [
    { name: 'Bench Press', displayName: 'Bench Press', canonicalName: 'Bench Press', createdAt: Date.now(), used: 0, pr: 100 },
    { name: 'Squat', displayName: 'Squat', canonicalName: 'Squat', createdAt: Date.now(), used: 0, pr: 120 },
    { name: 'Deadlift', displayName: 'Deadlift', canonicalName: 'Deadlift', createdAt: Date.now(), used: 0, pr: 150 },
    { name: 'Overhead Press', displayName: 'Overhead Press', canonicalName: 'Overhead Press', createdAt: Date.now(), used: 0, pr: 60 },
    { name: 'Pull Up', displayName: 'Pull Up', canonicalName: 'Pull Up', createdAt: Date.now(), used: 0, pr: 0, prReps: 12 },
  ];
  await setFirebaseData(STORAGE.EXERCISES, seed);
  updateCache(STORAGE.EXERCISES, seed);
  return seed;
}

export async function saveExercises(list) {
  const normalized = normalizeExerciseList(list);
  await setFirebaseData(STORAGE.EXERCISES, normalized);
}

export async function renameExerciseEverywhere(oldName, newDisplayName, newCanonicalName) {
  const oldCanonical = normalizeExerciseName(oldName);
  const nextDisplay = (newDisplayName || '').trim() || oldCanonical;
  const nextCanonical = normalizeExerciseName(newCanonicalName || newDisplayName || oldName);

  if (!nextCanonical) {
    return;
  }

  const all = await getWorkouts();
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
    await setFirebaseData(STORAGE.WORKOUTS, all);
  }
}

export async function ensureExercise(name) {
  const canonical = normalizeExerciseName(name);
  if (!canonical) return;

  const list = await getExercises();
  if (!list.some((e) => e.name.toLowerCase() === canonical.toLowerCase())) {
    list.push({ name: canonical, createdAt: Date.now(), used: 0 });
    await saveExercises(list);
  }
}

export async function updateExercisePR(name, prWeight, prReps) {
  const canonical = normalizeExerciseName(name);
  if (!canonical) return;

  const list = await getExercises();
  const item = list.find((e) => e.name.toLowerCase() === canonical.toLowerCase());
  if (item) {
    if (typeof prWeight === 'number' && prWeight > (item.pr || 0)) item.pr = prWeight;
    if (typeof prReps === 'number' && prReps > (item.prReps || 0)) item.prReps = prReps;
    item.used = (item.used || 0) + 1;
    await saveExercises(list);
  }
}

// =====================================================================
// WORKOUTS FUNCTIONS
// =====================================================================

export async function getWorkouts() {
  console.log('getWorkouts çağrıldı');
  
  // Cache kontrolü
  if (cachedData.workouts && isCacheValid('workouts')) {
    console.log('getWorkouts: Cache\'den döndürülüyor, sayı:', Object.keys(cachedData.workouts || {}).length);
    return cachedData.workouts;
  }

  console.log('getWorkouts: Firebase\'den çekiliyor...');
  const data = await getFirebaseData(STORAGE.WORKOUTS);
  console.log('getWorkouts: Firebase\'den gelen data:', data ? Object.keys(data).length : 0, 'gün');
  
  if (data && typeof data === 'object') {
    const normalized = normalizeWorkoutCollection(data);
    console.log('getWorkouts: Normalize edildi:', Object.keys(normalized).length, 'gün');
    updateCache(STORAGE.WORKOUTS, normalized);
    return normalized;
  }

  console.log('getWorkouts: Veri yok, seed data oluşturuluyor...');
  // İlk kez çalıştırılıyorsa örnek veri ekle
  const today = new Date();
  const yday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const seedData = {};
  seedData[toISODate(yday)] = {
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
  const normalizedSeed = normalizeWorkoutCollection(seedData);
  await setFirebaseData(STORAGE.WORKOUTS, normalizedSeed);
  updateCache(STORAGE.WORKOUTS, normalizedSeed);
  console.log('getWorkouts: Seed data oluşturuldu');
  return normalizedSeed;
}

export async function getWorkoutByDate(dateISO) {
  console.log('getWorkoutByDate çağrıldı:', dateISO);
  const all = await getWorkouts();
  console.log('Tüm workouts:', Object.keys(all || {}).length, 'gün');
  const result = all[dateISO];
  console.log('getWorkoutByDate sonuç:', dateISO, result);
  return result;
}

export async function saveWorkout(workout) {
  if (!workout || !workout.dateISO) {
    console.warn('saveWorkout: Geçersiz workout verisi', workout);
    return;
  }

  console.log('saveWorkout çağrıldı:', workout.dateISO, workout);

  // Body Weight değerini al
  const bodyWeightInfo = await getBodyWeightInfo(workout.dateISO);
  const bodyWeightKg = bodyWeightInfo.value || 0;
  console.log('Body Weight:', bodyWeightKg, 'kg');

  // Items'ı normalize et ve Body Weight setlerini gerçek değere çevir
  const normalizedItems = normalizeWorkoutItems((workout.items || []).map((it) => ({ ...it, dateISO: workout.dateISO })));
  
  // Body Weight setlerini gerçek kg değerine çevir
  const resolvedItems = normalizedItems.map(item => ({
    ...item,
    sets: item.sets.map(set => {
      // Body Weight set'i mi?
      if (set.wDisplay === 'Body Weight') {
        return {
          ...set,
          w: bodyWeightKg,
          wDisplay: 'Body Weight',
        };
      }
      // BW+X formatı mı?
      if (set.wDisplay && set.wDisplay.startsWith('BW+')) {
        const additional = set.w; // resolveWeightValue zaten ek değeri w'ye koymuş
        return {
          ...set,
          w: bodyWeightKg + additional,
          wDisplay: set.wDisplay,
        };
      }
      // Normal set
      return set;
    })
  }));

  const normalizedWorkout = {
    ...workout,
    dateISO: workout.dateISO,
    workoutName: workout.workoutName || '',
    workoutFocus: Array.isArray(workout.workoutFocus) ? workout.workoutFocus : [],
    workoutFuel: workout.workoutFuel || '',
    notes: typeof workout.notes === 'string' ? workout.notes : '',
    items: resolvedItems,
  };

  console.log('Normalized workout:', normalizedWorkout);

  const all = await getWorkouts();
  console.log('Mevcut workouts sayısı:', Object.keys(all || {}).length);
  
  all[normalizedWorkout.dateISO] = normalizedWorkout;
  console.log('Workout eklendi, yeni sayı:', Object.keys(all).length);
  
  await setFirebaseData(STORAGE.WORKOUTS, all);
  console.log('Firebase\'e yazıldı:', normalizedWorkout.dateISO);

  // PR güncellemeleri
  for (const it of normalizedWorkout.items) {
    const canonical = it.canonicalName || normalizeExerciseName(it.name);
    await ensureExercise(canonical);
    const maxW = it.sets.reduce((m, s) => Math.max(m, Number(s.w || 0)), 0);
    const maxR = it.sets.reduce((m, s) => Math.max(m, Number(s.r || 0)), 0);
    await updateExercisePR(canonical, maxW, maxR);
  }
  
  console.log('saveWorkout tamamlandı:', normalizedWorkout.dateISO);
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

  console.log('resolveWeightValue:', { 
    raw, 
    exerciseName, 
    normalizedName, 
    lower, 
    isBodyWeightKeyword, 
    isBodyWeightExercise 
  });

  if (isBodyWeightKeyword || isBodyWeightExercise || lower.startsWith('+')) {
    // NOT: Bu fonksiyon sync olduğu için burada await kullanamıyoruz
    // Body weight hesaplamaları için normalizeWorkoutItems içinde çözülmeli
    const plusIndex = raw.indexOf('+');
    let additional = 0;

    if (plusIndex !== -1) {
      const extraPart = raw.slice(plusIndex + 1).replace(',', '.').trim();
      const parsedExtra = parseFloat(extraPart);
      if (Number.isFinite(parsedExtra)) {
        additional = parsedExtra;
        value = additional;
        display = `BW+${formatNumber(additional)}`;
      }
    } else {
      display = 'Body Weight';
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

export async function deleteWorkout(dateISO) {
  const all = await getWorkouts();
  delete all[dateISO];
  await setFirebaseData(STORAGE.WORKOUTS, all);
}

export async function exportAllData() {
  try {
    const exercises = await getFirebaseData(STORAGE.EXERCISES);
    const workouts = await getFirebaseData(STORAGE.WORKOUTS);
    const bodyWeight = await getFirebaseData(STORAGE.BODY_WEIGHT);
    const improvements = await getFirebaseData(STORAGE.IMPROVEMENTS);

    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      exercises: exercises || [],
      workouts: workouts || {},
      bodyWeight: bodyWeight || {},
      improvements: improvements || {},
    };

    return payload;
  } catch (err) {
    console.error('Export error', err);
    return null;
  }
}

export async function importAllData(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Geçersiz veri paketi.');
  }

  const { exercises, workouts, bodyWeight, improvements } = payload;

  if (exercises !== undefined) {
    if (!Array.isArray(exercises)) {
      throw new Error('Exercises listesi geçersiz.');
    }
    await saveExercises(exercises);
  }

  if (workouts !== undefined) {
    if (!workouts || typeof workouts !== 'object') {
      throw new Error('Workouts verisi geçersiz.');
    }
    const normalized = normalizeWorkoutCollection(workouts);
    await setFirebaseData(STORAGE.WORKOUTS, normalized);
  }

  if (bodyWeight !== undefined) {
    if (!bodyWeight || typeof bodyWeight !== 'object') {
      throw new Error('Body weight verisi geçersiz.');
    }
    await setBodyWeightMap(bodyWeight);
  }

  if (improvements !== undefined) {
    if (!improvements || typeof improvements !== 'object') {
      throw new Error('Geliştirmeler verisi geçersiz.');
    }
    await setImprovementsMap(improvements);
  }
}

// =====================================================================
// DATE HELPERS
// =====================================================================

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

// =====================================================================
// REALTIME LISTENERS (Opsiyonel - canlı senkronizasyon için)
// =====================================================================

export function subscribeToExercises(callback) {
  const exercisesRef = ref(database, STORAGE.EXERCISES);
  return onValue(exercisesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const normalized = normalizeExerciseList(data);
      updateCache(STORAGE.EXERCISES, normalized);
      callback(normalized);
    }
  });
}

export function subscribeToWorkouts(callback) {
  const workoutsRef = ref(database, STORAGE.WORKOUTS);
  return onValue(workoutsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const normalized = normalizeWorkoutCollection(data);
      updateCache(STORAGE.WORKOUTS, normalized);
      callback(normalized);
    }
  });
}

export function subscribeToBodyWeight(callback) {
  const bodyWeightRef = ref(database, STORAGE.BODY_WEIGHT);
  return onValue(bodyWeightRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      updateCache(STORAGE.BODY_WEIGHT, data);
      callback(data);
    }
  });
}

export function subscribeToImprovements(callback) {
  const improvementsRef = ref(database, STORAGE.IMPROVEMENTS);
  return onValue(improvementsRef, (snapshot) => {
    const data = snapshot.val();
    const map = data && typeof data === 'object' ? data : {};
    updateCache(STORAGE.IMPROVEMENTS, map);
    const list = Object.values(map)
      .filter((item) => item && typeof item === 'object' && item.id)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    callback(list);
  });
}
